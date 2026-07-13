import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const requiredEnv = [
  'SUPABASE_URL',
  'SUPABASE_SECRET_KEY',
  'BOOTSTRAP_WILSON_PASSWORD',
  'BOOTSTRAP_JAILSON_PASSWORD',
  'BOOTSTRAP_TESTE_PASSWORD',
];

export function getBootstrapUsers() {
  return [
    {
      nome: 'Wilson Peixoto',
      email: 'wilson.peixoto@rioeduca.net',
      nivel: 'administrador',
      passwordEnv: 'BOOTSTRAP_WILSON_PASSWORD',
    },
    {
      nome: 'Jailson B. Silva',
      email: 'jailsonbsilva@rioeduca.net',
      nivel: 'administrador',
      passwordEnv: 'BOOTSTRAP_JAILSON_PASSWORD',
    },
    {
      nome: 'Perfil de teste',
      email: 'teste@rioeduca.net',
      nivel: 'editor',
      passwordEnv: 'BOOTSTRAP_TESTE_PASSWORD',
    },
  ];
}

export function readBootstrapEnv(env) {
  const result = {};

  for (const key of requiredEnv) {
    const value = env[key]?.trim();
    if (!value) throw new Error(`Variável obrigatória ausente: ${key}`);
    result[key] = value;
  }

  const passwords = getBootstrapUsers().map((definition) => result[definition.passwordEnv]);
  if (new Set(passwords).size !== passwords.length) {
    throw new Error('As senhas iniciais dos usuários do bootstrap devem ser distintas.');
  }

  return result;
}

export function loadInitialDemandas(sourcePath) {
  const source = readFileSync(sourcePath, 'utf8');
  const match = source.match(/export const initialDemandas:[^=]+=\s*(\[[\s\S]*\]);?\s*$/);
  if (!match) throw new Error('Não foi possível ler src/data/initialDemandas.ts.');
  return JSON.parse(match[1]);
}

function toDatabaseDate(value) {
  if (!value || value === 'dd/mm/aaaa') return null;

  const normalized = String(value).trim();
  const match = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) throw new Error(`Data inválida no bootstrap: ${normalized}`);

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    throw new Error(`Data inexistente no bootstrap: ${normalized}`);
  }

  return `${yearText}-${monthText}-${dayText}`;
}

export async function ensureUsers(client, env) {
  const { data, error } = await client.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  const knownUsers = [...data.users];

  for (const definition of getBootstrapUsers()) {
    let user = knownUsers.find(
      (candidate) => candidate.email?.toLowerCase() === definition.email.toLowerCase(),
    );

    if (!user) {
      const result = await client.auth.admin.createUser({
        email: definition.email,
        password: env[definition.passwordEnv],
        email_confirm: true,
        user_metadata: {
          nome: definition.nome,
          bootstrap_password_change_required: true,
        },
      });

      if (result.error || !result.data.user) {
        throw result.error ?? new Error(`Falha ao criar ${definition.email}.`);
      }

      user = result.data.user;
      knownUsers.push(user);
      console.log(`Conta criada: ${definition.email}`);
    } else {
      const result = await client.auth.admin.updateUserById(user.id, {
        email_confirm: true,
        user_metadata: { ...user.user_metadata, nome: definition.nome },
      });
      if (result.error) throw result.error;
    }

    const { data: existingProfile, error: profileCheckError } = await client
      .from('perfis_usuarios')
      .select('id, nivel, status')
      .eq('id', user.id)
      .maybeSingle();

    if (profileCheckError) throw profileCheckError;

    if (!existingProfile) {
      const { error: profileError } = await client.from('perfis_usuarios').insert({
        id: user.id,
        nome: definition.nome,
        email: definition.email,
        setor: 'E/CTRH',
        nivel: definition.nivel,
        status: 'ativo',
      });
      if (profileError) throw profileError;
    } else if (existingProfile.nivel === 'leitor' && existingProfile.status === 'pendente') {
      const { error: profileError } = await client.from('perfis_usuarios').update({
        setor: 'E/CTRH',
        nivel: definition.nivel,
        status: 'ativo',
      }).eq('id', user.id);
      if (profileError) throw profileError;
      console.log(`Perfil promovido: ${definition.email} -> ${definition.nivel}`);
    } else {
      console.log(`Perfil existente preservado: ${definition.email}`);
    }
  }

  return knownUsers;
}

export async function importDemandas(client, demandas, actorId) {
  let created = 0;

  for (const demanda of demandas) {
    const { data, error } = await client.rpc('bootstrap_importar_demanda', {
      p_numero: demanda.numero,
      p_tipo: demanda.tipo,
      p_assunto: demanda.assunto,
      p_responsavel: demanda.responsavel ?? '',
      p_limite1: toDatabaseDate(demanda.limite1),
      p_limite2: toDatabaseDate(demanda.limite2),
      p_status: demanda.status,
      p_setor: demanda.setor ?? '',
      p_classificacao: demanda.classificacao ?? '',
      p_actor_id: actorId,
    });

    if (error) throw error;
    if (data === true) created += 1;
  }

  return created;
}

export async function runBootstrap(client, env, demandas) {
  const users = await ensureUsers(client, env);
  const actor = users.find(
    (user) => user.email?.toLowerCase() === 'wilson.peixoto@rioeduca.net',
  );
  if (!actor) throw new Error('Administrador Wilson Peixoto não encontrado.');

  return importDemandas(client, demandas, actor.id);
}

async function main() {
  const env = readBootstrapEnv(process.env);
  const client = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const here = dirname(fileURLToPath(import.meta.url));
  const demandas = loadInitialDemandas(resolve(here, '..', 'src', 'data', 'initialDemandas.ts'));
  const created = await runBootstrap(client, env, demandas);
  console.log(`Bootstrap concluído: ${getBootstrapUsers().length} perfis preparados e ${created} demandas novas importadas.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`Falha no bootstrap: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
    process.exitCode = 1;
  });
}

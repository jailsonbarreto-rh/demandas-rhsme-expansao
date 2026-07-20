import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HASH_PATTERN = /^[0-9a-f]{64}$/;

export function validateDryRunEnvironment(environment) {
  const url = environment.SUPABASE_URL?.trim();
  const secretKey = environment.SUPABASE_SECRET_KEY?.trim();
  const actorId = environment.MIGRATION_ACTOR_ID?.trim();

  if (!url) throw new Error('Defina SUPABASE_URL no ambiente administrativo.');
  if (!secretKey) throw new Error('Defina SUPABASE_SECRET_KEY no ambiente administrativo.');
  if (!actorId) throw new Error('Defina MIGRATION_ACTOR_ID com o UUID de um administrador ativo.');
  if (!UUID_PATTERN.test(actorId)) throw new Error('MIGRATION_ACTOR_ID deve ser um UUID válido.');

  return { url, secretKey, actorId };
}

export function buildDryRunArgs({ payload, manifest, actorId }) {
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error('O payload deve conter ao menos um registro pronto.');
  }
  if (!HASH_PATTERN.test(manifest.sourceAggregateSha256 ?? '')) {
    throw new Error('O manifesto contém hash agregado de origem inválido.');
  }
  if (!HASH_PATTERN.test(manifest.payloadSha256 ?? '')) {
    throw new Error('O manifesto contém hash do payload inválido.');
  }
  if (!UUID_PATTERN.test(actorId ?? '')) {
    throw new Error('O ator da migração deve ser um UUID válido.');
  }

  return {
    p_lote: payload,
    p_source_hash: manifest.sourceAggregateSha256,
    p_client_payload_hash: manifest.payloadSha256,
    p_expected_server_payload_hash: null,
    p_expected_count: payload.length,
    p_expected_db_fingerprint: null,
    p_expected_historico_fingerprint: null,
    p_actor_id: actorId,
    p_apply: false,
  };
}

export async function runDryRun({ client, payload, manifest, actorId, receiptPath }) {
  const args = buildDryRunArgs({ payload, manifest, actorId });
  const { data, error } = await client.rpc('importar_sme_demandas_lote', args);
  if (error) throw new Error(`Dry-run rejeitado pelo Supabase: ${error.message}`);
  if (!data || data.status !== 'dry_run_ok') {
    throw new Error(`Resposta inesperada do dry-run: ${JSON.stringify(data)}`);
  }

  const receipt = {
    version: 1,
    generatedAt: new Date().toISOString(),
    actorId,
    request: {
      apply: false,
      expectedCount: args.p_expected_count,
      sourceHash: args.p_source_hash,
      payloadHash: args.p_client_payload_hash,
    },
    response: data,
  };

  await mkdir(dirname(receiptPath), { recursive: true });
  await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  return receipt;
}

function parseArguments(argv) {
  let directory = '.migration/legacy';
  let receiptName = 'dry-run-receipt.json';

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--dir') {
      directory = argv[++index];
    } else if (argument === '--receipt') {
      receiptName = argv[++index];
    } else if (argument === '--help') {
      return { help: true, directory, receiptName };
    } else {
      throw new Error(`Opção desconhecida: ${argument}`);
    }
  }

  if (!directory) throw new Error('Informe um valor para --dir.');
  if (!receiptName) throw new Error('Informe um valor para --receipt.');
  return { help: false, directory, receiptName };
}

function printHelp() {
  console.log(`
Dry-run da migração legada no Supabase

Variáveis obrigatórias:
  SUPABASE_URL
  SUPABASE_SECRET_KEY
  MIGRATION_ACTOR_ID

Uso:
  npm run migration:dry-run -- [--dir .migration/legacy] [--receipt dry-run-receipt.json]

O comando sempre envia p_apply=false. Ele não grava demandas.
`);
}

export async function runDryRunCli(argv, environment = process.env) {
  const options = parseArguments(argv);
  if (options.help) {
    printHelp();
    return 0;
  }

  const { url, secretKey, actorId } = validateDryRunEnvironment(environment);
  const directory = resolve(options.directory);
  const payload = JSON.parse(await readFile(join(directory, 'payload.json'), 'utf8'));
  const manifest = JSON.parse(await readFile(join(directory, 'manifest.json'), 'utf8'));
  if ((manifest.summary?.blockingIssues ?? 0) > 0) {
    throw new Error('O manifesto registra pendências impeditivas. Corrija-as antes do dry-run.');
  }

  const client = createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  const receiptPath = join(directory, options.receiptName);
  const receipt = await runDryRun({ client, payload, manifest, actorId, receiptPath });

  console.log('\nDry-run aprovado pelo Supabase.');
  console.log(`Registros validados: ${receipt.response.validated_count}`);
  console.log(`Hash do lote no servidor: ${receipt.response.batch_hash}`);
  console.log(`Recibo: ${receiptPath}`);
  return 0;
}

const isDirectExecution = process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectExecution) {
  runDryRunCli(process.argv.slice(2))
    .then((exitCode) => {
      process.exitCode = exitCode;
    })
    .catch((error) => {
      console.error(`Falha no dry-run: ${error.message}`);
      process.exitCode = 1;
    });
}

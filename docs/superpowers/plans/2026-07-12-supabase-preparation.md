# Supabase Preparation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preparar e publicar uma integração Supabase completa e desativada por padrão, preservando integralmente o modo local, a aparência atual e o login de teste.

**Architecture:** A aplicação selecionará em tempo de execução um backend local ou Supabase por uma configuração discriminada. Ambos implementarão contratos assíncronos comuns para autenticação, demandas e perfis; o frontend continuará usando os mesmos componentes e tipos visuais. O schema remoto terá RLS, perfis, RPCs atômicas e um bootstrap administrativo separado do bundle do navegador.

**Tech Stack:** React 19, TypeScript 5.7, Vite 6, Supabase JS 2.110, PostgreSQL/Supabase Auth, Vitest 4.1, Testing Library 16.3, jsdom 29.1.

## Global Constraints

- `VITE_APP_MODE` ausente ou igual a `local` deve preservar o comportamento atual.
- O modo Supabase só pode iniciar com `VITE_APP_MODE=supabase`, `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` válidos.
- Não alterar `src/index.css`, a estrutura visual dos componentes ou a cópia exibida no modo local, exceto mensagens de erro necessárias.
- O login local de `teste@rioeduca.net` com a credencial atual deve continuar funcionando.
- Nunca gravar a senha temporária, `service_role`, chave secreta ou credencial administrativa em arquivo rastreado.
- Wilson e Jailson serão administradores ativos; o perfil de teste será editor ativo.
- Novos usuários `@rioeduca.net` serão criados como pendentes.
- Todas as tabelas no schema exposto `public` devem ter RLS e privilégios explícitos.
- Toda função `SECURITY DEFINER` deve ficar em schema privado, usar `search_path = ''`, verificar `auth.uid()` quando chamada por usuário e revogar `EXECUTE` de `PUBLIC`.
- Cada tarefa funcional segue RED → GREEN → REFACTOR e termina com testes frescos.

---

### Task 1: Harness de testes e configuração segura de modo

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `vite.config.ts`
- Modify: `src/vite-env.d.ts`
- Create: `src/test/setup.ts`
- Create: `src/config/appConfig.ts`
- Test: `src/config/appConfig.test.ts`

**Interfaces:**
- Produces: `resolveAppConfig(env): AppConfig`
- Produces: `AppConfig = LocalAppConfig | SupabaseAppConfig | InvalidAppConfig`

- [ ] **Step 1: instalar o harness com versões fixas**

Run:

```bash
npm install --save-exact @supabase/supabase-js@2.110.1
npm install --save-dev --save-exact vitest@4.1.10 jsdom@29.1.1 @testing-library/react@16.3.2 @testing-library/user-event@14.6.1 @testing-library/jest-dom@6.9.1
```

Add scripts:

```json
{
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 2: escrever os testes de configuração que falham**

```ts
import { describe, expect, it } from 'vitest';
import { resolveAppConfig } from './appConfig';

describe('resolveAppConfig', () => {
  it('mantém modo local quando não há configuração', () => {
    expect(resolveAppConfig({})).toEqual({ mode: 'local' });
  });

  it('retorna configuração Supabase completa', () => {
    expect(resolveAppConfig({
      VITE_APP_MODE: 'supabase',
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
    })).toEqual({
      mode: 'supabase',
      supabaseUrl: 'https://example.supabase.co',
      supabasePublishableKey: 'sb_publishable_example',
    });
  });

  it('não faz fallback silencioso quando Supabase foi solicitado sem credenciais', () => {
    expect(resolveAppConfig({ VITE_APP_MODE: 'supabase' })).toEqual({
      mode: 'invalid',
      message: 'Configuração Supabase incompleta: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY.',
    });
  });
});
```

- [ ] **Step 3: executar RED**

Run: `npm test -- src/config/appConfig.test.ts`

Expected: FAIL porque `appConfig.ts` ainda não existe.

- [ ] **Step 4: implementar a configuração mínima**

```ts
export type AppConfig =
  | { mode: 'local' }
  | { mode: 'supabase'; supabaseUrl: string; supabasePublishableKey: string }
  | { mode: 'invalid'; message: string };

type PublicEnv = Record<string, string | undefined>;

export function resolveAppConfig(env: PublicEnv): AppConfig {
  if (!env.VITE_APP_MODE || env.VITE_APP_MODE === 'local') return { mode: 'local' };
  if (env.VITE_APP_MODE !== 'supabase') {
    return { mode: 'invalid', message: `Modo de aplicação inválido: ${env.VITE_APP_MODE}.` };
  }

  const missing = [
    !env.VITE_SUPABASE_URL && 'VITE_SUPABASE_URL',
    !env.VITE_SUPABASE_PUBLISHABLE_KEY && 'VITE_SUPABASE_PUBLISHABLE_KEY',
  ].filter(Boolean);

  if (missing.length) {
    return { mode: 'invalid', message: `Configuração Supabase incompleta: ${missing.join(', ')}.` };
  }

  return {
    mode: 'supabase',
    supabaseUrl: env.VITE_SUPABASE_URL!,
    supabasePublishableKey: env.VITE_SUPABASE_PUBLISHABLE_KEY!,
  };
}
```

Configure Vitest with `environment: 'jsdom'`, `setupFiles: './src/test/setup.ts'`, and import `@testing-library/jest-dom/vitest` in the setup.

- [ ] **Step 5: executar GREEN e build**

Run: `npm test -- src/config/appConfig.test.ts && npm run build`

Expected: 3 tests PASS; build exit 0 without Supabase env.

- [ ] **Step 6: commit**

```bash
git add package.json package-lock.json vite.config.ts src/vite-env.d.ts src/test src/config
git commit -m "test: adicionar configuração segura de backend"
```

---

### Task 2: Contratos, adaptadores e repositório local compatível

**Files:**
- Modify: `src/types.ts`
- Create: `src/services/contracts.ts`
- Create: `src/services/dataMappers.ts`
- Create: `src/services/localDemandasRepository.ts`
- Test: `src/services/dataMappers.test.ts`
- Test: `src/services/localDemandasRepository.test.ts`

**Interfaces:**
- Produces: `AppData`, `DemandasRepository`, `AuthService`, `ProfilesService`
- Produces: `toDatabaseDate`, `fromDatabaseDate`, `toDemanda`, `toHistorico`
- Produces: `LocalDemandasRepository(storage, initialDemandas)`

- [ ] **Step 1: escrever testes RED dos adaptadores**

```ts
it.each([
  ['30/06/2026', '2026-06-30'],
  ['', null],
  ['dd/mm/aaaa', null],
])('converte %s para data do banco', (input, expected) => {
  expect(toDatabaseDate(input)).toBe(expected);
});

it('mapeia snake_case sem vazar para a interface', () => {
  expect(toHistorico({
    id: 9,
    demanda_id: 3,
    status_novo: 'Tramitado',
    setor: 'CTRH',
    comentario: 'Atualizado',
    created_at: '2026-07-12T12:00:00Z',
  }).demandaId).toBe(3);
});
```

- [ ] **Step 2: executar RED dos adaptadores**

Run: `npm test -- src/services/dataMappers.test.ts`

Expected: FAIL por módulos ausentes.

- [ ] **Step 3: criar contratos e mapeadores mínimos**

```ts
export interface AppData {
  demandas: Demanda[];
  historico: ComentarioHistorico[];
}

export interface DemandasRepository {
  load(): Promise<AppData>;
  create(input: Omit<Demanda, 'id'>): Promise<void>;
  update(id: number, changes: Partial<Demanda>): Promise<void>;
  updateStatus(id: number, status: Demanda['status'], comentario: string): Promise<void>;
  delete(id: number): Promise<void>;
  subscribe(onRemoteChange: () => void): () => void;
}

export interface PerfilUsuario {
  id: string;
  nome: string;
  email: string;
  setor: string;
  nivel: 'administrador' | 'editor' | 'leitor';
  status: 'ativo' | 'pendente' | 'inativo';
}

export interface AppUser {
  id: string;
  email: string;
  perfil: PerfilUsuario;
}

export interface AuthService {
  restore(): Promise<AppUser | null>;
  signIn(email: string, password: string): Promise<AppUser>;
  requestAccess(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  subscribe(onChange: (user: AppUser | null) => void): () => void;
}

export interface ProfilesService {
  list(): Promise<PerfilUsuario[]>;
  updateAccess(
    id: string,
    patch: Partial<Pick<PerfilUsuario, 'nivel' | 'status' | 'setor'>>,
  ): Promise<void>;
}

export function toDatabaseDate(value?: string): string | null {
  if (!value || value === 'dd/mm/aaaa') return null;
  const [day, month, year] = value.split('/');
  return `${year}-${month}-${day}`;
}

export function fromDatabaseDate(value: string | null): string {
  if (!value) return '';
  const [year, month, day] = value.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}
```

- [ ] **Step 4: escrever testes RED do repositório local**

Use um `MemoryStorage` e prove:

```ts
it('preserva as chaves atuais e cria histórico junto com a demanda', async () => {
  const repository = new LocalDemandasRepository(storage, initialDemandas);
  await repository.load();
  await repository.create(novaDemanda);
  expect(JSON.parse(storage.getItem('demandas_data')!)[0].numero).toBe(novaDemanda.numero);
  expect(JSON.parse(storage.getItem('demandas_history')!)[0].comentario)
    .toBe('Demanda cadastrada no sistema.');
});
```

- [ ] **Step 5: executar RED e implementar o repositório local**

Run: `npm test -- src/services/localDemandasRepository.test.ts`

Expected: FAIL antes da classe; depois implementar todas as operações usando exatamente `demandas_data` e `demandas_history`, mantendo a regra atual de inicialização quando há menos de 20 itens.

- [ ] **Step 6: executar GREEN**

Run: `npm test -- src/services/dataMappers.test.ts src/services/localDemandasRepository.test.ts`

Expected: todos PASS.

- [ ] **Step 7: commit**

```bash
git add src/types.ts src/services
git commit -m "refactor: encapsular persistência local"
```

---

### Task 3: Serviços de autenticação local e Supabase

**Files:**
- Replace: `src/lib/supabase.ts`
- Create: `src/services/errors.ts`
- Create: `src/services/localAuthService.ts`
- Create: `src/services/supabaseAuthService.ts`
- Test: `src/services/localAuthService.test.ts`
- Test: `src/services/supabaseAuthService.test.ts`

**Interfaces:**
- Produces: `getSupabaseClient(config: SupabaseAppConfig)`
- Produces: `LocalAuthService`
- Produces: `SupabaseAuthService(client)`
- Produces: `AppUser`, `AccessPendingError`, `InvalidCredentialsError`

- [ ] **Step 1: escrever teste RED do login local preservado**

```ts
it('mantém o login local do perfil de teste', async () => {
  const service = new LocalAuthService(storage);
  const user = await service.signIn('teste@rioeduca.net', 'senha-local-teste');
  expect(user.email).toBe('teste@rioeduca.net');
  expect(storage.getItem('demandas_user')).toBe('teste@rioeduca.net');
});
```

Também testar domínio inválido e senha com menos de 8 caracteres.

- [ ] **Step 2: executar RED e implementar `LocalAuthService`**

Run: `npm test -- src/services/localAuthService.test.ts`

Expected: FAIL antes da classe; depois PASS mantendo o comportamento atual e sem armazenar senha.

- [ ] **Step 3: escrever testes RED do Supabase Auth com cliente falso**

```ts
it('bloqueia perfil pendente depois de credencial válida', async () => {
  const service = new SupabaseAuthService(fakeClientWithPendingProfile);
  await expect(service.signIn('novo@rioeduca.net', 'senha-forte'))
    .rejects.toThrow(AccessPendingError);
  expect(fakeClientWithPendingProfile.auth.signOut).toHaveBeenCalled();
});
```

Testar ainda perfil ativo, erro genérico de credencial, cadastro fora do domínio e `onAuthStateChange` com cleanup.

- [ ] **Step 4: executar RED e implementar serviço Supabase**

Run: `npm test -- src/services/supabaseAuthService.test.ts`

Expected: FAIL antes do serviço; depois implementar `signInWithPassword`, `signUp`, leitura do próprio perfil e `signOut` quando perfil não estiver ativo.

- [ ] **Step 5: tornar o cliente estritamente lazy**

```ts
let client: SupabaseClient | undefined;

export function getSupabaseClient(config: SupabaseAppConfig): SupabaseClient {
  client ??= createClient(config.supabaseUrl, config.supabasePublishableKey);
  return client;
}
```

O módulo não deve ler `import.meta.env` nem criar placeholders.

- [ ] **Step 6: executar GREEN e commit**

Run: `npm test -- src/services/localAuthService.test.ts src/services/supabaseAuthService.test.ts`

```bash
git add src/lib/supabase.ts src/services
git commit -m "feat: preparar autenticação local e Supabase"
```

---

### Task 4: Schema Supabase seguro, RPCs e bootstrap administrativo

**Files:**
- Replace: `supabase/migrations/20260707000000_sme_demandas.sql`
- Create: `scripts/bootstrap-supabase.mjs`
- Create: `.env.bootstrap.example`
- Modify: `.gitignore`
- Modify: `package.json`
- Test: `scripts/bootstrap-supabase.test.ts`
- Test: `supabase/migrations/migration.test.ts`

**Interfaces:**
- Produces RPC: `public.criar_sme_demanda(p_numero text, p_tipo text, p_assunto text, p_responsavel text, p_limite1 date, p_limite2 date, p_status text, p_setor text, p_classificacao text) returns public.sme_demandas`
- Produces RPC: `public.atualizar_status_sme_demanda(p_demanda_id bigint, p_novo_status text, p_comentario text) returns void`
- Consumes bootstrap env: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `BOOTSTRAP_PASSWORD`

- [ ] **Step 1: escrever verificação RED da migração**

```ts
const sql = readFileSync(migrationPath, 'utf8').toLowerCase();

it('protege todas as tabelas públicas com RLS', () => {
  for (const table of ['perfis_usuarios', 'sme_demandas', 'sme_historico']) {
    expect(sql).toContain(`alter table public.${table} enable row level security`);
  }
});

it('não usa user_metadata para autorização', () => {
  expect(sql).not.toContain('raw_user_meta_data->>\'nivel\'');
});

it('revoga execução pública de funções privilegiadas', () => {
  expect(sql).toContain('revoke all on function private.is_admin() from public');
});
```

- [ ] **Step 2: executar RED**

Run: `npm test -- supabase/migrations/migration.test.ts`

Expected: FAIL porque a migração antiga não tem perfis, grants nem helpers seguros.

- [ ] **Step 3: substituir a migração ainda não aplicada**

Implementar, nesta ordem:

```sql
create schema if not exists private;
create table public.perfis_usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  email text not null unique,
  setor text not null default '',
  nivel text not null default 'leitor' check (nivel in ('administrador', 'editor', 'leitor')),
  status text not null default 'pendente' check (status in ('ativo', 'pendente', 'inativo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.sme_demandas (
  id bigint generated by default as identity primary key,
  numero text not null unique,
  tipo text not null check (tipo in ('Expediente', 'Processo', 'Outros')),
  assunto text not null,
  responsavel text not null default '',
  limite1 date,
  limite2 date,
  status text not null check (status in ('Aguardando Andamento', 'Tramitado', 'Para Assinatura', 'Encerrado', 'Sobrestado', 'Ajustar')),
  setor text not null default '',
  classificacao text not null default '',
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.sme_historico (
  id bigint generated by default as identity primary key,
  demanda_id bigint not null references public.sme_demandas(id) on delete cascade,
  status_novo text not null,
  setor text not null default '',
  comentario text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.perfis_usuarios enable row level security;
alter table public.sme_demandas enable row level security;
alter table public.sme_historico enable row level security;
```

Adicionar os helpers com o mesmo padrão abaixo, trocando somente o predicado de nível:

```sql
create or replace function private.is_active()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.perfis_usuarios p
    where p.id = (select auth.uid())
      and p.status = 'ativo'
  );
$$;

create or replace function private.can_edit()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.perfis_usuarios p
    where p.id = (select auth.uid())
      and p.status = 'ativo'
      and p.nivel in ('administrador', 'editor')
  );
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.perfis_usuarios p
    where p.id = (select auth.uid())
      and p.status = 'ativo'
      and p.nivel = 'administrador'
  );
$$;

revoke all on function private.is_active() from public;
revoke all on function private.can_edit() from public;
revoke all on function private.is_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_active() to authenticated;
grant execute on function private.can_edit() to authenticated;
grant execute on function private.is_admin() to authenticated;
```

Criar políticas separadas por operação: `private.is_active()` para leitura, `private.can_edit()` para mutações operacionais e `private.is_admin()` para gerenciamento de perfis. Conceder privilégios explícitos correspondentes e criar as duas RPCs como `SECURITY INVOKER`.

Criar `private.handle_new_user()` para inserir perfil pendente apenas para e-mail terminado em `@rioeduca.net`; `raw_user_meta_data` pode fornecer somente o nome de exibição, nunca nível/status.

- [ ] **Step 4: executar GREEN da migração**

Run: `npm test -- supabase/migrations/migration.test.ts`

Expected: todos PASS.

- [ ] **Step 5: escrever testes RED do bootstrap**

Exportar funções puras de `scripts/bootstrap-supabase.mjs` e testar:

```ts
expect(getBootstrapUsers()).toEqual([
  expect.objectContaining({ email: 'wilson.peixoto@rioeduca.net', nivel: 'administrador' }),
  expect.objectContaining({ email: 'jailsonbsilva@rioeduca.net', nivel: 'administrador' }),
  expect.objectContaining({ email: 'teste@rioeduca.net', nivel: 'editor' }),
]);
expect(() => readBootstrapEnv({})).toThrow('SUPABASE_SECRET_KEY');
```

- [ ] **Step 6: implementar bootstrap sem segredo rastreado**

O script deve:

1. validar as três variáveis;
2. criar cliente com a chave secreta somente no processo Node;
3. localizar/criar cada usuário com `email_confirm: true` e a senha recebida;
4. atualizar `perfis_usuarios` com nível/status;
5. importar `initialDemandas` de forma idempotente por `numero`;
6. criar histórico inicial somente para novas demandas;
7. nunca imprimir senha ou chave.

Add script:

```json
"bootstrap:supabase": "node --env-file=.env.bootstrap scripts/bootstrap-supabase.mjs"
```

Track only:

```dotenv
SUPABASE_URL=
SUPABASE_SECRET_KEY=
BOOTSTRAP_PASSWORD=
```

Ignore `.env.bootstrap` and `.env.bootstrap.local`.

- [ ] **Step 7: executar testes e verificação de segredo**

Run:

```bash
npm test -- scripts/bootstrap-supabase.test.ts supabase/migrations/migration.test.ts
git grep -n "BOOTSTRAP_PASSWORD=.*[^=]\|SUPABASE_SECRET_KEY=.*[^=]\|service_role" -- ':!docs/superpowers' ':!.env.bootstrap.example'
```

Expected: testes PASS; grep não encontra a senha nem uma chave real.

- [ ] **Step 8: commit**

```bash
git add supabase scripts .env.bootstrap.example .gitignore package.json package-lock.json
git commit -m "feat: preparar schema e bootstrap Supabase"
```

---

### Task 5: Repositório Supabase, perfis e Realtime

**Files:**
- Create: `src/lib/database.types.ts`
- Create: `src/services/supabaseDemandasRepository.ts`
- Create: `src/services/supabaseProfilesService.ts`
- Test: `src/services/supabaseDemandasRepository.test.ts`
- Test: `src/services/supabaseProfilesService.test.ts`

**Interfaces:**
- Implements: `DemandasRepository`
- Implements: `ProfilesService`
- Produces: `ProfilesService.list()`, `ProfilesService.updateAccess(id, patch)`

- [ ] **Step 1: escrever testes RED das consultas e RPCs**

```ts
it('cria demanda pela RPC atômica', async () => {
  await repository.create(novaDemanda);
  expect(client.rpc).toHaveBeenCalledWith('criar_sme_demanda', expect.objectContaining({
    p_numero: novaDemanda.numero,
  }));
});

it('altera status pela RPC atômica', async () => {
  await repository.updateStatus(4, 'Tramitado', 'Encaminhado');
  expect(client.rpc).toHaveBeenCalledWith('atualizar_status_sme_demanda', {
    p_demanda_id: 4,
    p_novo_status: 'Tramitado',
    p_comentario: 'Encaminhado',
  });
});
```

- [ ] **Step 2: executar RED e implementar repositório**

Run: `npm test -- src/services/supabaseDemandasRepository.test.ts`

Implementar `load()` com ordenação, mapeadores de data, `update`, `delete` e `subscribe`. O callback Realtime apenas solicita uma releitura; não deve aplicar patches parciais fora de ordem.

- [ ] **Step 3: escrever testes RED de perfis**

Provar que a listagem ordena por nome e que a atualização aceita apenas `nivel`, `status` e `setor`.

- [ ] **Step 4: implementar e executar GREEN**

Run: `npm test -- src/services/supabaseDemandasRepository.test.ts src/services/supabaseProfilesService.test.ts`

Expected: todos PASS e cleanup do channel chamado pela função retornada de `subscribe`.

- [ ] **Step 5: commit**

```bash
git add src/lib/database.types.ts src/services
git commit -m "feat: adicionar serviços de dados Supabase"
```

---

### Task 6: Integrar os dois backends ao App sem alterar a interface local

**Files:**
- Create: `src/services/createAppServices.ts`
- Create: `src/hooks/useAppSession.ts`
- Create: `src/hooks/useDemandasData.ts`
- Modify: `src/App.tsx`
- Test: `src/App.local.test.tsx`
- Test: `src/App.supabase.test.tsx`

**Interfaces:**
- Consumes: `resolveAppConfig`, `AuthService`, `DemandasRepository`, `ProfilesService`
- Produces: hooks com estados `loading`, `error`, `user`, `demandas`, `historico`

- [ ] **Step 1: escrever teste de caracterização RED do modo local**

```tsx
it('mantém login e dashboard local do perfil de teste', async () => {
  render(<App />);
  await user.type(screen.getByPlaceholderText('usuario@rioeduca.net'), 'teste@rioeduca.net');
  await user.type(screen.getByPlaceholderText('••••••••'), 'senha-local-teste');
  await user.click(screen.getByRole('button', { name: /entrar/i }));
  expect(await screen.findByText('Central de Demandas')).toBeInTheDocument();
  expect(localStorage.getItem('demandas_user')).toBe('teste@rioeduca.net');
});
```

Também caracterizar criação, edição/status e logout local antes da refatoração.

- [ ] **Step 2: executar caracterização GREEN no código atual**

Run: `npm test -- src/App.local.test.tsx`

Expected: PASS; esses testes formam a rede de segurança da refatoração.

- [ ] **Step 3: criar fábrica e hooks com dependências injetáveis**

```ts
export function createAppServices(config: AppConfig, storage = window.localStorage): AppServices {
  if (config.mode === 'local') return createLocalServices(storage);
  if (config.mode === 'invalid') throw new ConfigurationError(config.message);
  const client = getSupabaseClient(config);
  return createSupabaseServices(client);
}
```

Os hooks devem restaurar sessão, carregar dados depois do login, assinar Realtime somente no modo Supabase e sempre limpar listeners.

- [ ] **Step 4: refatorar `App.tsx` em pequenos ciclos GREEN**

Substituir:

- inicialização direta de `LocalStorage` por `useDemandasData`;
- handlers locais por métodos assíncronos do repositório;
- login/cadastro/logout simulados por `useAppSession`;
- indicador de ambiente por uma string derivada do modo.

Não alterar JSX estrutural ou classes CSS. Executar `npm test -- src/App.local.test.tsx` após cada grupo.

- [ ] **Step 5: escrever teste RED do modo Supabase**

Injetar serviços falsos e provar que login ativo carrega dados, perfil pendente permanece na tela de login e CRUD chama o repositório remoto.

- [ ] **Step 6: executar GREEN completo e build**

Run: `npm test -- src/App.local.test.tsx src/App.supabase.test.tsx && npm run build`

Expected: todos PASS; build sem env exit 0.

- [ ] **Step 7: commit**

```bash
git add src/App.tsx src/hooks src/services/createAppServices.ts src/App.*.test.tsx
git commit -m "feat: integrar backends local e Supabase"
```

---

### Task 7: Administração real condicionada ao modo Supabase

**Files:**
- Modify: `src/components/AdminPanel.tsx`
- Modify: `src/App.tsx`
- Test: `src/components/AdminPanel.test.tsx`

**Interfaces:**
- Consumes: `PerfilUsuario[]`, `onUpdatePerfil(id, patch)`
- Local mode: no props, uses the existing simulated list unchanged
- Supabase mode: receives real profiles and mutation callback

- [ ] **Step 1: escrever testes RED**

```tsx
it('mantém a lista simulada quando não recebe perfis', () => {
  render(<AdminPanel />);
  expect(screen.getByText('Wilson Peixoto')).toBeInTheDocument();
});

it('permite ao administrador aprovar um perfil real', async () => {
  render(<AdminPanel perfis={[pending]} onUpdatePerfil={onUpdatePerfil} />);
  await user.click(screen.getByRole('button', { name: /aprovar/i }));
  expect(onUpdatePerfil).toHaveBeenCalledWith(pending.id, { status: 'ativo' });
});
```

- [ ] **Step 2: executar RED e implementar controles condicionais**

Run: `npm test -- src/components/AdminPanel.test.tsx`

No modo Supabase, usar os estilos de botões e badges já existentes. Não renderizar os controles no modo local.

- [ ] **Step 3: restringir a aba por perfil**

Em modo Supabase, renderizar a aba Administração somente para `nivel === 'administrador' && status === 'ativo'`. Em modo local, manter a aba como hoje.

- [ ] **Step 4: executar GREEN e commit**

Run: `npm test -- src/components/AdminPanel.test.tsx src/App.local.test.tsx src/App.supabase.test.tsx`

```bash
git add src/components/AdminPanel.tsx src/components/AdminPanel.test.tsx src/App.tsx
git commit -m "feat: conectar administração de perfis"
```

---

### Task 8: Configuração, documentação e CI

**Files:**
- Replace: `.env.example`
- Modify: `README.md`
- Create: `docs/SUPABASE_SETUP.md`
- Modify: `.github/workflows/dependency-health.yml`
- Test: `src/config/envExample.test.ts`

**Interfaces:**
- Documents activation sequence and rollback to local.

- [ ] **Step 1: escrever teste RED do template público**

```ts
it('mantém local como padrão e não contém segredo', () => {
  const env = readFileSync('.env.example', 'utf8');
  expect(env).toContain('VITE_APP_MODE=local');
  expect(env).toContain('VITE_SUPABASE_PUBLISHABLE_KEY=');
  expect(env).not.toMatch(/service_role|SUPABASE_SECRET_KEY/);
});
```

- [ ] **Step 2: executar RED e atualizar `.env.example`**

```dotenv
VITE_APP_MODE=local
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

- [ ] **Step 3: documentar o procedimento exato**

`docs/SUPABASE_SETUP.md` deve cobrir:

1. criação futura do projeto em `sa-east-1`;
2. ligação e aplicação da migração;
3. preenchimento local não rastreado de `.env.bootstrap`;
4. execução de `npm run bootstrap:supabase`;
5. advisors e consulta de verificação;
6. configuração de Preview primeiro;
7. ativação posterior de Production;
8. rollback imediato definindo `VITE_APP_MODE=local`.

- [ ] **Step 4: atualizar CI**

Adicionar antes do build:

```yaml
- name: Run tests
  run: npm test
```

- [ ] **Step 5: executar GREEN e commit**

Run: `npm test -- src/config/envExample.test.ts && npm test && npm run build`

```bash
git add .env.example README.md docs/SUPABASE_SETUP.md .github/workflows/dependency-health.yml src/config/envExample.test.ts
git commit -m "docs: documentar ativação futura do Supabase"
```

---

### Task 9: Verificação integral, comparação visual e publicação

**Files:**
- No planned source edits; any discovered bug requires a failing regression test before a fix.

**Interfaces:**
- Verifies every global constraint and publishes the prepared code.

- [ ] **Step 1: verificação automatizada fresca**

Run:

```bash
npm ci
npm test
npm audit --audit-level=high
npm run build
git diff --check origin/main...HEAD
git status --short
```

Expected: install exit 0; 0 failed tests; 0 high/critical vulnerabilities; build exit 0; no whitespace errors; clean worktree.

- [ ] **Step 2: verificação de segredos**

Run:

```bash
git grep -n "BOOTSTRAP_PASSWORD=.*[^=]\|SUPABASE_SECRET_KEY=.*[^=]\|service_role" -- ':!docs/superpowers' ':!.env.bootstrap.example'
```

Expected: nenhuma senha/chave real no repositório; referências documentais genéricas são revisadas manualmente.

- [ ] **Step 3: smoke local funcional**

Iniciar `npm run dev`, abrir o site e verificar:

- login de teste;
- criação de uma demanda;
- edição;
- mudança de status com histórico;
- exclusão;
- logout e novo login preservando dados;
- exportação CSV.

- [ ] **Step 4: comparação visual desktop e mobile**

Capturar o site atual de produção e o build preparado nas mesmas dimensões (desktop 1440×900 e mobile 390×844). Comparar tela de login e dashboard. Diferenças fora de conteúdo dinâmico devem ser investigadas; correções exigem teste de regressão.

- [ ] **Step 5: revisar requisitos linha a linha**

Confirmar:

- modo local padrão;
- login de teste preservado;
- nenhuma credencial remota necessária para build;
- migração com RLS/grants/RPCs;
- bootstrap sem segredo;
- Supabase mode pronto, porém desativado;
- documentação de ativação e rollback.

- [ ] **Step 6: publicar no GitHub e acompanhar Vercel**

Publicar os commits na branch principal conforme autorização do usuário. Aguardar o deployment automático ficar `READY`; consultar erros de runtime e executar o smoke test do login local no domínio de produção.

- [ ] **Step 7: registrar evidências finais**

Relatar SHA publicado, contagem de testes, resultado do audit/build, URL do deployment e confirmação explícita de que o modo Supabase continua desativado até a criação do projeto.

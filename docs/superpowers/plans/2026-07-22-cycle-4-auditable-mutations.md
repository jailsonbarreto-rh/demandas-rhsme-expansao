# Cycle 4 Auditable Mutations Implementation Plan

> **Status posterior:** HISTÓRICO. O R5-1 retirou restauração do produto e o R4 substituiu os contratos de andamento/status; este plano não autoriza reintroduzi-los.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. The repository explicitly requires the main agent to execute all work without subagents.

**Goal:** Replace generic operational writes with named, transactional and auditable RPCs for creation, editing, progress, status transition, logical deletion and restoration, while preserving the current UI and compatibility until later cycles expose the complete experience.

**Architecture:** PostgreSQL RPCs become the authoritative mutation boundary. Each RPC validates the authenticated role, reads the actual row, updates the demand and inserts exactly one typed history event in the same transaction. The TypeScript repository exposes named methods and the local synthetic repository mirrors the same behavior for deterministic tests; the current forms are adapted through compatibility inputs until Cycles 5 and 6 expose responsibility and next-action fields explicitly.

**Tech Stack:** PostgreSQL/Supabase migrations, React 19, TypeScript, Zod, Vitest, Playwright, GitHub Actions, Vercel.

## Global Constraints

- Preserve the six existing statuses and the semantics in `src/domain/workSemantics.ts`.
- `Tramitado` is not `Encerrado`.
- No physical `DELETE` for operational removal.
- The actor is always `auth.uid()`; no client-supplied actor ID.
- Reader cannot mutate; editor cannot delete or restore; administrator can perform every Cycle 4 mutation.
- Non-closed creation or movement requires objective next action and follow-up date at the RPC boundary.
- Closing clears `proxima_acao` and `proxima_acao_em`.
- Existing search, Excel, accessibility, responsive behavior, RLS, Realtime and routes cannot regress.
- Keep v1 RPCs only as deprecated compatibility until the final contract cycle; new frontend code must use v2 methods.
- Use only synthetic data in tests, PRs, logs and artifacts.

---

### Task 1: Establish RED contracts and validation

**Files:**
- Modify: `src/types.ts`
- Modify: `src/services/contracts.ts`
- Create: `src/validation/demandMutationSchemas.ts`
- Create: `src/validation/demandMutationSchemas.test.ts`
- Modify: `src/services/supabaseDemandasRepository.test.ts`
- Modify: `src/services/localDemandasRepository.test.ts`
- Modify: `supabase/migrations/migration.test.ts`

**Interfaces:**
- Produces:
  - `CreateDemandaInput`
  - `EditDemandaInput`
  - `ProgressInput`
  - `StatusTransitionInput`
  - `DeleteDemandaInput`
  - `RestoreDemandaInput`
  - named `DemandasRepository` mutation methods

- [ ] **Step 1: Add failing type and repository contract tests**

Expected repository contract:

```ts
export interface DemandasRepository {
  load(): Promise<AppData>;
  loadTrash(): Promise<Demanda[]>;
  create(input: CreateDemandaInput): Promise<void>;
  edit(id: number, input: EditDemandaInput): Promise<void>;
  registerProgress(id: number, input: ProgressInput): Promise<void>;
  transitionStatus(id: number, input: StatusTransitionInput): Promise<void>;
  deleteLogically(id: number, input: DeleteDemandaInput): Promise<void>;
  restore(id: number, input: RestoreDemandaInput): Promise<void>;
  subscribe(onRemoteChange: () => void): () => void;
  /** @deprecated Compatibility only until Cycle 13. */
  update(id: number, changes: Partial<Demanda>): Promise<void>;
  /** @deprecated Compatibility only until Cycle 13. */
  updateStatus(id: number, status: Demanda['status'], comentario: string): Promise<void>;
  /** @deprecated Compatibility only until Cycle 13. */
  delete(id: number): Promise<void>;
}
```

- [ ] **Step 2: Add failing Zod behavior tests**

Cover:

```ts
expect(createDemandaMutationSchema.safeParse(nonClosedWithoutNextAction).success).toBe(false);
expect(createDemandaMutationSchema.safeParse(closedWithoutNextAction).success).toBe(true);
expect(editDemandaMutationSchema.safeParse({ ...validEdit, justificativa: 'curta' }).success).toBe(false);
expect(progressMutationSchema.safeParse({ comentario: 'ok', proximaAcao: '', proximaAcaoEm: '' }).success).toBe(false);
expect(statusTransitionMutationSchema.safeParse({ ...validTransition, status: 'Encerrado', proximaAcao: '', proximaAcaoEm: '' }).success).toBe(true);
expect(deleteMutationSchema.safeParse({ motivo: 'curto' }).success).toBe(false);
```

- [ ] **Step 3: Run focused tests and confirm RED**

Run:

```bash
npm run test -- src/validation/demandMutationSchemas.test.ts src/services/supabaseDemandasRepository.test.ts src/services/localDemandasRepository.test.ts supabase/migrations/migration.test.ts
```

Expected: failures because the new inputs, schemas, RPC calls and migration do not exist.

- [ ] **Step 4: Commit RED evidence**

```bash
git add src supabase/migrations/migration.test.ts
git commit -m "test: definir contratos auditaveis do ciclo 4"
```

### Task 2: Implement transactional SQL RPCs

**Files:**
- Create: `supabase/migrations/20260722110000_central_trabalho_mutations.sql`
- Modify: `supabase/migrations/migration.test.ts`
- Create: `supabase/tests/cycle4_mutations_fixture.sql`
- Create: `supabase/tests/cycle4_mutations_invariants.sql`
- Modify: `.github/workflows/supabase-local-migrations.yml`

**Interfaces:**
- Produces PostgreSQL functions:
  - `public.criar_sme_demanda_v2(...)`
  - `public.editar_sme_demanda(...)`
  - `public.registrar_andamento_sme_demanda(...)`
  - `public.transicionar_status_sme_demanda(...)`
  - `public.excluir_sme_demanda(...)`
  - `public.restaurar_sme_demanda(...)`
  - `public.listar_perfis_minimos()`

- [ ] **Step 1: Add SQL helpers with empty search path**

Create private helpers for trimmed-length validation, row locking, field-change JSON generation and active-role validation. Every public RPC uses `security definer` and `set search_path = ''`.

- [ ] **Step 2: Implement `criar_sme_demanda_v2`**

Rules:
- validates `private.can_edit()`;
- rejects duplicate normalized `numero`;
- validates deadline state/date/justification coherence;
- requires next action with at least five useful characters and date unless status is `Encerrado`;
- writes `origem = 'sistema'`, `created_by = auth.uid()`, `updated_by = auth.uid()`;
- inserts one `criacao` event with the same author and returns the inserted row.

- [ ] **Step 3: Implement editing and progress RPCs**

`editar_sme_demanda`:
- locks the row `for update`;
- rejects deleted rows;
- never accepts status;
- requires justification of at least ten useful characters;
- generates `alteracoes` from actual before/after values;
- emits `reatribuicao` only when responsibility alone changed, `alteracao_prazo` only when deadline fields alone changed, otherwise `edicao`;
- performs no update and creates no event when nothing changed.

`registrar_andamento_sme_demanda`:
- rejects `Encerrado` and deleted rows;
- requires comment, next action and date;
- updates next action/date and `updated_by`;
- inserts one `andamento` event.

- [ ] **Step 4: Implement status transition, deletion and restoration**

`transicionar_status_sme_demanda`:
- rejects same status with message directing the user to register progress;
- requires comment;
- clears next action/date for `Encerrado`;
- requires both for every other destination;
- inserts one `mudanca_status` event with `status_anterior` and real before/after changes.

`excluir_sme_demanda` and `restaurar_sme_demanda`:
- validate `private.is_admin()`;
- require motive of ten useful characters;
- use logical metadata only; never execute `DELETE`;
- preserve all historical rows;
- insert one `exclusao` or `restauracao` event.

- [ ] **Step 5: Restrict grants and retain v1 compatibility**

For every new RPC:

```sql
revoke all on function public.<function_signature> from public, anon, authenticated;
grant execute on function public.<function_signature> to authenticated;
```

Do not revoke v1 functions in this cycle.

- [ ] **Step 6: Add database execution tests**

The ephemeral test must create administrator, editor and reader users, then prove:
- reader mutations fail;
- editor creates, edits, registers progress and transitions;
- editor delete/restore fail;
- administrator delete/restore succeed;
- logical deletion retains demand and history;
- normal query excludes deleted rows and trash query contains only deleted rows;
- closing clears next action/date;
- a deliberately failing history insert rolls back the demand mutation;
- two sequential edits leave the second `updated_at` as the current value.

- [ ] **Step 7: Run local Supabase gate**

```bash
supabase db start
psql "$LOCAL_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/cycle4_mutations_fixture.sql
supabase migration up --local
psql "$LOCAL_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/cycle4_mutations_invariants.sql
supabase db reset --local --no-seed
supabase stop --no-backup
```

Expected: all invariants pass and no orphan history exists.

- [ ] **Step 8: Commit SQL implementation**

```bash
git add supabase .github/workflows/supabase-local-migrations.yml
git commit -m "feat(db): adicionar mutacoes auditaveis do ciclo 4"
```

### Task 3: Implement TypeScript inputs and validation

**Files:**
- Modify: `src/types.ts`
- Modify: `src/services/contracts.ts`
- Create: `src/validation/demandMutationSchemas.ts`
- Modify: `src/validation/demandMutationSchemas.test.ts`
- Modify: `src/lib/database.types.ts`

**Interfaces:**

```ts
export interface CreateDemandaInput extends Omit<Demanda, 'id' | 'createdAt' | 'updatedAt' | 'origem'> {}

export interface EditDemandaInput {
  assunto: string;
  responsavelId: string | null;
  responsavel: string;
  limite1: string;
  limite1Situacao: DeadlineState;
  limite1Justificativa: string;
  limite2: string;
  limite2Situacao: DeadlineState;
  limite2Justificativa: string;
  setor: string;
  classificacao: string;
  linkOrigem: string;
  proximaAcao: string;
  proximaAcaoEm: string;
  justificativa: string;
}

export interface ProgressInput {
  comentario: string;
  proximaAcao: string;
  proximaAcaoEm: string;
}

export interface StatusTransitionInput extends ProgressInput {
  status: DemandStatus;
}

export interface DeleteDemandaInput { motivo: string; }
export interface RestoreDemandaInput { motivo: string; }
```

- [ ] **Step 1: Implement schemas**

Schemas trim user text, require valid `dd/mm/aaaa` dates, require five useful characters for next action, ten for justifications/motives, and enforce deadline state coherence.

- [ ] **Step 2: Add database function types**

Declare exact RPC argument names matching the SQL migration. Return rows for create/edit/progress/transition/delete/restore and a minimal profile row for `listar_perfis_minimos`.

- [ ] **Step 3: Run validation and type tests**

```bash
npm run test -- src/validation/demandMutationSchemas.test.ts supabase/migrations/migration.test.ts
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit contracts**

```bash
git add src/types.ts src/services/contracts.ts src/validation src/lib/database.types.ts
git commit -m "feat: tipar contratos de mutacao auditavel"
```

### Task 4: Implement remote repository named mutations

**Files:**
- Modify: `src/services/supabaseDemandasRepository.ts`
- Modify: `src/services/supabaseDemandasRepository.test.ts`

**Interfaces:**
- Consumes the Task 3 input types.
- Produces named RPC calls and `loadTrash()`.

- [ ] **Step 1: Replace new writes with RPC calls**

Map UI dates with `toDatabaseDate` and invoke only:

```ts
client.rpc('criar_sme_demanda_v2', args)
client.rpc('editar_sme_demanda', args)
client.rpc('registrar_andamento_sme_demanda', args)
client.rpc('transicionar_status_sme_demanda', args)
client.rpc('excluir_sme_demanda', args)
client.rpc('restaurar_sme_demanda', args)
```

- [ ] **Step 2: Add administrator trash load**

`loadTrash()` selects expanded demand columns with `.not('deleted_at', 'is', null)` and orders by `deleted_at` descending. Permission errors are propagated; they do not trigger the legacy schema fallback.

- [ ] **Step 3: Keep deprecated compatibility adapters**

`update`, `updateStatus` and `delete` remain only as adapters used by old UI call sites during this cycle. They must call named methods, never issue direct table update/delete. If required fields are unavailable, they derive only from the currently loaded demand and reject ambiguous operations rather than inventing data.

- [ ] **Step 4: Run repository tests**

```bash
npm run test -- src/services/supabaseDemandasRepository.test.ts
```

Expected: all RPC names/arguments and trash filters pass; no direct update/delete assertion remains.

- [ ] **Step 5: Commit remote repository**

```bash
git add src/services/supabaseDemandasRepository.ts src/services/supabaseDemandasRepository.test.ts
git commit -m "feat: usar rpcs nomeadas no repositorio supabase"
```

### Task 5: Mirror transactional behavior in local synthetic mode

**Files:**
- Modify: `src/services/localDemandasRepository.ts`
- Modify: `src/services/localDemandasRepository.test.ts`

**Interfaces:**
- Implements the same named repository methods without authentication.
- Uses synthetic author `Usuário Demonstração` and deterministic event typing.

- [ ] **Step 1: Implement atomic in-memory mutation helper**

Clone demand/history arrays, apply mutation and event to the clones, persist both only after every validation succeeds. On failure, keep the previous storage unchanged.

- [ ] **Step 2: Implement named methods**

Mirror SQL behavior for create, edit, progress, transition, logical deletion and restoration. Logical deletion keeps rows in storage but `load()` returns only non-deleted items; `loadTrash()` returns deleted ones.

- [ ] **Step 3: Verify event classification**

Tests cover one event per mutation, before/after changes, no physical delete, close clearing next action, restoration and rollback when event construction is forced to fail.

- [ ] **Step 4: Run local repository tests**

```bash
npm run test -- src/services/localDemandasRepository.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit local repository**

```bash
git add src/services/localDemandasRepository.ts src/services/localDemandasRepository.test.ts
git commit -m "feat: espelhar mutacoes auditaveis no modo local"
```

### Task 6: Route application writes through named hook methods

**Files:**
- Modify: `src/hooks/useDemandasData.ts`
- Create or modify: `src/hooks/useDemandasData.test.tsx`
- Modify: `src/App.tsx`
- Modify: existing modal integration tests as necessary

**Interfaces:**

```ts
create(input: CreateDemandaInput): Promise<void>;
edit(id: number, input: EditDemandaInput): Promise<void>;
registerProgress(id: number, input: ProgressInput): Promise<void>;
transitionStatus(id: number, input: StatusTransitionInput): Promise<void>;
deleteLogically(id: number, input: DeleteDemandaInput): Promise<void>;
restore(id: number, input: RestoreDemandaInput): Promise<void>;
```

- [ ] **Step 1: Expose named hook methods**

Every method uses the existing `mutate()` wrapper and reloads after success.

- [ ] **Step 2: Adapt current forms without adding Cycle 5/6 UI**

Current create/edit/status handlers translate existing form payloads into named inputs. For legacy records missing next action, compatibility adapters use explicit neutral follow-up text/date only where the existing UI action would otherwise become unavailable; document this as temporary and remove it in Cycles 5/6. No hidden author ID is sent.

- [ ] **Step 3: Replace physical delete handler**

The existing administrative confirmation must call `deleteLogically` with a minimum-ten-character reason. If the current dialog does not collect a reason, use an explicit reason field in the existing confirmation surface; do not silently hardcode a motive.

- [ ] **Step 4: Run hook and UI regression tests**

```bash
npm run test -- src/hooks/useDemandasData.test.tsx src/App.test.tsx
npm run test:e2e
```

Expected: current create/edit/status/delete flows remain usable, routes and filters remain preserved, and delete no longer removes history.

- [ ] **Step 5: Commit application integration**

```bash
git add src/hooks src/App.tsx src/components src/**/*.test.*
git commit -m "feat: encaminhar interface para mutacoes auditaveis"
```

### Task 7: Validate, document and publish the cycle

**Files:**
- Modify: `docs/SUPABASE_SETUP.md`
- Modify: `docs/HANDOFF.md`
- Modify: PR description

- [ ] **Step 1: Run the full gate**

```bash
npm ci
npm audit --audit-level=high
npm audit signatures
npm run lint
npm run test:coverage
npm run build
npm run check:bundle
npm run test:e2e
```

Expected: every command exits 0; no ignored tests; bundle and public-data scanner pass.

- [ ] **Step 2: Run the Supabase ephemeral gate**

Expected: reader/editor/admin permissions, transaction rollback, logical deletion and restoration all pass.

- [ ] **Step 3: Review scope and product gate**

Confirm:
- editor can record work without fake status changes through the repository contract;
- every mutation creates one event with author/type/content;
- no physical deletion exists;
- current search, filters, URL, Excel and accessibility remain unchanged;
- no ranking, notifications or unrelated UI was added.

- [ ] **Step 4: Open draft PR and validate Preview**

PR title: `Ciclo 4: registrar mutações auditáveis e exclusão lógica`.

The Preview must be `READY` for the exact candidate SHA and return HTTP 200.

- [ ] **Step 5: Apply migration only after local gate and preflight**

Before remote application, record counts, duplicates, orphan history and current migration list. Apply the versioned migration once. Repeat invariants and run rollback-only RPC smoke tests that leave no synthetic rows.

- [ ] **Step 6: Merge and publish**

Merge only the validated SHA. Enable Production deployment for `main`, confirm `READY` and the principal domain, then restore `deploymentEnabled: false`.

- [ ] **Step 7: Final documentation**

Record branch, commits, PR, Preview, deployment, migration version, tests, invariants, risks and authorization for Cycle 5.

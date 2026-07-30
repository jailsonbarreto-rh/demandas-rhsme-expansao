# R5-1 — Lixeira Administrativa e Auditoria — Plano de Implementação

> **Para agentes executores:** usar `superpowers:subagent-driven-development` ou `superpowers:executing-plans` para executar este plano tarefa por tarefa. Os passos seguem TDD e commits verificáveis.

**Objetivo:** disponibilizar, exclusivamente na área administrativa, uma consulta somente leitura das demandas logicamente excluídas e remover qualquer restauração oferecida pelo produto.

**Arquitetura:** preservar a exclusão lógica, os dados e o histórico atuais; carregar a lixeira apenas quando um administrador abrir `/admin`; apresentar uma seção de auditoria com pesquisa e detalhe; retirar `restore` dos contratos públicos; revogar a execução autenticada da RPC de restauração sem apagar a função, mantendo recuperação técnica excepcional somente pelo proprietário do banco.

**Stack:** React 19, TypeScript 5.9, Supabase/PostgreSQL, RLS, Vitest, Testing Library, Playwright e Vercel.

## Restrições globais

- Somente administrador ativo pode excluir demandas.
- Editor e leitor não veem a ação de exclusão e não consultam a lixeira.
- Exclusão permanece lógica; não existe exclusão física pelo produto.
- Exclusão exige motivo com pelo menos 10 caracteres e registra ator e momento.
- Demanda excluída conserva dados e histórico.
- A lixeira é somente leitura e não oferece restauração.
- `restaurar_sme_demanda` permanece no banco apenas como capacidade técnica excepcional, sem `EXECUTE` para `public`, `anon`, `authenticated` ou `service_role`.
- Nenhuma linha existente será alterada pela migration.
- Production permanece bloqueada até todos os gates verdes.

---

### Tarefa 1 — Contrato sem restauração

**Arquivos:**
- Modificar: `src/types.ts`
- Modificar: `src/services/contracts.ts`
- Modificar: `src/hooks/useDemandasData.ts`
- Modificar: `src/services/supabaseDemandasRepository.ts`
- Modificar: `src/services/localDemandasRepository.ts`
- Modificar: `src/validation/demandMutationSchemas.ts`
- Testar: `src/services/cycle4Contracts.test.ts`
- Testar: `src/services/localDemandasRepository.test.ts`
- Testar: `src/services/supabaseDemandasRepository.test.ts`

**Produz:** `DemandasRepository` com `loadTrash()` e `deleteLogically()`, mas sem `restore()`.

- [ ] Escrever testes que falhem se `restore` continuar exposto nos repositórios.
- [ ] Executar os testes e confirmar a falha pelo contrato ainda existente.
- [ ] Remover `RestoreDemandaInput`, `restoreMutationSchema`, `restore()` e o wrapper correspondente do hook.
- [ ] Preservar `HistoryEventType = 'restauracao'` para leitura de eventual histórico antigo.
- [ ] Executar testes e confirmar aprovação.

### Tarefa 2 — Bloqueio da restauração na API

**Arquivos:**
- Criar: `supabase/migrations/20260730170000_r5_1_disable_product_restore.sql`
- Criar: `supabase/migrations/r5TrashAuditMigration.test.ts`

**Produz:** RPC existente sem permissão de execução pelos papéis de API.

```sql
revoke all on function public.restaurar_sme_demanda(bigint, text)
from public, anon, authenticated, service_role;

comment on function public.restaurar_sme_demanda(bigint, text) is
  'Recuperação técnica excepcional. Não integra o produto e não possui grants para papéis de API.';
```

- [ ] Escrever teste que exija a revogação dos quatro papéis e preserve a função.
- [ ] Confirmar falha antes da migration.
- [ ] Criar migration aditiva, sem DML.
- [ ] Confirmar que `excluir_sme_demanda` continua restrita por `private.is_admin()`.

### Tarefa 3 — Consulta administrativa da lixeira

**Arquivos:**
- Criar: `src/components/AdminTrashPanel.tsx`
- Criar: `src/components/AdminTrashPanel.test.tsx`
- Criar: `src/components/AdminTrashDetailDialog.tsx`
- Modificar: `src/components/AdminPanel.tsx`
- Modificar: `src/App.tsx`
- Modificar: estilos globais aplicáveis.

**Interface:**

```ts
interface AdminTrashPanelProps {
  demandas: Demanda[];
  historico: ComentarioHistorico[];
  perfis: PerfilUsuario[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}
```

- [ ] Escrever teste do estado vazio `Nenhuma demanda excluída`.
- [ ] Escrever teste de pesquisa por número, assunto, responsável e motivo.
- [ ] Escrever teste do detalhe somente leitura com número, status, motivo, data, autor e histórico.
- [ ] Confirmar ausência de botão `Restaurar` e de controles de edição/status.
- [ ] Implementar carregamento somente quando administrador ativo abre `/admin`.
- [ ] Resolver o nome do autor pelo UUID em `perfis`; usar `Autor não identificado` sem inferência quando não houver correspondência.
- [ ] Manter tabela responsiva, carregamento, erro com nova tentativa e estado vazio.

### Tarefa 4 — Provas de autorização

**Arquivos:**
- Modificar: `src/App.supabase.test.tsx`
- Modificar: `src/components/DemandasTable.test.tsx`
- Criar ou modificar: testes SQL/RLS do E4/R5-1.

- [ ] Provar que editor e leitor não recebem `Excluir`.
- [ ] Provar que apenas administrador monta a área `/admin` e chama `loadTrash()`.
- [ ] Provar por SQL que demandas e históricos excluídos não são visíveis a editor/leitor.
- [ ] Provar que administrador pode consultar e excluir logicamente, mas não executar restauração pela API.

### Tarefa 5 — Documentação e release

**Arquivos:**
- Modificar: `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md`
- Modificar: `docs/product/PAUTA_DECISOES_R5_2026-07-30.md`
- Modificar: `docs/execution/ATUALIZACAO_POS_R4_PRE_R5_2026-07-30.md`
- Modificar: `docs/PRODUCT_CONTEXT.md`
- Modificar: `docs/HANDOFF.md`
- Criar: relatório de validação R5-1.

- [ ] Registrar OP-D11 como encerrada pela decisão de não disponibilizar restauração.
- [ ] Renomear o pacote para `R5-1 — Lixeira administrativa e auditoria`.
- [ ] Rodar lint, testes, cobertura, TypeScript, build, bundle, Playwright desktop/mobile e gate documental.
- [ ] Aplicar a migration no Supabase somente após replay seguro e confirmar contagens inalteradas.
- [ ] Publicar por release controlado; verificar Production e restaurar `deploymentEnabled: false`.

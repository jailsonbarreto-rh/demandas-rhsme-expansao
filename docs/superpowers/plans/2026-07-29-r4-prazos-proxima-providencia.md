# R4 — Prazos e Próxima Providência Implementation Plan

> **Nota posterior (01/08/2026):** plano executado e preservado como histórico. GOV-013 retirou a obrigatoriedade de evolução do `Atenção agora` em um ciclo predeterminado.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar as regras aprovadas de prazo interno, prazo final e próxima providência em todas as camadas do SITE CTRH, preservando integralmente os dados legados e a organização atual da carteira.

**Architecture:** A regra é definida uma única vez no domínio TypeScript e reproduzida na fronteira transacional do Supabase. Formulários usam componentes de prazo com estado explícito; as RPCs validam criação, primeira adequação e alteração posterior com semânticas diferentes; filtros, tabela e detalhe apenas derivam sinais dos dados persistidos, sem criar prioridade ou conteúdo por inferência. O pacote preserva rotas, carteiras, filtros existentes, busca, Excel, histórico, RLS e Realtime.

**Tech Stack:** React 19, TypeScript 5.9, React Hook Form, Zod 4, TanStack Table 8, Supabase/PostgreSQL, Vitest, Testing Library, Playwright, ExcelJS, GitHub Actions e Vercel.

## Global Constraints

- Novas demandas exigem prazo interno definido.
- Novas demandas exigem prazo final definido ou marcado como `nao_se_aplica`.
- `nao_se_aplica` não exige justificativa no cadastro inicial.
- Dados legados ausentes permanecem `nao_informado` e nunca são preenchidos por inferência.
- Editar dado cadastral de demanda legada não exige prazo nem próxima providência ausentes.
- Primeiro preenchimento de prazo legado ausente não exige justificativa.
- Qualquer alteração posterior de prazo já registrado exige justificativa escrita.
- Prazo interno não pode ser posterior ao prazo final quando ambos forem definidos.
- Demanda não encerrada criada, movimentada ou submetida a mudança de status exige próxima providência e data.
- Próxima providência passada é aceita somente com justificativa.
- Encerramento limpa próxima providência e data, preservando o histórico.
- Ausência de dado legado não é atraso.
- Cartões atuais passam a dizer `Prazo final hoje` e `Prazo final vencido`; sua lógica continua baseada no prazo final.
- A carteira atual não será reorganizada e o banco não receberá campo genérico de urgência.
- Faixa de proximidade: sete dias corridos.
- O bloco `Atenção agora` permanece; GOV-013 condiciona qualquer evolução a evidência de limitação operacional.
- Testes e documentação usam somente dados sintéticos.
- Nenhuma migration já aplicada será editada; toda mudança de banco é aditiva.

---

### Task 1: Registrar decisões e corrigir autoridade documental

**Files:**
- Modify: `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md`
- Modify: `docs/PRODUCT_CONTEXT.md`
- Modify: `docs/execution/Plano_Executivo_Operacao_Atual_CTRH_v1.2.md`
- Modify: `docs/execution/Plano_Integrado_Reformulado_CTRH_v3.1.md`
- Modify: `docs/adr/ADR-002-prazos-proxima-acao.md`
- Modify: `docs/HANDOFF.md`
- Create: `docs/product/REAVALIACOES_FUTURAS_R4.md`

**Interfaces:**
- Produces: regras aprovadas canônicas, lista explícita de reavaliações futuras e remoção das orientações superadas sobre justificativa de `nao_se_aplica` e confirmação simples de próxima providência passada.

- [ ] **Step 1: Escrever o registro das decisões aprovadas**

Registrar separadamente: criação nova, legado, primeira adequação, alteração posterior, movimentação, próxima providência passada, apresentação da carteira, filtros, faixa de sete dias e preservação do `Atenção agora`.

- [ ] **Step 2: Criar lista de reavaliações futuras**

A lista deve conter, sem autorização automática: representação conjunta dos prazos quando houver cobertura; destaque futuro dos filtros; revisão da coluna/bloco de próxima providência com uso real; reformulação do `Atenção agora` no R6; novos indicadores no Radar após cobertura suficiente.

- [ ] **Step 3: Sincronizar documentos vigentes e marcar regras superadas**

Substituir qualquer orientação que diga que `nao_se_aplica` exige justificativa ou que próxima providência passada exige apenas aviso/confirmação.

- [ ] **Step 4: Verificar por busca documental**

Executar o gate documental e busca por expressões conflitantes antes do merge.

### Task 2: Definir domínio temporal único e componentes de prazo

**Files:**
- Create: `src/domain/deadlineRules.ts`
- Create: `src/domain/deadlineRules.test.ts`
- Create: `src/domain/temporalSignals.ts`
- Create: `src/domain/temporalSignals.test.ts`
- Create: `src/components/DeadlineControl.tsx`
- Create: `src/components/DeadlineControl.test.tsx`
- Create: `src/components/DeadlineDisplay.tsx`
- Modify: `src/types.ts`
- Modify: `src/utils/date.ts`

**Interfaces:**
- Produces:
  - `DeadlineFormValue` com `state`, `date` e `changeJustification`;
  - `validateDeadlinePair(internal, final)`;
  - `classifyDateSignal(value, today)` retornando `overdue | today | next_7_days | future | missing`;
  - `requiresDeadlineChangeJustification(before, after)`;
  - apresentação coerente de `nao_informado`, `nao_se_aplica` e encerramento.

- [ ] **Step 1: Escrever testes RED do domínio**

Cobrir criação nova, legado vazio, primeiro preenchimento, alteração de data, data ↔ `nao_se_aplica`, ordem dos prazos e faixa de sete dias.

- [ ] **Step 2: Confirmar RED**

Run: `npm run test -- src/domain/deadlineRules.test.ts src/domain/temporalSignals.test.ts`

- [ ] **Step 3: Implementar o domínio mínimo**

Centralizar parsing de data de calendário e impedir uso de `new Date()` disperso para semânticas de negócio.

- [ ] **Step 4: Criar componente acessível de prazo**

O componente recebe `allowedStates`, mostra somente controles aplicáveis, limpa valores ocultos e expõe justificativa apenas quando a operação altera um valor previamente registrado.

- [ ] **Step 5: Confirmar GREEN**

Executar testes do domínio e componente.

### Task 3: Aplicar regras nos formulários sem bloquear o legado

**Files:**
- Modify: `src/validation/demandaSchemas.ts`
- Modify: `src/validation/demandMutationSchemas.ts`
- Modify: `src/validation/demandMutationSchemas.test.ts`
- Modify: `src/components/ModalNovo.tsx`
- Modify: `src/components/ModalEditar.tsx`
- Modify: `src/components/ModalStatus.tsx`
- Create: `src/components/PastFollowUpJustification.tsx`
- Modify: `src/App.tsx`
- Modify: tests de formulário e integração associados

**Interfaces:**
- Produces:
  - novo cadastro com prazo interno obrigatório e prazo final `definido | nao_se_aplica`;
  - edição cadastral que preserva lacunas legadas;
  - justificativa obrigatória apenas para alteração de prazo já registrado;
  - próxima providência passada com justificativa;
  - mudança de status não encerrado exigindo próxima providência, inclusive para legado;
  - encerramento limpando os campos.

- [ ] **Step 1: Escrever testes RED de criação e edição**

Cobrir bloqueio de nova demanda sem prazo interno, bloqueio sem escolha do prazo final, aceite de `nao_se_aplica`, edição cadastral de legado sem prazos e primeira adequação sem justificativa.

- [ ] **Step 2: Escrever testes RED de alteração e movimentação**

Cobrir alteração de prazo com justificativa, alteração sem justificativa bloqueada, próxima providência passada com justificativa, mudança de status não encerrado sem providência bloqueada e encerramento permitido sem providência.

- [ ] **Step 3: Implementar formulários e schemas**

Usar o domínio da Task 2; não duplicar regras em componentes.

- [ ] **Step 4: Confirmar GREEN e ausência de regressão**

Executar testes focados de validação, modais e App.

### Task 4: Reproduzir regras na fronteira Supabase e histórico

**Files:**
- Create: `supabase/migrations/20260730023000_r4_deadlines_and_follow_up_rules.sql`
- Create: `supabase/tests/r4_deadlines_follow_up_fixture.sql`
- Create: `supabase/tests/r4_deadlines_follow_up_invariants.sql`
- Modify: `supabase/migrations/migration.test.ts`
- Modify: `.github/workflows/supabase-local-migrations.yml` somente se o manifesto dinâmico não descobrir automaticamente a nova migration
- Modify: `src/lib/database.types.ts`
- Modify: `src/services/supabaseDemandasRepository.ts`
- Modify: `src/services/localDemandasRepository.ts`
- Modify: repository tests associados

**Interfaces:**
- Produces versões substituídas das RPCs atuais com as mesmas permissões e transações:
  - `criar_sme_demanda_v2`;
  - `editar_sme_demanda`;
  - `registrar_andamento_sme_demanda`;
  - `transicionar_status_sme_demanda`.

- [ ] **Step 1: Escrever invariantes SQL RED**

Provar regras por editor e rejeição por leitor; criação nova; preservação de legado; primeira adequação; alteração posterior; ordem dos prazos; providência passada; encerramento; rollback quando histórico falha.

- [ ] **Step 2: Confirmar RED no replay efêmero**

Executar migration chain e invariantes antes da nova migration.

- [ ] **Step 3: Implementar helpers aditivos e substituir RPCs**

A RPC deve comparar o valor anterior real para decidir se exige justificativa. Não usar `origem='legado'` como exceção genérica; a diferença decorre do valor anterior ausente ou registrado.

- [ ] **Step 4: Registrar histórico estruturado**

Alterações de prazo registram antes/depois, justificativa, ator e horário. Primeira adequação de valor ausente registra a mudança sem exigir justificativa. Justificativa de providência passada integra o evento da operação.

- [ ] **Step 5: Confirmar GREEN e paridade local/remota**

Executar invariantes SQL e testes dos dois repositories.

### Task 5: Completar leitura operacional na carteira atual

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/filters/filterTypes.ts`
- Modify: `src/filters/applyDemandFilters.ts`
- Modify: `src/filters/filterUrl.ts`
- Modify: `src/components/FilterPanel.tsx`
- Modify: `src/components/DemandasTable.tsx`
- Modify: `src/components/DemandDetailDrawer.tsx`
- Modify: `src/components/AtencaoImediata.tsx` apenas para correções técnicas/estilo
- Modify: `src/index.css`
- Modify: tests de filtros, URL, tabela, detalhe e responsividade

**Interfaces:**
- Produces:
  - cartões `Prazo final hoje` e `Prazo final vencido`;
  - filtros `prazo interno hoje`, `prazo interno vencido`, `próxima providência hoje` e `próxima providência vencida`;
  - período por data da próxima providência;
  - coluna consolidada `Próxima providência`;
  - bloco de próxima providência antes dos prazos no detalhe;
  - estados `Vencida`, `Hoje`, `Próximos 7 dias`, `Futura`, `Não informada` e `Não exigida`.

- [ ] **Step 1: Escrever testes RED dos filtros**

Cobrir semânticas específicas, combinação OU entre alertas, refinamento E com os demais filtros e persistência na URL.

- [ ] **Step 2: Escrever testes RED da apresentação**

Cobrir rótulos, próxima providência longa, legado ausente, encerramento, prazo interno/final e mobile sem overflow.

- [ ] **Step 3: Implementar sem reorganizar a carteira**

Preservar todas as colunas atuais; inserir próxima providência após prazo final e antes do status.

- [ ] **Step 4: Corrigir inconsistências de classes temporais**

Garantir correspondência entre classes geradas e CSS, sem alterar a hierarquia do `Atenção agora`.

- [ ] **Step 5: Confirmar GREEN**

Executar testes de filtros, tabela, detalhe, acessibilidade e mobile.

### Task 6: Sincronizar Excel, qualidade informacional e documentação final

**Files:**
- Modify: `src/export/excelAnalytics.ts`
- Modify: `src/export/exportDemandasExcel.ts`
- Modify: tests de Excel
- Modify: `docs/HANDOFF.md`
- Modify: `docs/product/REAVALIACOES_FUTURAS_R4.md`
- Modify: documentos da Task 1 com estado efetivamente implementado

**Interfaces:**
- Produces: mesma semântica entre tela e Excel, distinção entre situação dos prazos e próxima providência, e documentação final vinculada ao SHA candidato.

- [ ] **Step 1: Escrever testes RED do Excel**

Cobrir estados dos dois prazos, justificativa de alteração, próxima providência, faixa de sete dias e ausência legada sem classificá-la como atraso.

- [ ] **Step 2: Implementar a exportação mínima equivalente à tela**

Preservar proteção contra formula injection e recorte integral filtrado.

- [ ] **Step 3: Executar gates completos**

Run:

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

Executar também replay efêmero integral do Supabase e invariantes R4.

- [ ] **Step 4: Abrir PR draft e validar o mesmo SHA**

O PR deve conter escopo, decisões, migration, evidências RED/GREEN, riscos, rollback e lista de reavaliações futuras. Não aplicar migration remota nem publicar Production antes dos gates e da revisão do candidato.

- [ ] **Step 5: Atualizar Handoff**

Registrar branch, commits, PR, testes, migration, estado do Supabase/Vercel, riscos e próximo passo autorizado.

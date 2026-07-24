# Refinamentos de Filtros e Paginação Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clarificar a troca para a carteira da equipe, destacar filtros ativos e iniciar a tabela com 50 resultados, oferecendo também 100.

**Architecture:** As mudanças permanecem nos componentes existentes. `CarteiraContextHeader` concentra a nova microcopy; `FilterPanel` ganha marcação semântica para um resumo visual mais forte; `DemandasTable` altera apenas o estado inicial e as opções do seletor. Um stylesheet final e isolado aplica os refinamentos sem interferir no restante do design system.

**Tech Stack:** React 19, TypeScript, TanStack Table, Testing Library, Vitest, CSS canônico CTRH, Playwright, GitHub Actions e Vercel.

## Global Constraints

- Texto exato da ação pessoal: `Demandas Equipe CTRH`.
- Preservar os filtros ao trocar de carteira.
- Opções de paginação: `10`, `25`, `50` e `100`.
- Tamanho inicial: `50`.
- Não alterar Supabase, permissões ou regras de responsabilidade.

---

### Task 1: Microcopy e destaque de filtros

**Files:**
- Modify: `src/components/CarteiraContextHeader.tsx`
- Modify: `src/components/CarteiraContextHeader.test.tsx`
- Modify: `src/components/FilterPanel.tsx`
- Create: `src/components/FilterPanel.summary.test.tsx`
- Create: `src/r3-refinements.css`
- Modify: `src/main.tsx`

**Interfaces:**
- Produces: ação `Demandas Equipe CTRH` para `mode="pessoal"`.
- Produces: classes `filters-active-state`, `filters-results-summary` e `has-active-filters`.

- [ ] Escrever testes que exijam a nova ação e o resumo destacado.
- [ ] Confirmar que os testes falham no estado atual.
- [ ] Implementar a microcopy e a marcação semântica mínima.
- [ ] Aplicar o refinamento visual em stylesheet carregado por último.
- [ ] Executar os testes focados e confirmar aprovação.

### Task 2: Paginação padrão em 50 e opção 100

**Files:**
- Modify: `src/components/DemandasTable.tsx`
- Modify: `src/components/ProfessionalUx.test.tsx`

**Interfaces:**
- Produces: estado inicial `{ pageIndex: 0, pageSize: 50 }`.
- Produces: opções `[10, 25, 50, 100]`.

- [ ] Atualizar o teste de paginação para uma coleção com mais de 50 registros.
- [ ] Exigir `1–50`, opção `100` e navegação para a segunda página.
- [ ] Confirmar RED.
- [ ] Alterar estado inicial e opções.
- [ ] Confirmar GREEN.

### Task 3: Regressão e publicação controlada

**Files:**
- Modify: `docs/HANDOFF.md`
- Temporarily modify and restore: `vercel.json`

- [ ] Executar lint, cobertura, build e Playwright.
- [ ] Abrir PR funcional e aguardar CI integral verde.
- [ ] Habilitar Preview controlado, validar desktop e mobile.
- [ ] Mesclar e confirmar Production `READY`.
- [ ] Restaurar `deploymentEnabled: false`.
- [ ] Atualizar handoff e verificar domínio oficial.

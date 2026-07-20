# Busca Avançada Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar busca multi-termo, normalizada e explicável sobre demandas e histórico, com destaques, buscas recentes, atalho de teclado e filtro por período.

**Architecture:** Utilitários puros em `src/search/` criam documentos normalizados, avaliam todos os termos, geram metadados de correspondência, filtram períodos e persistem pesquisas recentes. `App.tsx` orquestra os filtros e a URL; `FilterPanel` recebe a experiência de busca; `DemandasTable` apenas apresenta os resultados e destaques.

**Tech Stack:** React 19, TypeScript 5.9, Vitest 4, Testing Library, React Router 7, TanStack React Table 8, CSS editorial existente.

## Global Constraints

- Nenhuma migration, RLS, permissão ou dado do Supabase será alterado.
- Nenhuma biblioteca externa de busca será adicionada.
- Todos os termos devem corresponder, ainda que em campos diferentes.
- A busca deve ser tolerante a acentos, caixa e pontuação de números.
- Pesquisas recentes ficam somente no navegador, limitadas a cinco.
- Filtros de período devem permanecer na URL.
- O texto original nunca será injetado como HTML.

---

### Task 1: Núcleo de normalização e correspondência

**Files:**
- Create: `src/search/searchTypes.ts`
- Create: `src/search/searchNormalization.ts`
- Create: `src/search/demandSearch.ts`
- Test: `src/search/searchNormalization.test.ts`
- Test: `src/search/demandSearch.test.ts`

**Interfaces:**
- Produces: `normalizeSearchText(value: string): string`
- Produces: `normalizeProcessNumber(value: string): string`
- Produces: `tokenizeSearchQuery(query: string): string[]`
- Produces: `matchDemandSearch(demanda, historico, query): DemandSearchMatch`

- [ ] Escrever testes falhos para acentos, caixa, espaços, pontuação e termos distribuídos.
- [ ] Executar os testes específicos e confirmar falha por módulos inexistentes.
- [ ] Implementar tipos, normalização, documento de busca e correspondência mínima.
- [ ] Executar os testes e confirmar aprovação.
- [ ] Refatorar sem alterar comportamento.

### Task 2: Destaques seguros e explicação de correspondências

**Files:**
- Create: `src/search/searchHighlight.tsx`
- Test: `src/search/searchHighlight.test.tsx`
- Modify: `src/components/DemandasTable.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `DemandSearchMatch`
- Produces: `HighlightedText({ text, query })`
- Produces: apresentação `Encontrado em` e trecho do histórico.

- [ ] Escrever testes falhos para destaque sem HTML e correspondência sem acento.
- [ ] Executar testes e confirmar a falha esperada.
- [ ] Implementar divisão segura do texto em nós React e integrar à tabela.
- [ ] Adicionar chips e trecho contextual com estilos acessíveis.
- [ ] Executar testes unitários e de componente.

### Task 3: Período avançado

**Files:**
- Create: `src/search/periodFilter.ts`
- Test: `src/search/periodFilter.test.ts`
- Modify: `src/components/FilterPanel.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `PeriodField = 'limite1' | 'limite2' | 'historico'`
- Produces: `matchesPeriod(demanda, historico, filter): boolean`

- [ ] Escrever testes falhos para limites abertos, intervalo completo, histórico e intervalo invertido.
- [ ] Executar testes e confirmar falha.
- [ ] Implementar parser de datas e filtro inclusivo.
- [ ] Integrar campo de data, início e fim em “Mais filtros”.
- [ ] Persistir `periodoCampo`, `periodoInicio` e `periodoFim` na URL.
- [ ] Exibir erro acessível quando início for posterior ao fim.
- [ ] Executar testes e build TypeScript.

### Task 4: Buscas recentes e atalho Ctrl/Cmd+K

**Files:**
- Create: `src/search/recentSearches.ts`
- Test: `src/search/recentSearches.test.ts`
- Modify: `src/components/FilterPanel.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Produces: `loadRecentSearches`, `saveRecentSearch`, `clearRecentSearches`
- FilterPanel receives `searchInputRef` and `onCommitSearch`.

- [ ] Escrever testes falhos para limite, deduplicação, ordem e limpeza.
- [ ] Implementar persistência segura com fallback quando localStorage não estiver disponível.
- [ ] Exibir recentes somente com foco e busca vazia.
- [ ] Registrar pesquisa em Enter, clique em recente ou perda de foco com consulta não vazia.
- [ ] Implementar Ctrl/Cmd+K com prevenção de conflito e seleção do texto.
- [ ] Executar testes de integração do App e FilterPanel.

### Task 5: Integração completa e regressão

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/FilterPanel.tsx`
- Modify: `src/components/DemandasTable.tsx`
- Modify: `tests/e2e/app.spec.ts` ou arquivo E2E equivalente
- Modify: `docs/RELATORIO_ESTADO_ATUAL.md`

**Interfaces:**
- App calcula `SearchResult[]` uma única vez e passa `match` para cada linha.
- Exportação continua recebendo todas as demandas correspondentes ao recorte.

- [ ] Escrever teste de integração para `cessão ricardo 2025` em campos distintos.
- [ ] Escrever teste E2E para busca, destaque, recentes, atalho e período.
- [ ] Confirmar falhas antes da integração final.
- [ ] Integrar todos os utilitários sem duplicar normalização nos componentes.
- [ ] Atualizar documentação funcional.
- [ ] Executar `npm run lint`.
- [ ] Executar `npm run test:coverage`.
- [ ] Executar `npm run build` e `npm run check:bundle`.
- [ ] Executar `npm run test:e2e`.
- [ ] Revisar diff para excluir dados reais, credenciais e alterações de banco.

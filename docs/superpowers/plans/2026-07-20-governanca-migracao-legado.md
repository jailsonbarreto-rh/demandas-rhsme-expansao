# Governança e Migração Legada Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrar governança técnica permanente e uma ferramenta administrativa auditável para preparar exportações paginadas do sistema legado e validá-las no Supabase sem gravar dados.

**Architecture:** Scripts Node.js isolados da SPA leem CSV/XLSX, normalizam e validam registros, geram artefatos de revisão e enviam apenas dry-run à RPC existente. ESLint, cobertura, assinaturas npm e Dependabot passam a integrar o fluxo de qualidade do repositório.

**Tech Stack:** Node.js 24, Vitest 4.1.10, V8 coverage, ESLint 9, typescript-eslint 8, csv-parse 7, ExcelJS 4.4, Supabase JS 2.110.7, GitHub Actions.

## Global Constraints

- Não expor `SUPABASE_SECRET_KEY` na aplicação web.
- Não executar `p_apply = true` nesta entrega.
- Não alterar schema, RLS ou dados de produção.
- Preservar Node.js 24 e TypeScript 5.9.
- Fixar versões no `package.json` e atualizar o lockfile.
- Fazer a validação final com `npm run check:full`.

---

### Task 1: Dependências e análise estática

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `eslint.config.mjs`

**Interfaces:**
- Produces: `npm run lint`, `npm run lint:fix`, `npm run test:coverage`.

- [ ] Adicionar ESLint, plugins de Hooks e acessibilidade, typescript-eslint, globals, cobertura V8 e csv-parse com versões fixas.
- [ ] Criar flat config com ambientes separados para navegador, Node e testes.
- [ ] Executar `npm run lint` e corrigir violações reais sem desativar regras de alto valor.
- [ ] Confirmar que não há advertências com `--max-warnings=0`.

### Task 2: Cobertura e CI

**Files:**
- Modify: `vite.config.ts`
- Modify: `.github/workflows/dependency-health.yml`

**Interfaces:**
- Produces: relatório de cobertura em `coverage/` e artefato do GitHub Actions.

- [ ] Configurar V8 com relatórios text, JSON summary e HTML.
- [ ] Definir limites iniciais baseados no resultado real do projeto.
- [ ] Executar verificação de assinaturas após `npm ci`.
- [ ] Inserir lint e cobertura antes do build.
- [ ] Publicar cobertura como artefato, inclusive quando uma etapa posterior falhar.

### Task 3: Testes do conversor legado

**Files:**
- Create: `scripts/migration/legacy-data.test.mjs`
- Create: `scripts/migration/dry-run-import.test.mjs`

**Interfaces:**
- Consumes: funções ainda inexistentes de `legacy-data.mjs` e `dry-run-import.mjs`.
- Produces: especificação executável da correção de caracteres, consolidação, validação e montagem do dry-run.

- [ ] Escrever testes para mojibake, CSV com aspas, status, tipo, datas, duplicidades, campos ausentes e XLSX de uma coluna.
- [ ] Executar os testes e confirmar falha por módulos ausentes.

### Task 4: Núcleo de preparação e relatórios

**Files:**
- Create: `scripts/migration/legacy-data.mjs`
- Create: `scripts/migration/prepare-legacy-csv.mjs`

**Interfaces:**
- Produces: `prepareLegacyMigration({ inputPaths, outputDir, defaults })` e CLI `npm run migration:prepare`.

- [ ] Implementar leitura de CSV UTF-8 com BOM e detecção de delimitador.
- [ ] Implementar leitura de XLSX tabular ou XLSX com cada linha CSV na coluna A.
- [ ] Implementar correção conservadora de mojibake.
- [ ] Normalizar cabeçalhos, status, datas e tipos.
- [ ] Detectar duplicidades e pendências impeditivas.
- [ ] Gerar payload, manifesto, issues.csv e relatório Excel.
- [ ] Executar os testes e confirmar aprovação.

### Task 5: Dry-run Supabase

**Files:**
- Create: `scripts/migration/dry-run-import.mjs`

**Interfaces:**
- Produces: `buildDryRunArgs(...)`, `runDryRun(...)` e CLI `npm run migration:dry-run`.

- [ ] Recusar URL, chave secreta ou ator ausentes.
- [ ] Carregar payload e manifesto.
- [ ] Invocar `importar_sme_demandas_lote` com `p_apply = false`.
- [ ] Gravar `dry-run-receipt.json` sem segredos.
- [ ] Executar testes unitários sem rede.

### Task 6: Governança de atualizações e documentação

**Files:**
- Create: `.github/dependabot.yml`
- Modify: `.gitignore`
- Create: `docs/MIGRACAO_LEGADO.md`

**Interfaces:**
- Produces: política semanal de dependências e procedimento operacional da migração.

- [ ] Configurar Dependabot para npm e GitHub Actions.
- [ ] Agrupar patches/minors e manter majors para análise individual.
- [ ] Ignorar diretórios locais de saída e arquivos de dados reais.
- [ ] Documentar preparação, leitura do relatório, dry-run, segurança e reconciliação.

### Task 7: Verificação integral e PR

**Files:**
- Verify all changed files.

**Interfaces:**
- Produces: PR revisável sem alteração de produção.

- [ ] Executar `npm audit --audit-level=high`.
- [ ] Executar `npm audit signatures`.
- [ ] Executar `npm run lint`.
- [ ] Executar `npm run test:coverage`.
- [ ] Executar `npm run build` e `npm run check:bundle`.
- [ ] Executar Playwright/Axe desktop e mobile.
- [ ] Revisar diff e confirmar ausência de segredos e dados reais.
- [ ] Abrir PR com resultados e riscos residuais.

# G1 — Ferramental geral de Query e Supabase

**Data:** 9 de agosto de 2026
**Status:** plano de implementação autorizado pelo responsável do produto
**Base:** `main` em `f60acc3fa7bc69761a9c46bce824935c450e1de6`

## Objetivo

Aumentar a qualidade geral do SITE CTRH sem alterar regra de negócio, dados, Supabase Production ou comportamento de produção.

O pacote G1 é deliberadamente pequeno e reversível. Ele adiciona análise estática específica do TanStack Query e ferramentas de diagnóstico somente em desenvolvimento. A modernização do `supabase/setup-cli` será aplicada somente quando a versão estável do pacote npm `supabase` puder reproduzir ou superar a versão do CLI atualmente validada no CI, evitando downgrade disfarçado de atualização.

## Estado verificado

- `@tanstack/react-query` está em `5.101.4`.
- O plugin oficial `@tanstack/eslint-plugin-query` possui configuração flat recomendada e versão `5.101.4` disponível.
- `@tanstack/react-query-devtools` possui versão `5.101.4`, alinhada ao Query instalado.
- O CI usa `supabase/setup-cli@v2.1.1` com Supabase CLI `2.111.0`.
- `supabase/setup-cli@v3` passa a resolver o CLI pelo pacote npm.
- No momento desta implementação, o canal npm estável do pacote `supabase` está em `2.110.0`, enquanto `2.111.0` ainda está no canal beta.

## Decisão de segurança sobre Supabase CLI

Não reduzir o CLI de `2.111.0` para `2.110.0` apenas para adotar o Action v3.

A migração para `supabase/setup-cli@v3` e a inclusão de `supabase` como `devDependency` ficam preparadas, mas não executadas neste pacote enquanto o npm estável não alcançar ao menos `2.111.0`. O PR automático #142 não deve ser integrado antes disso.

## Implementação autorizada neste G1

### 1. ESLint oficial do TanStack Query

Adicionar `@tanstack/eslint-plugin-query@5.101.4` em `devDependencies` e aplicar `flat/recommended` no `eslint.config.mjs`.

Critérios:

- não relaxar regras existentes;
- corrigir eventuais violações reais encontradas;
- não converter erros em warnings apenas para passar o gate;
- manter `eslint . --max-warnings=0`.

### 2. React Query Devtools somente em desenvolvimento

Adicionar `@tanstack/react-query-devtools@5.101.4` em `devDependencies`.

Carregar a ferramenta apenas quando `import.meta.env.DEV` for verdadeiro, usando importação dinâmica e `React.lazy`, de forma que o bundle de produção não dependa do painel de diagnóstico.

O painel começa fechado e não altera fluxo de usuários.

### 3. Lockfile

Regenerar `package-lock.json` com npm sob Node 24, sem `--force`, sem `--legacy-peer-deps` e sem editar manualmente metadados de integridade.

### 4. Documentação

Registrar no Handoff e nos documentos de manutenção que:

- o G1 adotou lint e devtools do Query;
- a atualização do Supabase CLI v3 foi conscientemente adiada por diferença entre o CLI validado e o pacote npm estável;
- nenhuma alteração de produção ou banco ocorreu.

## Testes

Executar, no mínimo:

1. `npm ci`;
2. `npm run check:docs`;
3. `npm audit --audit-level=high`;
4. `npm audit signatures`;
5. `npm run lint`;
6. `npm run test:coverage`;
7. `npm run build`;
8. `npm run check:bundle`;
9. `npm run check:public-bundle`;
10. `npm run test:e2e`.

Validar especificamente que:

- o plugin do Query está ativo;
- nenhuma regra recomendada foi desabilitada para acomodar o código;
- Devtools aparecem em desenvolvimento;
- strings/componentes do Devtools não aparecem no bundle público de produção;
- não há alteração em chamadas Supabase, cache, QueryClient ou regras de invalidação.

## Rollback

Reverter conjuntamente:

- entradas de `package.json`;
- `package-lock.json`;
- configuração ESLint;
- montagem condicional do Devtools;
- documentação do G1.

Não há migration, dado ou configuração externa a reverter.

## Fora do escopo

- Supabase Production;
- migrations;
- Vercel Production;
- Sentry/observabilidade;
- Lighthouse CI;
- MSW;
- fast-check;
- json-canonicalize;
- pgTAP;
- CodeQL;
- atualização geral das demais dependências;
- mudança de regra de negócio ou interface de produção.

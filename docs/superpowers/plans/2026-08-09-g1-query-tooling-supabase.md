# G1 — Ferramental geral de Query e Supabase

**Data:** 9 de agosto de 2026  
**Status:** implementação autorizada  
**Base:** `main` após PRs #149 e #150 (`df17b634e41b83cae20bed1a67ce3c397aae2ddc`)

## Objetivo

Aumentar a qualidade geral do SITE CTRH sem alterar regra de negócio, dados, Supabase Production ou comportamento de produção.

O G1 adiciona fiscalização específica para TanStack Query e diagnóstico visual somente em desenvolvimento. Também amplia o gate de produção para provar que ferramentas de desenvolvimento não chegam ao bundle publicado.

## Contexto

A primeira tentativa do G1, no PR #148, revelou duas questões independentes da proposta original:

1. uma nova vulnerabilidade transitiva em `brace-expansion`, corrigida e integrada pelo PR #149;
2. uploads de artifacts do GitHub Actions podiam impedir a execução dos gates reais quando a cota de armazenamento estivesse esgotada, corrigido pelo PR #150.

O PR #148 é substituído por esta implementação sobre a linha de base corrigida.

## Implementação

### 1. ESLint oficial do TanStack Query

Adicionar `@tanstack/eslint-plugin-query@5.101.4` em `devDependencies` e aplicar `flat/recommended` no `eslint.config.mjs`.

Não desabilitar regras recomendadas para acomodar o código. Eventuais violações reais devem ser corrigidas.

A primeira execução já identificou um caso real em `useDemandasData`: o callback `reload` dependia do objeto inteiro retornado por `useQuery`, cuja identidade não é estável. A correção usa apenas a referência estável `refetch`.

### 2. React Query Devtools exclusivamente em desenvolvimento

Adicionar `@tanstack/react-query-devtools@5.101.4` em `devDependencies`.

O componente é isolado em `src/dev/QueryDevtools.tsx` e carregado dinamicamente somente quando `import.meta.env.DEV` for verdadeiro. Começa fechado e não altera o fluxo do usuário.

### 3. Gate explícito de exclusão do bundle

Adicionar `scripts/check-dev-only-tools.mjs` com sentinela exclusiva do módulo de desenvolvimento.

Depois do build de produção, o gate deve provar que a sentinela não aparece em nenhum JS, CSS, HTML ou sourcemap de `dist`.

O workflow principal passa a executar também:

- `npm run check:public-bundle`;
- `npm run check:dev-only-tools`.

### 4. Supabase CLI

O projeto já possui Supabase CLI no CI, validado em `2.111.0` por `supabase/setup-cli@v2.1.1`.

A Action v3 resolve o CLI pelo pacote npm. No início desta implementação, o canal npm estável estava em versão inferior à já validada no projeto, enquanto a equivalência estava em beta. Portanto:

- não fazer downgrade;
- não adotar beta apenas para modernizar a Action;
- manter a configuração atual até o pacote npm estável alcançar ou superar a versão validada;
- reavaliar a Action v3 em pacote próprio.

## Dependências

Novas dependências de desenvolvimento:

- `@tanstack/eslint-plugin-query@5.101.4`;
- `@tanstack/react-query-devtools@5.101.4`.

Nenhuma nova dependência de runtime de produção é adicionada.

## Lockfile

Regenerar `package-lock.json` exclusivamente pelo npm em Node 24, sem `--force`, sem `--legacy-peer-deps` e sem edição manual de integridade.

## Validação

Executar:

1. `npm ci`;
2. `npm run check:docs`;
3. `npm audit --audit-level=high`;
4. `npm audit signatures`;
5. `npm run test:dependency-compat`;
6. `npm run lint`;
7. `npm run test:coverage`;
8. `npm run build`;
9. `npm run check:bundle`;
10. `npm run check:public-bundle`;
11. `npm run check:dev-only-tools`;
12. `npm run test:e2e`.

Critérios específicos:

- plugin do Query efetivamente ativo;
- nenhuma regra recomendada desabilitada;
- Devtools disponíveis em desenvolvimento;
- Devtools ausentes do bundle de produção;
- ausência de mudança em QueryClient, política de cache, retries, Realtime ou invalidação, exceto a estabilização da dependência de `refetch` sem mudança comportamental;
- audit permanece com zero vulnerabilidades.

## Rollback

Reverter conjuntamente:

- duas devDependencies;
- lockfile;
- configuração ESLint;
- módulo e montagem condicional dos Devtools;
- gate `check:dev-only-tools`;
- ajuste de dependência do callback `reload`;
- documentação do G1.

Não há migration, dado, configuração remota ou deploy para reverter.

## Fora do escopo

- Supabase Production;
- migrations ou RLS;
- Vercel Production;
- Sentry ou outra observabilidade;
- Lighthouse CI;
- MSW;
- fast-check;
- json-canonicalize;
- pgTAP;
- CodeQL;
- ESLint 10;
- TypeScript 7;
- atualização geral das demais dependências.

# G1 — Ferramental TanStack Query — 2026-08-09

## Escopo

O G1 adiciona duas ferramentas de desenvolvimento alinhadas à versão `5.101.4` já usada pelo TanStack Query:

- `@tanstack/eslint-plugin-query`;
- `@tanstack/react-query-devtools`.

O plugin oficial de lint usa a configuração `flat/recommended` sem desabilitar regras. A primeira execução identificou uma dependência instável real em `useDemandasData`; o callback de recarga passou a depender diretamente da referência estável `refetch`, sem mudança da política de cache ou do comportamento funcional.

Os Devtools ficam isolados em `src/dev/QueryDevtools.tsx`, são carregados dinamicamente somente com `import.meta.env.DEV` e iniciam fechados. O build de produção passa por um gate específico que procura uma sentinela exclusiva desse módulo e reprova caso ela apareça em `dist`.

## Lockfile

O `package-lock.json` foi regenerado pelo npm em Node 24 pelo workflow temporário do G1. O lockfile inclui exatamente as duas novas devDependencies e preserva a correção transitiva de segurança integrada pelo PR #149.

## CI

O workflow principal passa a executar, depois do build:

- `npm run check:bundle`;
- `npm run check:public-bundle`;
- `npm run check:dev-only-tools`.

Assim, o PR prova não apenas orçamento de bundle, mas também ausência de informação sensível e exclusão das ferramentas exclusivas de desenvolvimento.

## Supabase CLI

A atualização de `supabase/setup-cli` para v3 permanece fora do G1. O projeto mantém a versão do CLI já validada até que a resolução estável via npm permita modernização sem downgrade nem adoção beta por conveniência.

## Limites

O G1 não altera banco, migrations, RLS, dados, Supabase Production, Vercel Production, regras de negócio, Realtime, retries ou política de cache.

A integração depende do gate integral do repositório em commit de usuário após a regeneração automática do lockfile.

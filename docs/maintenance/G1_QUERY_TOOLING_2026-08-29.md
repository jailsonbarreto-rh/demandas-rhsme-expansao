# G1 — Ferramental TanStack Query — 29 de agosto de 2026

## Objetivo

Concluir a integração do ferramental oficial de desenvolvimento do TanStack Query sobre a linha de base atualizada pelo PR #161, sem reintroduzir o lockfile anterior.

## Implementação

- `@tanstack/eslint-plugin-query@5.101.4` em `devDependencies`;
- configuração oficial `flat/recommended`, sem supressão das regras do plugin;
- `@tanstack/react-query-devtools@5.101.4` carregado somente quando `import.meta.env.DEV` é verdadeiro;
- módulo isolado em `src/dev/QueryDevtools.tsx`;
- correção da dependência instável do callback de recarga em `useDemandasData`, passando a depender da referência estável `refetch`;
- gate `check:dev-only-tools` para provar que os Devtools não entram em `dist`;
- workflow principal passa a executar explicitamente `check:public-bundle` e `check:dev-only-tools`.

## Base de dependências preservada

Este G1 parte da `main` após o PR #161 e preserva as versões atualizadas de Supabase JS, React Hook Form, React Router, Vite, Vitest, TypeScript-ESLint e o novo `fast-check`.

## Segurança

O lockfile será regenerado pelo npm em Node 24. O gate exige audit sem vulnerabilidades altas, assinaturas, lint, cobertura, build, orçamento de bundle, inspeção do bundle público, exclusão dos Devtools e Playwright.

## Limites

Nenhuma mudança em banco, migrations, RLS, dados, Supabase Production, Vercel Production, política de cache, retries, Realtime ou regras de negócio.

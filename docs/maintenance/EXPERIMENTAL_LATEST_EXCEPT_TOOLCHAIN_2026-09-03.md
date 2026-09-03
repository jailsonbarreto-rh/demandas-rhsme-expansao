# Atualização ampla de dependências — 3 de setembro de 2026

**Contexto:** janela pré-liberação e pré-migração utilizada deliberadamente para testar versões recém-publicadas e majors com risco maior.

## Atualizações aprovadas pelo experimento

- `@supabase/supabase-js`: 2.112.4 → 2.114.0
- `@tanstack/react-query`: 5.101.4 → 5.102.8
- `@tanstack/eslint-plugin-query`: 5.101.4 → 5.102.8
- `@tanstack/react-query-devtools`: 5.101.4 → 5.102.8
- `motion`: 13.1.1 → 13.2.0
- `react-hook-form`: 7.86.0 → 7.87.0
- `zod`: 4.4.3 → 4.5.4
- `@testing-library/react`: 16.3.2 → 16.3.3
- `@testing-library/user-event`: 14.6.6 → 14.6.7
- `@types/node`: 24.13.3 → 26.4.1
- `globals`: 17.11.0 → 17.12.0
- `knip`: 6.32.2 → 6.34.0
- `typescript-eslint`: 8.68.0 → 8.69.0

A instalação foi feita sem `--force` e sem `--legacy-peer-deps`.

## Segurança transitiva

O primeiro gate detectou duas vulnerabilidades altas em `browserslist <=4.28.6` (GHSA-c83g-rgw3-j3cx e GHSA-73wf-gq98-2v4g). A correção não exigiu downgrade nem alteração de dependência direta: `npm audit fix` atualizou apenas a resolução transitiva do lockfile. O gate seguinte aprovou `npm audit --audit-level=high`.

## TanStack Table 9.2.4

Foi instalado e testado deliberadamente na primeira passagem, mas o simples bump não pôde ser integrado. A suíte reproduziu 14 falhas concentradas em `DemandasTable.tsx`, com `TypeError: getCoreRowModel is not a function`, comprovando que a v9 exigia migração estrutural.

A migração própria foi executada em seguida pelo PR #178. O componente passou para `useTable`, features explícitas de sorting/pagination/sizing, row models v9, `sortFn` e células core. O gate integral passou com 365 testes e 42 cenários Playwright. Assim, `@tanstack/react-table@9.2.4` está agora integrado à `main`.

## TypeScript 7.0.2

Não é instalável de forma coerente com o toolchain atual. `typescript-eslint@8.69.0` declara peer `typescript >=4.8.4 <6.1.0`. O experimento falhou com ERESOLVE antes de qualquer teste. TypeScript permanece em 6.0.3.

## ESLint 10.9.1

A instalação limpa confirmou bloqueio upstream: `eslint-plugin-jsx-a11y@6.10.2` declara peer ESLint apenas até a linha 9. Adotar ESLint 10 agora exigiria remover o gate de acessibilidade, usar bypass de peer ou código não publicado. Nenhuma dessas opções foi aceita. ESLint permanece em 9.39.5 e `@eslint/js` em 9.39.5.

## Gate final do lote viável

Após retirar apenas TanStack Table 9 e corrigir `browserslist` transitivo, o gate integral passou:

- instalação bloqueada e reproduzível;
- documentação canônica;
- audit de vulnerabilidades;
- assinaturas e proveniência;
- lint/análise estática;
- testes unitários e de integração;
- cobertura;
- build TypeScript/Vite;
- orçamento e inspeção de bundle;
- exclusão de ferramentas de desenvolvimento do bundle público;
- smoke tests Playwright/Chromium.

Não houve alteração de banco, migrations, RLS, dados ou regras de negócio.

## Evolução posterior do experimento

O PR #178 concluiu a migração estrutural do TanStack Table 9.2.4. A `main` passou a `4d9ec654b6feb1acd43329861eedd1ac5c8c12bf`. O bundle inicial permaneceu em 220.031 bytes, sem redução mensurável em relação ao Table 8, e 42/42 cenários Playwright permaneceram aprovados. Production segue sem essa rodada, com deploy automático bloqueado.

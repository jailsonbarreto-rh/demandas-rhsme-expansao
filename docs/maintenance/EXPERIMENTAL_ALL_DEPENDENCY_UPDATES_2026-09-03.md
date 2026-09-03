# Experimento de atualização integral de dependências — 3 de setembro de 2026

**Objetivo:** atualizar todas as dependências diretas para a tag npm latest, inclusive majors, durante a janela pré-liberação e pré-migração.

**Política:** sem --force, sem --legacy-peer-deps e sem supressão artificial de incompatibilidades.

| Grupo | Pacote | Antes | Candidato |
|---|---|---:|---:|
| dependencies | @supabase/supabase-js | 2.112.4 | 2.114.0 |
| dependencies | @tanstack/react-query | 5.101.4 | 5.102.8 |
| dependencies | @tanstack/react-table | 8.21.3 | 9.2.4 |
| dependencies | motion | 13.1.1 | 13.2.0 |
| dependencies | react-hook-form | 7.86.0 | 7.87.0 |
| dependencies | zod | 4.4.3 | 4.5.4 |
| devDependencies | @eslint/js | 9.39.5 | 10.0.1 |
| devDependencies | @tanstack/eslint-plugin-query | 5.101.4 | 5.102.8 |
| devDependencies | @tanstack/react-query-devtools | 5.101.4 | 5.102.8 |
| devDependencies | @testing-library/react | 16.3.2 | 16.3.3 |
| devDependencies | @testing-library/user-event | 14.6.6 | 14.6.7 |
| devDependencies | @types/node | 24.13.3 | 26.4.1 |
| devDependencies | eslint | 9.39.5 | 10.9.1 |
| devDependencies | globals | 17.11.0 | 17.12.0 |
| devDependencies | knip | 6.32.2 | 6.34.0 |
| devDependencies | typescript | 6.0.3 | 7.0.2 |
| devDependencies | typescript-eslint | 8.68.0 | 8.69.0 |

## npm install

**Resultado:** FALHA DE COMPATIBILIDADE

~~~text
npm error code ERESOLVE
npm error ERESOLVE unable to resolve dependency tree
npm error
npm error While resolving: demandas-rhsme@1.0.0
npm error Found: typescript@7.0.2
npm error node_modules/typescript
npm error   dev typescript@"7.0.2" from the root project
npm error
npm error Could not resolve dependency:
npm error peer typescript@">=4.8.4 <6.1.0" from typescript-eslint@8.69.0
npm error node_modules/typescript-eslint
npm error   dev typescript-eslint@"8.69.0" from the root project
npm error
npm error Fix the upstream dependency conflict, or retry this command with --force or --legacy-peer-deps to accept an incorrect (and potentially broken) dependency resolution.
npm error
npm error
npm error For a full report see:
npm error /home/runner/.npm/_logs/2026-09-03T03_15_32_359Z-eresolve-report.txt
npm error A complete log of this run can be found in: /home/runner/.npm/_logs/2026-09-03T03_15_32_359Z-debug-0.log

~~~

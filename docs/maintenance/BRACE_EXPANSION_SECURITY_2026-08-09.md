# Correção de segurança — brace-expansion — 2026-08-09

## Contexto

Durante a validação do pacote G1, `npm audit --audit-level=high` passou a reprovar a árvore já existente da `main` por uma nova vulnerabilidade de alta severidade em `brace-expansion` que alcança a versão `5.0.8`, anteriormente adotada como override de segurança.

O alerta não foi introduzido pelo TanStack Query. O G1 apenas executou o gate depois da publicação do novo advisory e tornou o problema visível.

## Causa

O projeto havia elevado globalmente `brace-expansion` para `5.0.8` para corrigir vulnerabilidade anterior. Essa troca exigiu dois patches em consumidores antigos de `minimatch`, pois a API da linha 5 difere da linha CommonJS historicamente esperada por esses consumidores.

Com o novo advisory, a linha 5 até `5.0.8` deixou de ser aceitável para o gate de segurança.

## Solução adotada para validação

- substituir o override global `brace-expansion: 5.0.8` por `2.1.3`, linha de manutenção recém-publicada e fora da faixa afetada reportada pelo audit;
- remover os dois patches de `minimatch`, porque `brace-expansion@2.1.3` preserva a exportação CommonJS esperada pelos consumidores antigos;
- remover `patch-package`, que perde sua única finalidade no repositório se os testes confirmarem compatibilidade nativa;
- ampliar `test:dependency-compat` para validar consumidores antigos e modernos, limites de expansão e ExcelJS;
- regenerar o lockfile exclusivamente pelo npm em Node 24;
- exigir audit limpo e gate integral antes de integração.

## Alternativas rejeitadas

### `npm audit fix --force`

Rejeitada porque propõe ESLint 10 como mudança quebradora. O projeto mantém ESLint 9 deliberadamente enquanto `eslint-plugin-jsx-a11y` não oferece compatibilidade oficial suficiente com ESLint 10.

### Permanecer em `5.0.8`

Rejeitada porque mantém o gate de alta severidade reprovado.

### Usar beta ou fork não oficial

Rejeitada porque não é necessário enquanto existe linha de manutenção oficial compatível a ser validada.

## Validação obrigatória

1. `npm ci`;
2. `npm audit --audit-level=high`;
3. `npm audit signatures`;
4. `npm run test:dependency-compat`;
5. `npm run check:docs`;
6. `npm run lint`;
7. `npm run test:coverage`;
8. `npm run build`;
9. `npm run check:bundle`;
10. `npm run check:public-bundle`;
11. `npm run test:e2e`.

A correção não altera regra de negócio, banco, RLS, dados, Vercel ou interface.
# Correção de segurança — brace-expansion — 2026-08-09

## Contexto

Durante a validação do pacote G1, `npm audit --audit-level=high` passou a reprovar a árvore já existente da `main` por uma nova vulnerabilidade de alta severidade em `brace-expansion` que alcança a versão `5.0.8`, anteriormente adotada como override de segurança.

O alerta não foi introduzido pelo TanStack Query. O G1 apenas executou o gate depois da publicação do novo advisory e tornou o problema visível.

## Causa

O projeto havia elevado globalmente `brace-expansion` para `5.0.8` para corrigir vulnerabilidade anterior. Essa troca exigiu dois patches em consumidores antigos de `minimatch`, pois a API da linha 5 difere da linha CommonJS historicamente esperada por esses consumidores.

O advisory `GHSA-rgw5-rvv9-x895` demonstrou um bypass da mitigação anterior: o limite de comprimento não era acumulado corretamente entre alternativas separadas por vírgula e também não era aplicado cedo o suficiente durante a geração de sequências largas.

## Investigação e hipóteses descartadas

### `brace-expansion@2.1.3`

Foi testado inicialmente porque preservava a API CommonJS e parecia estar fora da primeira faixa exibida pelo audit. A validação real no CI mostrou que `2.1.3` também é afetado pelo novo advisory. A hipótese foi descartada sem integração.

### `npm audit fix --force`

Rejeitado porque propõe ESLint 10 como mudança quebradora. O projeto mantém ESLint 9 deliberadamente enquanto `eslint-plugin-jsx-a11y` não oferece compatibilidade oficial suficiente com ESLint 10.

### Permanecer em `5.0.8`

Rejeitado porque mantém o gate de alta severidade reprovado.

## Correção oficial identificada

O repositório oficial de `brace-expansion` contém o backport específico do `GHSA-rgw5-rvv9-x895` para a linha 2. O commit de correção limita o tamanho total acumulado entre alternativas, aplica `maxLength` durante a geração de sequências e preserva a semântica de alternativas vazias. A versão correspondente foi marcada como `v2.1.4`.

A linha 2 é preferível neste projeto porque:

- possui a correção específica do advisory;
- mantém a exportação CommonJS esperada pelos consumidores antigos de `minimatch`;
- permite remover os dois patches criados somente para adaptar esses consumidores à API da linha 5;
- permite remover `patch-package`, caso o gate integral confirme que não existe outro patch necessário;
- reduz a quantidade de manutenção local sem trocar ESLint ou consumidores transitivos.

## Solução em validação final

- substituir o override global `brace-expansion: 5.0.8` por `2.1.4`;
- remover os dois patches de `minimatch`;
- remover `patch-package` e o `postinstall` associado;
- ampliar `test:dependency-compat` para validar consumidores antigos e modernos, o caso específico de alternativas acumuladas, sequências largas e ExcelJS;
- regenerar o lockfile exclusivamente pelo npm em Node 24;
- exigir audit limpo e gate integral antes de integração.

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
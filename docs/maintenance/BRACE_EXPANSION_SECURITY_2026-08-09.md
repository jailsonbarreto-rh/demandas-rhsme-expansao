# Correção de segurança — brace-expansion — 2026-08-09

## Contexto

Durante a validação do pacote G1, `npm audit --audit-level=high` passou a reprovar a árvore já existente da `main` por uma nova vulnerabilidade de alta severidade em `brace-expansion` que alcança a versão `5.0.8`, anteriormente adotada como override global de segurança.

O alerta não foi introduzido pelo TanStack Query. O G1 apenas executou o gate depois da publicação do novo advisory e tornou o problema visível.

## Causa

O projeto havia elevado globalmente `brace-expansion` para `5.0.8` para corrigir uma vulnerabilidade anterior. Essa troca exigiu dois patches em consumidores antigos de `minimatch`, pois a API da linha 5 difere da API CommonJS esperada por eles.

O advisory `GHSA-rgw5-rvv9-x895` demonstrou um bypass da mitigação anterior: o limite de comprimento não era acumulado corretamente entre alternativas separadas por vírgula e também não era aplicado cedo o suficiente durante a geração de sequências largas.

## Investigação

### `brace-expansion@2.1.3`

Foi testado inicialmente porque preservava a API CommonJS. O CI confirmou que `2.1.3` também é afetado pelo novo advisory. A hipótese foi descartada sem integração.

### Override global `2.1.4`

O mantenedor publicou backports oficiais do advisory para várias linhas, incluindo `2.1.4`, e o CI confirmou que essa versão passa em `npm audit`. Entretanto, impor `2.1.4` globalmente quebra consumidores modernos de `minimatch`, que dependem da API nomeada das linhas mais recentes.

Essa hipótese também foi descartada. O problema não é apenas escolher uma versão segura: é preservar a linha de API compatível com cada consumidor.

### `npm audit fix --force`

Rejeitado porque propõe ESLint 10 como mudança quebradora e não resolve corretamente a compatibilidade da árvore. O projeto mantém ESLint 9 enquanto `eslint-plugin-jsx-a11y` não oferece suporte oficial suficiente ao ESLint 10.

## Correção final em validação

O repositório oficial de `brace-expansion` já possui correções específicas do `GHSA-rgw5-rvv9-x895` em múltiplas linhas de manutenção, incluindo `1.1.18`, `2.1.4`, `3.0.6` e `5.0.9`.

A solução adotada é:

- remover o override global de `brace-expansion`;
- permitir que cada consumidor resolva a linha compatível declarada por sua própria faixa semântica;
- regenerar integralmente o lockfile pelo npm em Node 24;
- remover os dois patches locais de `minimatch`;
- remover `patch-package` e o `postinstall` associado, caso o gate final confirme que nenhum outro patch é necessário;
- testar todos os consumidores relevantes de `minimatch`;
- inspecionar todas as instâncias de `brace-expansion` presentes no lockfile e executar nelas casos de regressão do advisory;
- exigir `npm audit` limpo e gate integral antes da integração.

Essa abordagem é superior a um override global porque mantém simultaneamente a compatibilidade dos consumidores antigos e modernos e elimina adaptações locais desnecessárias.

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
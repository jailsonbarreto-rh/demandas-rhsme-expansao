# Resolução da compatibilidade de brace-expansion — 28 de julho de 2026

## Diagnóstico confirmado

O override seguro para `brace-expansion` 5.0.8 altera a forma de exportação esperada por duas versões transitivas de `minimatch` presentes na árvore.

- o `minimatch` raiz 3.1.5 usa `var expand = require("brace-expansion")`;
- o `minimatch` 5.1.9 aninhado em `readdir-glob` usa `const expand = require("brace-expansion")`.

A versão corrigida `brace-expansion` 5.0.8 expõe a função pela propriedade `expand`. Os dois consumidores precisam referenciar essa propriedade, mas seus arquivos não possuem o mesmo padrão textual. O script anterior tratava ambos como se fossem idênticos e já era incompatível com a segunda cópia.

A remoção integral do override e do patch foi testada. A instalação, o `minimatch` e o ExcelJS funcionaram, porém a árvore restaurou 13 vulnerabilidades de severidade alta. Portanto, a correção continua necessária enquanto essas dependências transitivas permanecerem.

## Solução adotada

O script próprio que modificava diretamente caminhos internos de `node_modules` foi removido. As duas alterações mínimas passaram a ser mantidas em patches unificados, versionados e aplicados por `patch-package` 8.0.1 durante o `postinstall`.

O override de `brace-expansion` 5.0.8 foi preservado para impedir a regressão das vulnerabilidades. O CI exige a aplicação bem-sucedida de ambos os patches em uma instalação limpa e executa testes específicos sobre expansão de chaves nas duas versões de `minimatch` e geração de Excel.

## Árvore efetiva

```text
demandas-rhsme@1.0.0 /home/runner/work/demandas-rhsme-expansao/demandas-rhsme-expansao
├─┬ eslint-plugin-jsx-a11y@6.10.2
│ └─┬ minimatch@3.1.5
│   └── brace-expansion@5.0.8 overridden
├─┬ eslint@9.39.5
│ ├─┬ @eslint/config-array@0.21.2
│ │ └── minimatch@3.1.5 deduped
│ ├─┬ @eslint/eslintrc@3.3.6
│ │ └── minimatch@3.1.5 deduped
│ └── minimatch@3.1.5 deduped
├─┬ exceljs@4.4.0
│ └─┬ archiver@5.3.2
│   ├─┬ archiver-utils@2.1.0
│   │ └─┬ glob@7.2.3
│   │   └── minimatch@3.1.5 deduped
│   └─┬ readdir-glob@1.1.3
│     └─┬ minimatch@5.1.9
│       └── brace-expansion@5.0.8 deduped
├── patch-package@8.0.1
└─┬ typescript-eslint@8.65.0
  └─┬ @typescript-eslint/typescript-estree@8.65.0
    └─┬ minimatch@10.2.6
      └── brace-expansion@5.0.8 deduped

```

## Controles permanentes

- `npm ci` em árvore removida previamente;
- `patch-package --error-on-fail`;
- auditoria de vulnerabilidades, assinaturas e proveniência;
- teste dos dois arquivos efetivamente corrigidos;
- teste de expansão de chaves nas duas instâncias;
- criação e serialização real de workbook pelo ExcelJS;
- lint tipado, cobertura, build, orçamento de bundle e Playwright.

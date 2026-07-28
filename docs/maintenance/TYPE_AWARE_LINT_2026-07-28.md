# Lint tipado — 28 de julho de 2026

## Escopo ativado

A análise com informação de tipos foi ativada para o código-fonte em `src/**/*.{ts,tsx}`, usando:

- `typescript-eslint.configs.recommendedTypeChecked`;
- `parserOptions.projectService`;
- `@typescript-eslint/no-floating-promises` como erro;
- `@typescript-eslint/no-misused-promises` como erro.

Os arquivos TypeScript operacionais fora de `src` permanecem sob o preset recomendado sem informação de tipos. Essa delimitação acompanha o `tsconfig.json` atual, cujo escopo compilável é `src`.

## Achados corrigidos

O primeiro gate tipado identificou oito promessas de navegação sem tratamento explícito e dois handlers assíncronos fornecidos a atributos que esperavam retorno `void`. As chamadas intencionalmente não aguardadas passaram a usar `void`, e os handlers do cabeçalho receberam adaptadores síncronos explícitos.

## Adoção progressiva

O preset tipado também revelou famílias preexistentes de achados em mapeadores locais, exportação Excel e dublês de teste. As regras `no-unsafe-*`, `no-base-to-string`, `no-unnecessary-type-assertion`, `no-redundant-type-constituents`, `require-await` e `only-throw-error` permanecem explicitamente fora deste PR para evitar uma refatoração funcional ampla sem plano próprio.

Essa delimitação não reduz nem desativa as duas regras de promessas que motivaram o pacote.

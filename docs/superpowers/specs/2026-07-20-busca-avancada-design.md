# Busca Avançada e Encontrabilidade — Design aprovado

## Objetivo

Ampliar a busca da Central de Demandas para localizar registros por conteúdo distribuído entre campos da demanda e histórico, com tolerância a acentos, caixa e pontuação, explicação das correspondências, destaque visual, pesquisas recentes, atalho de teclado e filtro avançado por período.

## Escopo funcional

### Campos pesquisáveis

- número;
- tipo;
- assunto;
- responsável;
- setor;
- classificação;
- status atual;
- comentários do histórico;
- status anteriores;
- setores registrados no histórico;
- datas textuais das movimentações.

### Regra multi-termo

A consulta é dividida em termos normalizados. Todos os termos devem existir na demanda, mas podem estar em campos diferentes e em qualquer ordem.

Exemplo: `cessão ricardo 2025` encontra uma demanda com `cessão` no assunto, `Ricardo` no responsável e `2025` no número.

### Normalização

- indiferente a maiúsculas e minúsculas;
- tolerante a acentos;
- tolerante à pontuação do número;
- tolerante a espaços repetidos;
- preserva o texto original para exibição;
- não usa HTML inseguro.

### Explicação e destaque

A interface informa em quais campos cada correspondência ocorreu. Quando o termo estiver apenas no histórico, exibe trecho contextual da movimentação. Termos visíveis em número, assunto, responsável, setor, tipo e classificação recebem destaque semântico com `<mark>`.

### Buscas recentes

- até cinco consultas;
- salvas somente quando a consulta é efetivamente executada;
- armazenadas localmente por navegador;
- exibidas quando o campo recebe foco e está vazio;
- podem ser aplicadas novamente ou apagadas.

### Atalho

`Ctrl+K` no Windows/Linux e `Command+K` no macOS abre a área Demandas, foca a busca e seleciona o conteúdo atual.

### Pesquisa por período

Em “Mais filtros”, incluir:

- campo de data: Prazo interno, Prazo final ou Movimentação do histórico;
- data inicial;
- data final.

Aceitar intervalo completo ou apenas um limite. Bloquear intervalo cuja data inicial seja posterior à final. Preservar os filtros na URL.

## Arquitetura

Criar utilitários puros e testáveis em `src/search/`:

- `normalizeSearchText` e `tokenizeSearchQuery`;
- `buildDemandSearchDocument`;
- `matchDemandSearch`;
- `findHighlightRanges`;
- `filterByPeriod`;
- `recentSearches`.

A aplicação continuará usando a base já carregada neste ciclo. A API será desenhada para futura substituição pela busca paginada no Supabase.

## Integração de interface

- `App.tsx`: compõe histórico por demanda, aplica busca e período, mantém URL e atalho;
- `FilterPanel.tsx`: campo de busca enriquecido, recentes, atalho e filtros de período;
- `DemandasTable.tsx`: destaque dos termos e indicação dos campos/trecho do histórico;
- CSS: estados de foco, menu de recentes, chips de correspondência e `<mark>`.

## Segurança e limites

- nenhuma migration, RLS ou permissão do Supabase será alterada;
- nenhuma biblioteca externa de busca será adicionada;
- pesquisas recentes permanecem no navegador e não são sincronizadas;
- o histórico completo ainda é o conjunto já carregado pela aplicação;
- busca no servidor será tratada junto da paginação real.

## Critérios de aceite

1. Acentos e caixa não alteram o resultado.
2. Número pode ser localizado com ou sem pontuação.
3. Todos os termos podem estar em campos diferentes.
4. Comentários e movimentações históricas participam da busca.
5. Resultados explicam correspondências invisíveis.
6. Destaques preservam segurança e acessibilidade.
7. Cinco pesquisas recentes podem ser reutilizadas e apagadas.
8. `Ctrl/Cmd+K` foca a busca na área Demandas.
9. Período funciona para prazo interno, final e histórico.
10. Filtros de período são preservados na URL.
11. Testes unitários, integração, build, lint, cobertura e E2E permanecem aprovados.

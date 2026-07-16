# Exportação Excel Analítica — Design

## Objetivo

Substituir a exportação CSV da Central de Demandas por uma exportação `.xlsx` profissional, gerada no navegador, contendo somente os registros resultantes da filtragem ativa.

## Princípios editoriais

A solução seguirá as referências canônicas do projeto para Excel e dashboards: hierarquia visual, leitura em camadas, cores semânticas redundantes com texto, rastreabilidade, metadados, alta compatibilidade com impressão e arquitetura de sistema de informação. O arquivo não será uma grade decorada, mas um documento analítico reutilizável.

## Arquitetura

- `src/export/excelAnalytics.ts`: funções puras para saneamento de texto, conversão de datas, classificação de prazos, agregações, ranking e descrição dos filtros.
- `src/export/exportDemandasExcel.ts`: montagem do workbook com ExcelJS e download do arquivo.
- `src/App.tsx`: carregamento dinâmico do exportador somente quando o usuário clicar, preservando o bundle inicial.
- `src/components/Header.tsx`: substituição da ação “Exportar CSV” por “Exportar Excel”.

## Workbook

### Aba Resumo

- título institucional e descrição do recorte;
- usuário responsável, data/hora, fonte, quantidade e filtros aplicados;
- cartões: total exportado, ativos, encerrados, para assinatura, vencidos e vencendo hoje;
- gráficos tabulares por status, tipo, setor e classificação;
- análise de prazos por situação operacional e faixas de dias;
- ranking dos dez responsáveis com maior volume;
- nota de rastreabilidade e critérios utilizados.

### Aba Demandas

- título, metadados e recorte;
- tabela estruturada com filtros automáticos;
- cabeçalho congelado;
- datas como valores reais do Excel;
- colunas derivadas “Situação do prazo” e “Dias até o prazo”;
- cores semânticas para status e prazos, sempre acompanhadas por texto;
- larguras, quebras de linha e configuração de impressão profissionais.

## Segurança

Textos iniciados por `=`, `+`, `-`, `@`, tabulação ou quebra de linha receberão prefixo de apóstrofo para impedir execução como fórmula. Nenhum dado será enviado a serviço externo. A exportação continuará disponível a todos os usuários autenticados.

## Desempenho

ExcelJS será importado dinamicamente no clique do botão. O código pesado ficará em chunk separado e não aumentará materialmente o bundle inicial da aplicação.

## Testes

- funções analíticas e classificação temporal;
- proteção contra formula injection;
- estrutura, abas, tabela, datas e metadados do workbook;
- ação e nomenclatura do botão;
- build, orçamento do bundle e testes completos do projeto.

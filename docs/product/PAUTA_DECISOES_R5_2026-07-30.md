# Pauta de decisões — Ciclo R5

**Data:** 30 de julho de 2026  
**Estado:** debate pré-implementação  
**Autorização funcional:** nenhuma

## Objetivo do ciclo

O R5 deve completar o uso cotidiano da Central de Demandas em três dimensões:

1. registrar trabalho realizado sem exigir mudança artificial de status;
2. reunir estado atual, ações e trajetória em um prontuário canônico;
3. permitir recuperação administrativa de exclusões sem perda de informação.

O ciclo também poderá decidir como tornar autoria e contexto histórico legíveis e como preservar links e retorno de navegação. Nenhum desses itens está aprovado antecipadamente.

## Ordem de discussão recomendada

### 1. R5-2 — Andamento, transições e reabertura

Questões a decidir:

- em quais estados a ação `Registrar andamento` deve aparecer;
- diferença visual e conceitual entre andamento e alteração de status;
- campos obrigatórios do andamento;
- comportamento da reabertura de demanda encerrada;
- necessidade de motivo para reabrir;
- status disponíveis após reabertura;
- próxima providência exigida na reabertura;
- preservação da posição, filtros e conteúdo digitado.

Decisão pendente principal: **OP-D07**.

### 2. R5-3 — Prontuário canônico

Questões a decidir:

- página completa como superfície principal da demanda;
- papel futuro do drawer atual;
- estrutura e prioridade das informações;
- ordem e expansão da timeline;
- ações permitidas por papel;
- comportamento das rotas `/demandas/:id` e `/minhas-demandas/:id`;
- carregamento independente da lista e dependências mínimas de consulta.

Decisão pendente principal: **OP-D08**.

### 3. R5-1 — Lixeira administrativa e restauração

Questões a decidir:

- informações exibidas na lixeira;
- abertura somente leitura;
- motivo obrigatório de restauração;
- estado recuperado após restauração;
- tratamento das lacunas de prazo e providência;
- necessidade de revisão consciente antes de devolver a demanda à carteira;
- compatibilidade com o adiamento da concorrência otimista.

Decisão pendente principal: **OP-D11**. A proteção de leitura exclusiva do administrador já está implementada por **OP-D17/E4**.

### 4. R5-4 — Autoria legível e contexto dos eventos

Questões a decidir:

- snapshot de nome e setor para novos eventos;
- leitura de autor inativo;
- manutenção explícita de `Autor não identificado` quando não houver prova;
- categorias de origem do evento;
- limites de qualquer backfill;
- distinção visual entre atividade humana, migração e registro técnico.

Decisões pendentes: **OP-D09** e **OP-D10**.

### 5. R5-5 — Busca histórica, links e retorno

Questões a decidir:

- quais campos históricos participam da busca;
- como explicar a correspondência encontrada;
- link interno compartilhável;
- preservação de carteira, filtros, página, scroll e foco;
- tratamento do campo `link_origem`;
- dependências de paginação e consulta remota.

Decisões pendentes: **OP-D12** e **OP-D19**.

## Regras já protegidas

O debate do R5 não reabre automaticamente:

- preservação integral do legado;
- responsabilidade oficial por UUID;
- autoria independente da pessoa responsável;
- exclusão lógica;
- leitura da lixeira restrita a administrador;
- andamento não altera status;
- `Tramitado` não equivale a `Encerrado`;
- encerramento limpa a próxima providência corrente e preserva o histórico;
- lacuna histórica não autoriza inferência;
- próxima providência passada exige justificativa;
- ausência de prazo não equivale a atraso.

## Dependências técnicas que não constituem decisão

- O R1-5 de concorrência otimista está adiado; o R5 não deve presumir `expectedUpdatedAt` disponível.
- Recortes de R2 somente serão antecipados quando indispensáveis a uma função do R5 aprovada.
- A base atual continua pequena o suficiente para não justificar refatoração de escala sem dependência concreta.
- Banco e interface devem continuar aplicando as mesmas regras.

## Primeiro debate

A primeira pauta será **R5-2 — Andamento, transições de status e reabertura**, começando pela análise do funcionamento atual no código e no layout antes de formular decisões novas.

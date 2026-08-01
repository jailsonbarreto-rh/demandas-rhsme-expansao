# Pauta de decisões — Ciclo R5

**Data:** 30 de julho de 2026  
**Estado:** pauta histórica reconciliada por GOV-013 em 1º de agosto de 2026
**Autorização funcional vigente:** R5 Essencial

> As perguntas abaixo preservam o contexto do debate original. GOV-013 encerrou a obrigação de implementar R5-2 a R5-5 como quatro pacotes sucessivos. OP-D07, OP-D08, R5-E-D01, R5-E-D02 e R5-E-A01 definem a menor solução completa; os itens avançados passam a evolução condicionada. Consulte `../execution/ATUALIZACAO_COMPLETUDE_OPERACIONAL_2026-08-01.md`.

## Objetivo do ciclo

O R5 deve completar o uso cotidiano da Central de Demandas em três dimensões:

1. registrar trabalho realizado sem exigir mudança artificial de status;
2. reunir estado atual, ações e trajetória em um prontuário canônico;
3. assegurar consulta administrativa e preservação auditável das exclusões lógicas.

O ciclo também poderá decidir como tornar autoria e contexto histórico legíveis e como preservar links e retorno de navegação. Nenhum item posterior ao R5-1 está aprovado antecipadamente.

## Método de execução aprovado

O R5 não será debatido nem implementado como um bloco único. A sequência obrigatória é:

```text
discussão de um pacote pequeno
→ consolidação das decisões desse pacote
→ registro documental
→ implementação em todas as camadas
→ testes e publicação controlada
→ discussão do pacote seguinte
```

Cada discussão deverá considerar todas as decisões anteriores, o layout vigente, as regras do Supabase, o tratamento do legado, as permissões por papel e os comportamentos já protegidos, evitando alternativas incompatíveis com o produto como um todo.

## Ordem de execução

1. R5-1 — Lixeira administrativa e auditoria — **concluído**;
2. R5 Essencial — andamento, reabertura e consolidação do prontuário atual — **autorizado**;
3. R5 avançado — autoria, página separada e refinamentos de consulta — **evolução condicionada**.

---

## R5-1 — Lixeira administrativa e auditoria

**Estado:** CONCLUÍDO EM PRODUCTION.

### Decisão aprovada — exclusão lógica

- somente perfil ativo de nível `administrador` pode excluir demandas;
- editor e leitor não visualizam a ação `Excluir`;
- não existe exclusão física disponível aos usuários;
- a exclusão exige motivo e registra autoria, data e hora;
- a demanda excluída preserva integralmente seus dados e histórico;
- demandas e históricos excluídos somente podem ser consultados por administrador ativo, inclusive em acesso direto ao banco ou à API.

### Decisão aprovada — lixeira administrativa

A área `/admin` possui a seção `Demandas excluídas`, exclusivamente para administradores, com:

- listagem dos registros logicamente excluídos;
- pesquisa por número, assunto, responsável e motivo;
- consulta do status e dos dados preservados;
- identificação da data, motivo e autor da exclusão quando comprováveis;
- histórico completo da demanda;
- visualização somente leitura.

### Decisão aprovada — ausência de restauração no produto

Não existe:

- botão ou fluxo de restauração;
- escolha de status para retorno;
- edição ou movimentação da demanda na lixeira;
- execução da restauração por usuário autenticado, inclusive administrador;
- retorno automático à carteira.

A expressão `recuperável` significa apenas que a exclusão não destrói o registro. Uma recuperação excepcional poderá ser realizada tecnicamente pelo proprietário do banco, fora do produto, mediante necessidade administrativa específica e procedimento controlado. A função técnica existente permanece no banco, mas sem `EXECUTE` para `public`, `anon`, `authenticated` ou `service_role`.

A decisão OP-D11 foi encerrada por esta regra.

### Evidências de conclusão

- PR funcional #106, merge `6af4110738ca3bcd0b4088a82231790354f97b55`;
- PR de release #107, merge `f222d5f3fcccf56a1ebb2cd553f39de4119c5d02`;
- Production `dpl_HfJTmbcrVdiNeHKChrfuq5otxBGK`, estado `READY`;
- migration `20260730180713_r5_1_disable_product_restore`;
- 69 arquivos e 317 testes aprovados;
- 22 de 22 cenários Playwright aprovados;
- 379 demandas, zero excluídas, 764 históricos e 13 perfis preservados.

---

## R5-2 — Andamento, transições e reabertura

**Estado:** escopo essencial decidido e autorizado; a lista abaixo é o registro das questões originais.

Questões a decidir:

- em quais estados a ação `Registrar andamento` deve aparecer;
- diferença visual e conceitual entre andamento e alteração de status;
- campos obrigatórios do andamento;
- comportamento da reabertura de demanda encerrada;
- necessidade de motivo para reabrir;
- status disponíveis após reabertura;
- próxima providência exigida na reabertura;
- preservação da posição, filtros e conteúdo digitado.

Situação posterior: **OP-D07 aprovada** por GOV-013 e pelo R5 Essencial.

## R5-3 — Prontuário canônico

**Estado:** atendido para o produto inicial pelo drawer e pelas rotas atuais; página separada adiada.

Questões a decidir:

- página completa como superfície principal da demanda;
- papel futuro do drawer atual;
- estrutura e prioridade das informações;
- ordem e expansão da timeline;
- ações permitidas por papel;
- comportamento das rotas `/demandas/:id` e `/minhas-demandas/:id`;
- carregamento independente da lista e dependências mínimas de consulta.

Situação posterior: **OP-D08 aprovada com simplificação**; drawer e rotas atuais são o prontuário inicial.

## R5-4 — Autoria legível e contexto dos eventos

**Estado:** evolução condicionada; nenhuma mudança autorizada.

Questões a decidir:

- snapshot de nome e setor para novos eventos;
- leitura de autor inativo;
- manutenção explícita de `Autor não identificado` quando não houver prova;
- categorias de origem do evento;
- limites de qualquer backfill;
- distinção visual entre atividade humana, migração e registro técnico.

Situação posterior: **OP-D09 e OP-D10 adiadas** como evolução condicionada, sem backfill ou inferência.

## R5-5 — Busca histórica, links e retorno

**Estado:** capacidade básica materializada; refinamentos avançados adiados.

Questões a decidir:

- quais campos históricos participam da busca;
- como explicar a correspondência encontrada;
- link interno compartilhável;
- preservação de carteira, filtros, página, scroll e foco;
- tratamento do campo `link_origem`;
- dependências de paginação e consulta remota.

Situação posterior: **OP-D12 adiada** e capacidade básica de **OP-D19 já materializada** pelas rotas profundas.

## Regras já protegidas

O R5 não reabre automaticamente:

- preservação integral do legado;
- responsabilidade oficial por UUID;
- autoria independente da pessoa responsável;
- exclusão lógica sem destruição do registro;
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

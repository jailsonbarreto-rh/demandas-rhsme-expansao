# Radar de Governança — evolução após a incorporação integral do legado

**Status:** ideias aprovadas para preservação documental; implementação futura condicionada à disponibilidade e confiabilidade dos dados.  
**Data:** 28 de julho de 2026  
**Superfície atual:** `Radar de Governança` na rota inicial do SITE CTRH.

## 1. Finalidade

Este documento preserva as leituras visuais consideradas úteis para a alta gestão, mas que ainda não podem ser calculadas com rigor sobre a base atual. Ele não autoriza implementação automática.

A versão inicial do Radar utiliza somente informações atualmente confiáveis:

- composição por status;
- demandas por setor informado;
- cobertura dos prazos interno e final;
- situação somente entre prazos finais definidos;
- distribuição da carteira por responsável e status;
- registros operacionais recentes.

## 2. Regra metodológica

Uma leitura futura somente poderá entrar no Radar quando:

1. o dado necessário estiver estruturado e disponível;
2. a origem e o significado do campo estiverem documentados;
3. a cobertura for suficiente para a leitura proposta;
4. importações técnicas e datas de carga estiverem separadas de fatos operacionais;
5. o cálculo puder ser reproduzido no sistema, no Excel e nos testes;
6. limitações e denominadores forem apresentados ao usuário;
7. nenhuma ausência for tratada como resultado positivo;
8. nenhuma distribuição de estoque for apresentada como produtividade ou desempenho.

## 3. Leituras futuras condicionadas ao legado completo

### 3.1 Evolução temporal da carteira

Possíveis leituras:

- estoque total por mês;
- novas demandas por período;
- encerramentos por período;
- saldo entre entradas e encerramentos;
- evolução por tipo, classificação ou status.

**Pré-requisito:** data original confiável de entrada no fluxo e separação entre criação operacional e data de importação no novo sistema.

### 3.2 Envelhecimento da carteira

Possíveis faixas:

- até 15 dias;
- 16 a 30 dias;
- 31 a 60 dias;
- 61 a 90 dias;
- mais de 90 dias.

**Pré-requisito:** marco inicial operacional comprovável. `created_at` de importação não pode ser usado como idade real da demanda.

### 3.3 Permanência por status e identificação de gargalos

Possíveis leituras:

- mediana de permanência em cada status;
- demandas há mais tempo na mesma etapa;
- quantidade de entradas e saídas por status;
- etapas com crescimento de estoque;
- retornos recorrentes para ajuste.

**Pré-requisito:** histórico operacional completo, com transições confiáveis e eventos técnicos classificados separadamente.

### 3.4 Próximas providências e agenda de acompanhamento

Possíveis leituras:

- providências vencidas;
- providências previstas para hoje;
- agenda dos próximos sete dias;
- demandas sem providência registrada;
- distribuição por natureza da próxima ação, caso venha a existir catálogo próprio.

**Pré-requisito:** adoção operacional consistente de `proxima_acao` e `proxima_acao_em`, após as decisões e implementações do R4.

### 3.5 Cumprimento de prazos

Possíveis leituras:

- demandas encerradas dentro ou fora do prazo;
- percentual de cumprimento entre casos comparáveis;
- mediana de antecedência ou atraso;
- recortes por tipo, classificação ou setor informado.

**Pré-requisito:** prazo final com cobertura suficiente, data de encerramento confiável e definição explícita do universo comparável.

### 3.6 Perfil ampliado da carteira

Possíveis evoluções do componente atual:

- alternância entre tipo, classificação e setor informado;
- composição por status dentro de cada grupo;
- identificação de valores legados ainda fora de catálogo;
- comparação entre recortes sem inferência de desempenho.

**Pré-requisito:** catálogo e semântica dos campos consolidados após a reconciliação do legado.

### 3.7 Cobertura e qualidade dos dados

Possíveis indicadores:

- responsáveis oficiais associados;
- vínculos legados pendentes;
- prazos informados;
- próximas ações preenchidas;
- classificações normalizadas;
- registros com conflito ou ambiguidade;
- itens pendentes de saneamento humano.

**Pré-requisito:** regras de reconciliação do Trilho B e definição de quais ausências representam lacuna, não aplicabilidade ou dado ainda não migrado.

## 4. Leituras proibidas sem nova decisão expressa

O Radar não deverá apresentar como fato:

- produtividade individual;
- desempenho de servidor ou setor;
- eficiência calculada apenas por volume de estoque;
- velocidade baseada em datas de importação;
- gargalo inferido de poucos eventos;
- cumprimento de prazo quando a maioria não possui prazo informado;
- comparações competitivas entre responsáveis;
- tendência baseada em série temporal insuficiente.

## 5. Regra de continuidade

Após a chegada de todos os dados do sistema legado, deverá ser executada uma auditoria de cobertura, proveniência e qualidade antes de escolher as novas leituras. Cada indicador futuro será debatido como decisão de produto independente, com definição do cálculo, universo, denominador, limitações e apresentação visual.

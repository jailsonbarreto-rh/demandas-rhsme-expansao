# ADR-005 — Semântica neutra do campo setor e das distribuições gerenciais

**Status:** VIGENTE  
**Data:** 27 de julho de 2026  
**Decisão relacionada:** OP-D02  
**Pacote:** E3

## Contexto

O campo `setor` é textual e registra o setor informado na demanda. A simples contagem de demandas agrupadas por esse valor não comprova atividade recente, produtividade, desempenho, esforço realizado nem estrutura organizacional oficial.

Da mesma forma, a quantidade de demandas vinculadas a cada responsável representa distribuição de carteira ou estoque, não classificação competitiva nem avaliação de desempenho.

O vocabulário `Ativas` também era impreciso para demandas não encerradas, porque uma demanda pode estar aguardando retorno externo ou apenas sob monitoramento. O conceito operacional vigente é `Em acompanhamento`.

## Decisão

A interface, os relatórios e os contratos analíticos devem utilizar estas redações:

- `Demandas por setor informado` para a contagem agrupada pelo campo `setor`;
- `Em acompanhamento` para demandas não encerradas;
- `Distribuição por responsável — 10 maiores volumes` para a distribuição quantitativa da carteira.

São proibidas, como linguagem vigente de produto:

- `Setores mais Ativos`;
- `Ativas`, quando significar apenas demandas não encerradas;
- `Ranking de responsáveis`;
- textos que convertam quantidade de demandas em produtividade, desempenho ou atividade humana comprovada.

## Consequências

- cálculos, contagens, filtros e dados permanecem inalterados;
- nenhuma informação do Supabase é modificada;
- a mudança alcança a Visão Geral, o relatório Excel e os nomes internos do contrato analítico;
- futuras métricas de produtividade ou desempenho exigirão decisão própria, fonte adequada, metodologia explícita e cobertura suficiente;
- ocorrências dos termos antigos em documentos históricos podem permanecer quando claramente identificadas como descrição do estado anterior ou instrução de substituição.

## Validação

Os testes de microcopy devem exigir os rótulos vigentes e impedir o retorno dos títulos antigos nas superfícies operacionais e no Excel.

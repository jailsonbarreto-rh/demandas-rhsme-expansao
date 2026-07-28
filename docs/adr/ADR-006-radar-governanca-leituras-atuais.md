# ADR-006 — Radar de Governança e leituras sustentadas pela base atual

**Status:** aprovado; refinamento UX-RADAR-001 em validação  
**Data:** 28 de julho de 2026

## Contexto

A antiga área `Visão Geral` reunia atenção imediata, distribuição por status, distribuição por setor informado e histórico recente. O responsável pelo produto aprovou sua evolução para uma superfície de leitura institucional voltada à alta gestão, sem atribuir aos dados conclusões de produtividade, desempenho ou melhoria automática.

A base atual é majoritariamente legada e possui baixa cobertura de prazos e próximas providências. Portanto, a evolução deve utilizar apenas cálculos sustentados pelos campos existentes e preservar suas limitações por meio de denominadores, contadores de cobertura, rótulos neutros e documentação verificável. Essas salvaguardas não precisam ser repetidas como frases de decisão interna na interface quando não orientam uma ação do usuário.

## Decisão

A área passa a se apresentar como:

- **Título:** `Radar de Governança`;
- **Subtítulo:** `Visão estratégica do fluxo de trabalho, com análise de dados e monitoramento da carteira de demandas.`

A identidade aparece uma única vez no cabeçalho principal, acompanhada do ícone de bússola. O botão inicial de navegação adota o mesmo nome e a página deixa de repetir um hero próprio.

O estado técnico da aplicação é traduzido em mensagem operacional derivada de carregamento e erro, sem citar fornecedor ou mecanismo de armazenamento. A indicação visual `Ctrl/Command+K` não é exibida, mas o atalho permanece protegido.

A primeira evolução acrescenta:

1. **Cobertura dos prazos**
   - prazo interno e prazo final;
   - definidos, não informados e não aplicáveis;
   - percentual de cobertura;
   - situação de vencimento calculada somente sobre prazos finais definidos;
   - denominador exibido ao usuário.

2. **Distribuição por responsável**
   - agrupamento oficial por `responsavel_id`;
   - composição por status;
   - informação textual legada sem UUID preservada como `Vínculo legado pendente`;
   - ausência real exibida como `Sem responsável`;
   - nenhuma inferência de produtividade, desempenho ou equivalência da carga de trabalho.

A composição por status, a distribuição por setor informado, o bloco `Atenção agora` e o histórico recente são preservados e reorganizados visualmente, sem duplicação.

## Consequências

- nenhum dado, status, prazo, responsável ou evento é alterado;
- nenhuma migration é necessária;
- ausência de prazo não é convertida em situação regular;
- informação legada sem vínculo oficial não é omitida nem combinada com ausência real;
- o Radar permanece uma fotografia do estado atual, não uma série temporal;
- novas leituras dependentes do legado completo não entram antecipadamente;
- as três frases redundantes de salvaguarda metodológica deixam o layout, sem alterar cálculo, universo, denominador ou semântica.

## Evolução futura

As ideias dependentes da incorporação integral e reconciliação do legado estão preservadas em:

`docs/product/RADAR_GOVERNANCA_EVOLUCAO_POS_LEGADO.md`

Esse documento não autoriza implementação automática. Cada nova leitura exigirá decisão própria, definição de cálculo, universo, denominador, limitações e testes.

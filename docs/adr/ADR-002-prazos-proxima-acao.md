# ADR-002 — Prazos e próxima providência

- **Status:** aceito e atualizado pelo R4
- **Data original:** 2026-07-21
- **Atualização:** 2026-07-29
- **Escopo:** domínio, formulários, alertas, qualidade de dados, histórico e relatórios

## Contexto

Os campos físicos `limite1` e `limite2` possuem baixa cobertura porque toda a base atual foi importada do sistema legado, anterior às regras do SITE CTRH. Um valor vazio representa falta histórica de informação e nunca pode ser tratado automaticamente como atraso.

O produto novo precisa aplicar regras melhores às novas operações sem impedir consulta ou correção cadastral de registros antigos e sem induzir usuários a inventar datas. A adequação ocorrerá progressivamente quando as demandas voltarem a ser movimentadas.

## Nomenclatura preservada

As colunas físicas permanecem no banco para evitar renomeação de baixo valor, mas a interface e a documentação usam:

- `limite1`: **Prazo interno**, data prevista para análise ou providência interna;
- `limite2`: **Prazo final**, data-limite externa, legal, administrativa ou de entrega;
- `proxima_acao` e `proxima_acao_em`: **Próxima providência**, ação concreta seguinte e sua data de acompanhamento.

## Estados de prazo

Cada prazo possui exatamente uma situação:

- `definido`: exige data;
- `nao_informado`: não possui data; é preservado para lacunas legadas;
- `nao_se_aplica`: não possui data e é permitido somente para prazo final.

`Não se aplica` não exige justificativa inicial. Ausência de data nunca é classificada automaticamente como atraso.

## Cadastro corrente

Toda nova demanda exige:

- prazo interno definido por data;
- prazo final definido por data ou escolha explícita `Não se aplica`;
- para status não encerrado, descrição objetiva da próxima providência com pelo menos cinco caracteres úteis;
- data de acompanhamento;
- responsável cadastrado ou ausência explícita, conforme regra vigente do R3.

O prazo interno não pode ser posterior ao prazo final quando ambos estiverem definidos.

## Preservação e adequação do legado

Registros legados incompletos permanecem consultáveis. Uma edição cadastral não relacionada não exige prazos ou próxima providência ausentes.

O primeiro preenchimento de prazo anteriormente `Não informado` é adequação do legado e não exige justificativa. O histórico registra antes e depois.

Quando uma operação movimentar a demanda — andamento ou mudança para status não encerrado — próxima providência e data tornam-se obrigatórias, mesmo que estivessem ausentes no legado. Isso registra uma decisão operacional presente, não inventa informação histórica.

## Alteração posterior

Qualquer alteração de prazo já registrado exige justificativa escrita, incluindo:

- mudança de data;
- antecipação ou prorrogação;
- prazo final definido para `Não se aplica`;
- prazo final `Não se aplica` para data definida.

O evento histórico registra valor anterior, novo valor, justificativa, ator e data/hora. Um prazo registrado não retorna silenciosamente a `Não informado`.

## Próxima providência vencida

A data de próxima providência anterior ao dia operacional é aceita somente com justificativa obrigatória. A data não é corrigida automaticamente e a justificativa integra o comentário do evento histórico.

O dia operacional é calculado em `America/Sao_Paulo`.

## Apresentação

- cartões existentes usam exclusivamente prazo final e são rotulados `Prazo final hoje` e `Prazo final vencido`;
- filtros específicos localizam prazo interno e próxima providência vencidos ou previstos para hoje;
- a faixa de proximidade é de sete dias corridos;
- a tabela preserva sua organização e acrescenta coluna consolidada de próxima providência;
- o detalhe apresenta a próxima providência antes dos prazos;
- o componente `Atenção agora` é preservado no R4 e será obrigatoriamente reavaliado no R6.

## Consequências

- Alertas distinguem atraso real, ausência legada, prazo não aplicável e providência não exigida por encerramento.
- Frontend e RPCs reproduzem as mesmas validações.
- Edição cadastral não é proprietária da próxima providência.
- Nenhum saneamento preenche conteúdo automaticamente.
- Tela e Excel devem compartilhar a mesma semântica temporal.
- Novos indicadores no Radar dependem de cobertura operacional suficiente.

## Decisões rejeitadas

- Renomear imediatamente as colunas físicas do banco.
- Considerar todo prazo vazio como vencido.
- Usar prazo final como substituto da próxima providência.
- Preencher automaticamente datas ausentes no legado.
- Misturar prazo interno, prazo final e próxima providência em um único contador genérico.
- Criar campo persistido genérico de urgência.
- Bloquear edição cadastral de legado pela ausência de dados históricos.

## Continuidade

Consulte:

- `docs/product/DECISOES_R4_PRAZOS_PROVIDENCIAS_2026-07-29.md`;
- `docs/product/REAVALIACOES_FUTURAS_R4.md`.

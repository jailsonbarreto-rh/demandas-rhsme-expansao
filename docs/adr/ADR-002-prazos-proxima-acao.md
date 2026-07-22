# ADR-002 — Prazos e próxima ação

- **Status:** aceito
- **Data:** 2026-07-21
- **Escopo:** domínio, formulários, alertas, qualidade de dados e relatórios

## Contexto

Os campos físicos `limite1` e `limite2` possuem baixa cobertura no legado. Um valor vazio pode significar falta de informação ou ausência legítima de prazo. Tratar ambos como atraso produz alertas falsos. Além disso, o status isolado não informa qual providência deve ocorrer nem quando o acompanhamento será retomado.

## Decisão

As colunas físicas permanecem no banco para evitar renomeação de baixo valor, mas toda interface e documentação usa:

- `limite1`: **Prazo interno**, data prevista para análise ou providência interna do CTRH;
- `limite2`: **Prazo final**, data-limite externa, legal, administrativa ou de entrega.

Cada prazo possui exatamente uma situação:

- `definido`: exige data;
- `nao_informado`: não possui data e integra a fila de qualidade;
- `nao_se_aplica`: não possui data e exige justificativa com pelo menos dez caracteres úteis.

Ausência de data nunca é classificada automaticamente como atraso.

Toda demanda não encerrada criada ou movimentada após a ativação exige:

- descrição objetiva da próxima ação com pelo menos cinco caracteres úteis;
- data de acompanhamento;
- responsável interno vinculado ou indicação explícita de não atribuição.

Em `Tramitado`, a próxima ação descreve a verificação do retorno externo. Em `Sobrestado`, descreve a condição ou revisão. Ao encerrar, a RPC limpa próxima ação e data, preservando a trilha.

Registros legados incompletos permanecem consultáveis e entram na fila de saneamento. A próxima edição ou transição pertinente exige saneamento e não salva silenciosamente a ausência.

## Consequências

- Alertas distinguem atraso real, falta de cadastro e prazo não aplicável.
- Formulários validam situação, data e justificativa como uma unidade coerente.
- Prazo interno posterior ao prazo final é rejeitado quando ambos estão definidos.
- Painel e Excel exibem cobertura e limitações, sem converter vazio em zero.
- Scripts de saneamento usam dry-run, hash e decisões explícitas; nunca inventam datas ou justificativas.

## Decisões rejeitadas

- Renomear imediatamente as colunas físicas do banco.
- Considerar todo prazo vazio como vencido.
- Usar prazo final como substituto da próxima ação.
- Preencher automaticamente datas ausentes no legado.

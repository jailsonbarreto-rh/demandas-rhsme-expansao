# Reavaliações futuras decorrentes do R4

**Criado em:** 29 de julho de 2026  
**Natureza:** observações de evolução condicionada após GOV-013
**Efeito autorizativo:** nenhum item deste documento autoriza implementação automática

Esta lista preserva questões que devem voltar ao debate após o início do uso real do sistema e a formação de dados com cobertura suficiente.

## FUT-R4-01 — Representação conjunta dos diferentes marcos temporais

**Reavaliar quando:** prazo interno estiver sendo preenchido de forma consistente em volume relevante.

Analisar outras formas de representação visual de prazo interno, prazo final e próxima providência, sem produzir dupla contagem confusa, alerta genérico ou hierarquia não aprovada.

## FUT-R4-02 — Destaque dos filtros operacionais

**Reavaliar quando:** houver evidência de uso real dos filtros de prazo interno e próxima providência.

Verificar se algum filtro merece cartão, atalho, agrupamento diferente ou visão salva. Até essa revisão, os cartões superiores permanecem contidos e os novos recortes ficam no painel de filtros.

## FUT-R4-03 — Coluna e bloco de próxima providência

**Reavaliar quando:** usuários produzirem textos e datas reais em quantidade suficiente.

Revisar:

- largura e posição da coluna;
- nível de resumo do texto;
- expansão ou visualização integral;
- equivalência mobile;
- legibilidade para textos longos;
- necessidade de ajustes na hierarquia do detalhe.

## FUT-R4-04 — Possível reformulação do Atenção agora

**Reavaliar quando:** o uso real demonstrar limitação do componente atual ou necessidade de agenda preventiva adicional.

Reavaliar a substituição do componente atual por agenda priorizada que possa considerar, com regras expressamente aprovadas:

- prazo interno;
- prazo final;
- próxima providência;
- status e natureza do acompanhamento;
- carteira pessoal ou coletiva.

Não criar linguagem de produtividade individual nem prioridade inferida sem regra explícita.

## FUT-R4-05 — Indicadores de próxima providência no Radar

**Reavaliar quando:** `proxima_acao` e `proxima_acao_em` tiverem cobertura e uso operacional consistentes.

Possíveis leituras futuras:

- providências vencidas;
- providências previstas para hoje;
- agenda dos próximos sete dias;
- demandas sem providência registrada;
- distribuição por natureza, somente se existir catálogo aprovado.

Antes de qualquer indicador, auditar cobertura, proveniência, denominador e comparabilidade.

## Regra de governança

Cada reavaliação deverá seguir o protocolo vigente de decisão de produto: apresentar comportamento atual, mudança concreta, usuários afetados, cenário real, alternativas, recomendação, impactos, dependências, reversibilidade e decisão expressa.

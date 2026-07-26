# Histórico documental — Central de Demandas CTRH

**Atualizado em:** 26 de julho de 2026

Este índice separa documentos vigentes de registros históricos. Ele preserva a memória do projeto sem permitir que regras superadas sejam usadas como instrução atual.

<!-- CURRENT_PLAN_ROLE: strategy_general=docs/execution/Plano_Integrado_Reformulado_CTRH_v3.1.md -->
<!-- CURRENT_PLAN_ROLE: track_a_execution=docs/execution/Plano_Executivo_Operacao_Atual_CTRH_v1.2.md -->

Os marcadores acima são metadados do gate documental. Cada papel deve possuir exatamente um plano vigente.

## Documentos vigentes

| Papel | Documento |
|---|---|
| Regras operacionais para agentes | `AGENTS.md` |
| Governança por pacote e decisão | `docs/execution/ADENDO_GOVERNANCA_POR_ETAPA_CTRH_v2.0.4.md` |
| Protocolo de debate e homologação | `docs/product/PROTOCOLO_HOMOLOGACAO_DECISOES_PRODUTO_CTRH_v1.3.md` |
| Fonte exclusiva de decisões aprovadas | `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md` |
| Sincronização documental | `docs/product/POLITICA_SINCRONIZACAO_DOCUMENTAL_CTRH_v1.1.md` |
| Semântica atual do produto | `docs/PRODUCT_CONTEXT.md` |
| Estratégia geral | `docs/execution/Plano_Integrado_Reformulado_CTRH_v3.1.md` |
| Roteiro do Trilho A | `docs/execution/Plano_Executivo_Operacao_Atual_CTRH_v1.2.md` |
| Estado material e continuidade | `docs/HANDOFF.md` |

Os planos organizam o trabalho possível. Nenhuma recomendação ou decisão `OP-Dxx` é aprovada automaticamente; somente o Registro de Decisões possui essa autoridade.

Os dois arquivos foram copiados integralmente dos anexos homologados. Por isso, seus cabeçalhos preservam a redação temporal anterior ao E0, inclusive referências a “minuta” e à necessidade de adoção futura. A decisão posterior GOV-007 registra a adoção da cadeia e prevalece apenas para autoridade documental; não altera o conteúdo dos anexos nem aprova suas recomendações internas.

## Documentos históricos

- `docs/execution/Plano_Remanescente_Execucao_CTRH_v2.1.md`;
- `docs/execution/ADENDO_GOVERNANCA_POR_ETAPA_CTRH_v2.0.3.md`;
- `docs/product/PROTOCOLO_HOMOLOGACAO_DECISOES_PRODUTO_CTRH_v1.2.md`;
- `docs/product/POLITICA_SINCRONIZACAO_DOCUMENTAL_CTRH_v1.0.md`;
- `docs/execution/Plano_Mestre_Execucao_CTRH_v1.0.md`;
- `docs/execution/Plano_Remanescente_Execucao_CTRH_v2.0.md`;
- `docs/execution/ADENDO_SUSPENSAO_PLANO_CTRH_v2.0.1.md`;
- `docs/execution/ADENDO_GOVERNANCA_POR_ETAPA_CTRH_v2.0.2.md`;
- `docs/product/PROTOCOLO_HOMOLOGACAO_DECISOES_PRODUTO_CTRH_v1.0.md`;
- `docs/superpowers/specs/2026-07-22-central-trabalho-ctrh-design.md`;
- minutas executivas v1.0 e v1.1, quando consultadas no acervo ou no histórico Git.

Os quatro primeiros arquivos receberam nota inicial de superação no E0. Sua íntegra anterior continua recuperável no histórico Git. Os demais já estavam identificados como históricos ou permanecem acessíveis como registros de evolução.

## Evolução da autoridade

| Data | Cadeia | Estado |
|---|---|---|
| 21/07/2026 | Plano Mestre v1.0 | histórico |
| 23/07/2026 | Plano Remanescente v2.0 e Adendo de suspensão | histórico |
| 25/07/2026 | Plano Remanescente v2.1, Adendo v2.0.3, Protocolo v1.2 e Política v1.0 | histórico após o E0 |
| 26/07/2026 | Plano Integrado v3.1, Plano Executivo v1.2, Adendo v2.0.4, Protocolo v1.3 e Política v1.1 | cadeia vigente após merge e homologação do E0 |

## Recuperação da íntegra anterior

O estado imediatamente anterior à reconciliação documental pós-R3 pode ser consultado no commit:

`967a727d25fcbae848a7556da510e9387581f7b7`

O estado-base imediatamente anterior ao E0 pode ser consultado no commit:

`ee61dab5917f84b034305ba2119e4bbad673f176`

## Regra de uso

Documentos históricos podem explicar por que uma decisão existiu e como o projeto evoluiu. Não podem:

- determinar a próxima etapa;
- restaurar regra superada;
- substituir o Registro de Decisões;
- contradizer o Product Context vigente;
- autorizar implementação.

Quando houver dúvida, prevalece a decisão expressa mais recente registrada e a ordem de leitura de `AGENTS.md`.

# Histórico documental — Central de Demandas CTRH

**Atualizado em:** 3 de agosto de 2026

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
| Preservação informacional | `docs/product/PRINCIPIO_PRESERVACAO_INFORMACIONAL_CTRH_v1.0.md` |
| Sincronização documental | `docs/product/POLITICA_SINCRONIZACAO_DOCUMENTAL_CTRH_v1.1.md` |
| Manutenção e modernização tecnológica | `docs/product/POLITICA_MANUTENCAO_DEPENDENCIAS_CTRH_v1.1.md` |
| Semântica atual do produto | `docs/PRODUCT_CONTEXT.md` |
| Estratégia geral | `docs/execution/Plano_Integrado_Reformulado_CTRH_v3.1.md` |
| Roteiro do Trilho A | `docs/execution/Plano_Executivo_Operacao_Atual_CTRH_v1.2.md` |
| Plano técnico complementar de manutenção | `docs/execution/PLANO_CONSOLIDADO_MANUTENCAO_MODERNIZACAO_CTRH_v1.1.md` |
| Registro de oportunidades técnicas | `docs/product/REGISTRO_OPORTUNIDADES_TECNICAS_MODERNIZACAO_CTRH_v1.1.md` |
| Arquitetura TanStack Query | `docs/architecture/ARQUITETURA_TANSTACK_QUERY_CTRH_v1.0.md` |
| Controle de mudança por completude operacional | `docs/execution/ATUALIZACAO_COMPLETUDE_OPERACIONAL_2026-08-01.md` |
| Estado material e continuidade | `docs/HANDOFF.md` |

Os planos organizam trabalho possível. Nenhuma recomendação, oportunidade técnica ou decisão `OP-Dxx` é aprovada automaticamente; somente o Registro de Decisões possui autoridade para decisões de produto, e toda instalação ou atualização depende de autorização expressa conforme a governança aplicável.

O Plano Integrado v3.1 e o Plano Executivo v1.2 foram copiados integralmente dos anexos homologados. Por isso, seus cabeçalhos preservam redação temporal anterior ao E0, inclusive referências a “minuta” e à necessidade de adoção futura. A decisão posterior GOV-007 registra a adoção da cadeia e prevalece apenas para autoridade documental; não altera o conteúdo dos anexos nem aprova suas recomendações internas.

O plano técnico de manutenção v1.1 é complementar. Ele registra o estado real das Rodadas 1, 2 e 3 e a próxima experiência candidata, sem substituir a estratégia geral ou o roteiro do Trilho A.

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
- minutas executivas v1.0 e v1.1, quando consultadas no acervo ou no histórico Git;
- os documentos propostos no PR #115, que não foram integrados e foram substituídos pelas versões v1.1 atuais.

Os quatro primeiros arquivos receberam nota inicial de superação no E0. Sua íntegra anterior continua recuperável no histórico Git. Os demais já estavam identificados como históricos ou permanecem acessíveis como registros de evolução.

O PR #115 permaneceu aberto sobre base anterior enquanto as Rodadas 1, 2 e 3 foram concluídas. Seu plano e sua política propostos não descrevem mais o estado material e não podem orientar a próxima etapa. O histórico do PR deve ser preservado, mas suas versões foram substituídas por:

- `docs/execution/PLANO_CONSOLIDADO_MANUTENCAO_MODERNIZACAO_CTRH_v1.1.md`;
- `docs/product/POLITICA_MANUTENCAO_DEPENDENCIAS_CTRH_v1.1.md`;
- `docs/product/REGISTRO_OPORTUNIDADES_TECNICAS_MODERNIZACAO_CTRH_v1.1.md`.

## Evolução da autoridade

| Data | Cadeia | Estado |
|---|---|---|
| 21/07/2026 | Plano Mestre v1.0 | histórico |
| 23/07/2026 | Plano Remanescente v2.0 e Adendo de suspensão | histórico |
| 25/07/2026 | Plano Remanescente v2.1, Adendo v2.0.3, Protocolo v1.2 e Política v1.0 | histórico após o E0 |
| 26/07/2026 | Plano Integrado v3.1, Plano Executivo v1.2, Adendo v2.0.4, Protocolo v1.3 e Política v1.1 | cadeia vigente após merge e homologação do E0 |
| 01/08/2026 | GOV-013 e atualização de completude operacional | planos preservados como inventário; roteiro remanescente reclassificado por valor e evidência |
| 02/08/2026 | Rodadas técnicas 1, 2 e 3 | atualizações, Error Boundaries, Knip e TanStack Query integrados e publicados |
| 03/08/2026 | Consolidação pós-TanStack Query | manutenção v1.1, modernização proativa e arquitetura de cache sincronizadas |

## Recuperação da íntegra anterior

O estado imediatamente anterior à consolidação pós-TanStack Query pode ser consultado no commit:

`15aa5c049c3c7122db365eec6a2e9f629e3c38ea`

O estado imediatamente anterior à reconciliação documental pós-R3 funcional pode ser consultado no commit:

`967a727d25fcbae848a7556da510e9387581f7b7`

O estado-base imediatamente anterior ao E0 pode ser consultado no commit:

`ee61dab5917f84b034305ba2119e4bbad673f176`

## Regra de uso

Documentos históricos podem explicar por que uma decisão existiu e como o projeto evoluiu. Não podem:

- determinar a próxima etapa;
- restaurar regra superada;
- substituir o Registro de Decisões;
- contradizer o Product Context vigente;
- autorizar implementação;
- apresentar capacidade concluída como oportunidade ainda ausente;
- impedir avaliação de modernização tecnicamente superior por apego a solução antiga.

Quando houver dúvida, prevalece a decisão expressa mais recente registrada e a ordem de leitura de `AGENTS.md`.

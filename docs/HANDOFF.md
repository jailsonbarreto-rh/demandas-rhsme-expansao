# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **24 de julho de 2026 — responsáveis oficiais do R3 em Production**

## Estado atual

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| Production | `https://demandas-rhsme-expansao.vercel.app/` |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr` |
| Código funcional publicado | `886fc279fd0519c3beaa5e977e125a9dd3b3e420` — PR #46 |
| Plano de referência | `docs/execution/Plano_Remanescente_Execucao_CTRH_v2.0.md` |
| Regra de autoridade vigente | `docs/execution/ADENDO_GOVERNANCA_POR_ETAPA_CTRH_v2.0.2.md` |
| Registro de decisões | `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md` |
| Linha de base funcional | Ciclos originais 0 a 4 concluídos; núcleo de responsáveis oficiais do R3 implementado |
| Atividade atual | **Homologação pelo responsável do produto da implementação R3** |
| Próximo ciclo | Não autorizado até a homologação e nova decisão expressa |

## Implementação R3 concluída

- `responsavel_id` passou a ser a identidade oficial do responsável.
- O nome textual é derivado do perfil pelo servidor e permanece como fotografia legível.
- Novas demandas e edições usam seleção de usuários cadastrados; texto livre não é aceito.
- Todos os usuários cadastrados podem aparecer na seleção, independentemente de papel ou status.
- A possibilidade existente de deixar a demanda sem responsável foi preservada.
- As permissões, os papéis, os status, as políticas RLS e as demais regras de negócio não foram alterados.
- A criação textual legada foi bloqueada.
- RPCs e gatilho de banco impedem divergência entre UUID e nome.

## Migração histórica aplicada

| Resultado | Quantidade |
|---|---:|
| Demandas existentes | 379 |
| Demandas vinculadas a perfil oficial | 378 |
| Registros de reatribuição criados pela migração | 378 |
| Divergências entre UUID e nome | 0 |
| Textos não vinculados além de Vanessa | 0 |
| `Vanessa Migrado` preservada com UUID nulo | 1 |

Foram associados aos perfis oficiais: Erica, Giselle, Sabrina, Thiago, Jaqueline, Jailson, Jessica, Beth/Elisabeth e Helena, inclusive as ocorrências com sufixo `Migrado`. `Jaqueline IHA` foi associada a Jaqueline Lima Ximenes Melo.

## Fotografia reconciliada de Production

| Indicador | Resultado |
|---|---:|
| Demandas | 379 |
| Demandas logicamente excluídas | 0 |
| Históricos | 764 |
| Perfis | 13 |
| Demandas com `responsavel_id` | 378 |
| Demandas com texto não vazio e UUID nulo | 1 |
| Eventos R3 de reatribuição | 378 |
| Divergências UUID–nome | 0 |

## Validação realizada

- TDD com falha inicial comprovada antes da implementação;
- lint, testes unitários e de integração, cobertura e build aprovados;
- orçamento de bundle e smoke tests de navegador aprovados;
- cadeia completa de migrations reconstruída do zero em Supabase efêmero;
- dry-run em Production confirmou 378 alvos, zero perfis ausentes e Vanessa como única exceção;
- smoke test transacional em Production confirmou criação, reatribuição, rejeição de texto livre, rejeição de UUID inválido e preservação de Vanessa;
- a transação de smoke test foi revertida e não deixou registros de teste.

## Publicação e segurança operacional

- PR funcional: `#46 — R3: vincular responsáveis a usuários oficiais`.
- Deployment de Production: `dpl_2v8uYL7nfxKWZb2ez4TgRjyJ6d4n`, estado `READY`.
- O deploy automático foi habilitado apenas para a publicação controlada e restaurado para bloqueado no encerramento operacional.

## Regra de continuidade

A próxima ação é a homologação da experiência em Production pelo responsável do produto. Nenhum novo ciclo ou ampliação funcional está autorizado automaticamente.

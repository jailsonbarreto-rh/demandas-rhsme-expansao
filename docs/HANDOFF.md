# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **2026-07-23 — Ciclo R0 concluído: rebaseline e Plano Remanescente v2.0**

## Estado atual

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| Plano cronológico vigente | `docs/execution/Plano_Remanescente_Execucao_CTRH_v2.0.md` |
| Plano histórico | `docs/execution/Plano_Mestre_Execucao_CTRH_v1.0.md` — preservar; não usar como checklist cronológico |
| Production | `https://demandas-rhsme-expansao.vercel.app/` |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr` |
| Linha de base do código | Ciclos originais 0 a 4 concluídos; correção posterior da marca institucional publicada |
| Ciclo remanescente concluído | R0 — rebaseline documental |
| Próximo ciclo autorizado | **R1 — Integridade, domínio de dados e concorrência otimista** |

## Regra de autoridade

O Plano Remanescente v2.0 substitui o Plano Mestre v1.0 como roteiro cronológico para todas as ferramentas e agentes. O Plano Mestre v1.0 continua sendo fonte histórica das decisões funcionais, mas:

- não se reexecutam os Ciclos 0 a 4;
- não se inicia o antigo Ciclo 5;
- não se usa a numeração original dos Ciclos 5 a 13 para decidir a próxima etapa;
- a execução segue exclusivamente `R1 → R2 → ... → R12`, um ciclo por branch e PR;
- qualquer mudança de sequência exige decisão expressa do responsável pelo produto e atualização do plano.

## Fotografia reconciliada de produção

Consulta somente de leitura realizada no rebaseline:

| Indicador | Resultado |
|---|---:|
| Demandas | 379 |
| Demandas visíveis | 379 |
| Demandas logicamente excluídas | 0 |
| Históricos | 385 |
| Perfis | 5 |
| Demandas de origem `sistema` | 0 |
| Demandas com `responsavel_id` | 0 |
| Demandas com responsável textual | 379 |
| Demandas não encerradas | 377 |
| Não encerradas sem próxima ação | 377 |
| Não encerradas sem data de acompanhamento | 377 |
| Prazo interno `nao_informado` | 369 |
| Prazo final `nao_informado` | 354 |
| Prazo marcado `nao_se_aplica` | 0 |
| Eventos de criação | 379 |
| Eventos de mudança de status | 6 |
| Eventos de andamento/edição/reatribuição/exclusão/restauração | 0 |
| Tabelas de preferências ou visões | 0 |
| Grupos duplicados após normalização | 0 |

## O que já está concluído e não deve ser refeito

### Ciclos originais 0 a 4

- contexto de produto, plano original, ADRs e instruções de execução;
- retirada de dados reais do bundle público e bloqueio do modo local em Production;
- semântica única de carteira e filtros tipados por URL;
- expansão aditiva do modelo de dados;
- tipos, mappers, índices e leitura compatível;
- RPCs auditáveis de criação, edição, andamento, transição, exclusão lógica e restauração;
- autoria por `auth.uid()` e eventos de histórico;
- revogação de `UPDATE` e `DELETE` diretos;
- índice único normalizado do número da demanda;
- Realtime e compatibilidade temporária com APIs legadas.

### Entregas posteriores

- correção e publicação da logomarca institucional na tela de login;
- restauração do bloqueio automático de deployments após a publicação.

## Estruturas prontas, mas ainda sem experiência completa

O banco e os contratos já suportam partes dos antigos Ciclos 5, 6 e 7, porém isso não significa que as funcionalidades estejam entregues ao usuário. Permanecem pendentes, entre outros:

- responsável interno por UUID e “Minhas demandas”;
- aplicabilidade de prazos e painel de qualidade;
- saneamento assistido do legado;
- `ModalAndamento` e prontuário completo;
- lixeira e restauração pela interface;
- motor completo de alertas e página Meu Trabalho;
- sete relatórios parametrizados;
- painel gerencial compartilhado com o Excel;
- preferências e visões salvas;
- recuperação de senha;
- observabilidade, cabeçalhos de segurança e release reproduzível;
- contrato final e homologação dos três papéis.

## Ciclo R0 — entrega documental

Foram consolidados:

- `docs/execution/Plano_Remanescente_Execucao_CTRH_v2.0.md` — fonte canônica para agentes;
- `AGENTS.md` — ordem obrigatória de leitura e disciplina atualizadas;
- este `docs/HANDOFF.md` — estado material e próximo ciclo autorizado.

O Plano v2.0 contém:

- reconciliação do plano original com GitHub, Supabase e Production;
- classificação de cada ciclo original como concluído, preparado, parcial ou não implementado;
- Ciclos R0 a R12 somente para o trabalho remanescente;
- cobertura dos 32 requisitos originais;
- cobertura dos novos achados pós-Supabase;
- matriz de testes, definição de pronto, condições de parada e formato de relato.

## Próximo ciclo autorizado

### R1 — Integridade, domínio de dados e concorrência otimista

Objetivo: concluir a robustez estrutural do banco antes de ampliar a experiência e o volume de uso.

Escopo vinculante resumido:

1. verificar e validar as constraints atualmente `NOT VALID` quando não houver violações;
2. preservar e testar o índice normalizado existente;
3. alinhar limites máximos entre banco e Zod;
4. validar `link_origem` e domínio de classificação;
5. criar os índices de FK efetivamente necessários;
6. implementar concorrência otimista usando `updated_at` esperado;
7. atualizar os tipos Supabase e reproduzir a cadeia de migrations;
8. preservar contagens, relacionamentos, APIs existentes e frontend compatível;
9. não revogar RPCs legadas neste ciclo.

## Condições imediatas de parada

Parar antes de qualquer aplicação em produção se:

- houver violação nas constraints candidatas à validação;
- surgir classificação não reconhecida sem decisão de produto;
- replay das migrations divergir do banco remoto;
- contagens, órfãos ou duplicidades mudarem;
- o controle de concorrência exigir sobrescrever silenciosamente alterações de outra pessoa;
- não houver backup legível antes de migration material.

## Rollback da fase atual

Como o Ciclo R0 é documental, o rollback consiste em reverter o PR documental. Isso não altera banco, dados, frontend ou Production. O Plano Mestre v1.0 deve permanecer no repositório mesmo após a consolidação do v2.0.

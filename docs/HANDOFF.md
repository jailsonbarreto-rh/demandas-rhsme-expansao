# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **2026-07-23 — execução suspensa para homologação integral das decisões de produto**

## Estado atual

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| Adendo de autoridade | `docs/execution/ADENDO_SUSPENSAO_PLANO_CTRH_v2.0.1.md` — prevalece sobre a autorização anterior |
| Plano inventário | `docs/execution/Plano_Remanescente_Execucao_CTRH_v2.0.md` — não executar |
| Versão Word editorial | `docs/execution/Plano_Remanescente_Execucao_CTRH_v2.0.docx` |
| Plano histórico | `docs/execution/Plano_Mestre_Execucao_CTRH_v1.0.md` — preservar; não usar como checklist cronológico |
| Production | `https://demandas-rhsme-expansao.vercel.app/` |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr` |
| Linha de base do código | Ciclos originais 0 a 4 concluídos; correção posterior da marca institucional publicada |
| Ciclo remanescente concluído | R0 — rebaseline documental |
| Implementação | **SUSPENSA** |
| Próxima atividade autorizada | **D0 — Auditoria e homologação das decisões de produto** |
| Próximo ciclo de implementação | Nenhum, até nova aprovação formal |

## Regra de autoridade

O Plano Remanescente v2.0.1 permanece como inventário organizado do trabalho remanescente, mas **não constitui autorização para implementação**. A análise do Ciclo R3 revelou múltiplas decisões de produto apresentadas como escopo obrigatório sem homologação explícita. Por determinação do responsável pelo produto, toda execução está suspensa até revisão equivalente de todos os ciclos. O Plano Mestre v1.0 continua sendo fonte histórica das decisões funcionais, mas:

- não se reexecutam os Ciclos 0 a 4;
- não se inicia o antigo Ciclo 5;
- não se usa a numeração original dos Ciclos 5 a 13 para decidir a próxima etapa;
- nenhuma etapa de `R1 → R12` pode ser implementada durante a suspensão;
- a única atividade autorizada é D0, exclusivamente documental e analítica;
- a retomada exige decisões homologadas, nova versão do plano, atualização deste handoff e autorização expressa do primeiro ciclo.

## Motivo e alcance da suspensão

O Ciclo R3 contém decisões sobre papéis, visibilidade, atribuição, obrigatoriedade de responsável, comportamento da página pessoal, permissões de leitores e editores, justificativas e tratamento do legado. Essas escolhas alteram o produto e não podem ser convertidas em código apenas por constarem do plano. Há decisões semelhantes em outros ciclos, especialmente R4, R5, R6, R7, R8, R9, R10 e R12.

Até a conclusão de D0:

- não executar migrations;
- não modificar fluxos, telas, permissões ou regras de negócio;
- não iniciar R1 sob a justificativa de ser predominantemente técnico;
- não publicar alterações funcionais;
- não considerar o PR #43 uma aprovação das decisões de produto; ele organizou o plano, mas sua autorização de execução foi posteriormente revogada.

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
- `docs/execution/Plano_Remanescente_Execucao_CTRH_v2.0.docx` — versão editorial para leitura, arquivo e governança;
- `AGENTS.md` — ordem obrigatória de leitura e disciplina atualizadas;
- este `docs/HANDOFF.md` — estado material e próximo ciclo autorizado.

O Plano v2.0 contém:

- reconciliação do plano original com GitHub, Supabase e Production;
- classificação de cada ciclo original como concluído, preparado, parcial ou não implementado;
- Ciclos R0 a R12 somente para o trabalho remanescente;
- cobertura dos 32 requisitos originais;
- cobertura dos novos achados pós-Supabase;
- matriz de testes, definição de pronto, condições de parada e formato de relato.

## Próxima atividade autorizada

### D0 — Auditoria e homologação das decisões de produto

Objetivo: revisar integralmente os Ciclos R1 a R12, identificar todas as decisões que alteram comportamento, regras, permissões, telas, prioridades, métricas ou tratamento de dados e submetê-las ao responsável pelo produto antes de qualquer implementação.

Durante D0, a ferramenta deverá:

1. decompor cada ciclo em decisões independentes;
2. explicar cada decisão em linguagem não técnica e por cenário real;
3. separar necessidade técnica de escolha de produto;
4. apresentar alternativas, incluindo manter o comportamento atual;
5. registrar recomendação sem presumir aprovação;
6. mapear dependências entre decisões de ciclos diferentes;
7. registrar aprovação, rejeição, alteração ou adiamento;
8. produzir uma nova versão do plano somente após homologação integral.

Não estão autorizados código, migrations, banco, Vercel, Production ou qualquer implementação de R1 a R12.

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

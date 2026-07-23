# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **23 de julho de 2026 — governança ciclo a ciclo estabelecida**

## Estado atual

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| Plano de referência | `docs/execution/Plano_Remanescente_Execucao_CTRH_v2.0.md` |
| Regra de autoridade vigente | `docs/execution/ADENDO_GOVERNANCA_POR_ETAPA_CTRH_v2.0.2.md` |
| Protocolo de decisão | `docs/product/PROTOCOLO_HOMOLOGACAO_DECISOES_PRODUTO_CTRH_v1.0.md` |
| Registro de decisões | `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md` |
| Adendo de suspensão integral | Superado; preservado apenas como histórico |
| Plano Mestre v1.0 | Histórico; não usar como checklist cronológico |
| Production | `https://demandas-rhsme-expansao.vercel.app/` |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr` |
| Linha de base do código | Ciclos originais 0 a 4 concluídos |
| Próxima atividade autorizada | **Análise e debate pré-implementação do Ciclo R1** |
| Implementação do R1 | **Não autorizada ainda** |

## Regra de governança

O Plano Remanescente v2.0 permanece salvo como referência do trabalho possível, mas seus itens não são decisões automaticamente aprovadas.

Cada ciclo deverá seguir esta sequência:

```text
analisar o estado atual
→ desmontar o ciclo em decisões independentes
→ explicar em linguagem leiga e de produto
→ apresentar alternativas, impactos e recomendação
→ receber decisões: aprovar, rejeitar, alterar ou adiar
→ consolidar o escopo aprovado
→ receber autorização expressa de implementação
→ implementar e testar
→ homologar o resultado
→ iniciar o debate do ciclo seguinte
```

Não é necessário decidir antecipadamente todos os ciclos. A revisão acontece ciclo por ciclo.

## Conteúdo obrigatório do debate

Para cada decisão independente, a ferramenta deverá apresentar:

1. como o sistema funciona hoje;
2. o que mudaria concretamente na tela e na rotina;
3. quais usuários seriam afetados;
4. um cenário real de uso;
5. alternativas possíveis, inclusive manter o comportamento atual;
6. recomendação identificada apenas como recomendação;
7. impactos positivos e negativos;
8. dependências com decisões de outros ciclos;
9. dificuldade e custo de reverter depois;
10. decisão expressa do responsável: aprovar, rejeitar, alterar ou adiar.

Cada item deverá ser classificado como:

- necessidade técnica;
- preservação do que já existe;
- decisão anteriormente confirmada;
- nova decisão proposta;
- melhoria opcional;
- questão ainda aberta.

## Limite da autorização

A aprovação do objetivo geral de um ciclo não aprova automaticamente todos os seus itens.

A implementação somente poderá começar depois que:

- as decisões tiverem sido debatidas;
- as retificações tiverem sido incorporadas;
- o escopo final tiver sido apresentado;
- o responsável pelo produto tiver autorizado expressamente a implementação;
- as decisões tiverem sido registradas no repositório.

Se surgir uma nova decisão durante a implementação, o item afetado deverá parar e retornar ao debate. O restante só poderá continuar se for independente e seguro.

## Fotografia reconciliada de produção

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
| Eventos de andamento/edição/reatribuição/exclusão/restauração | 0 |
| Tabelas de preferências ou visões | 0 |
| Grupos duplicados após normalização | 0 |

## O que já está concluído e não deve ser refeito

- contexto de produto, plano original e ADRs;
- retirada de dados reais do bundle público;
- bloqueio do modo local em Production;
- semântica central e filtros tipados por URL;
- expansão aditiva do modelo de dados;
- tipos, mappers, índices e leitura compatível;
- RPCs auditáveis de criação, edição, andamento, transição, exclusão lógica e restauração;
- autoria por `auth.uid()` e histórico;
- revogação de `UPDATE` e `DELETE` diretos;
- índice único normalizado do número;
- Realtime e compatibilidade temporária com APIs legadas;
- correção da logomarca institucional.

## Próxima atividade autorizada

### Debate pré-implementação do Ciclo R1

A ferramenta pode:

- examinar o estado atual do código e do banco;
- separar necessidades técnicas de decisões de produto;
- explicar cada item em linguagem leiga;
- demonstrar efeitos em telas, fluxos, permissões, dados e rotina;
- apresentar alternativas, impactos e recomendações;
- preparar a matriz para decisão.

A ferramenta não pode ainda:

- alterar código funcional;
- criar ou aplicar migrations;
- modificar Supabase;
- modificar Vercel;
- publicar em Production;
- presumir a aprovação de qualquer item do R1.

A implementação do R1 somente será autorizada depois do debate, das retificações, do registro das decisões e da autorização expressa do escopo consolidado.

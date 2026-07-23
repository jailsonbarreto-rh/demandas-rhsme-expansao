# PROTOCOLO DE HOMOLOGAÇÃO DAS DECISÕES DE PRODUTO — CTRH

**Versão:** 1.0  
**Status:** VIGENTE — FASE D0  
**Finalidade:** impedir que escolhas de produto sejam implementadas como se fossem requisitos técnicos já aprovados.

## 1. Regra central

Nenhum item dos Ciclos R1 a R12 pode ser implementado enquanto a decisão de produto correspondente não estiver explicada em linguagem operacional e aprovada expressamente pelo responsável pelo produto.

## 2. Unidade de análise

Cada ciclo será decomposto em decisões independentes. Não basta aprovar o título ou o objetivo geral do ciclo. A aprovação deverá alcançar os comportamentos concretos que mudam:

- o que aparece na tela;
- quem pode ver;
- quem pode fazer;
- o que passa a ser obrigatório;
- quais informações são armazenadas;
- como alertas, prioridades e métricas são calculados;
- como dados antigos são tratados;
- quais padrões são assumidos automaticamente.

## 3. Classificação obrigatória

Cada item receberá uma das seguintes classificações:

| Classe | Significado | Exige aprovação de produto? |
|---|---|---:|
| TÉCNICA | Integridade, segurança, performance ou manutenção sem alterar regra de negócio observável. | Não, salvo impacto operacional relevante. |
| PRESERVAÇÃO | Mantém comportamento já existente e aprovado. | Não, mas exige evidência da fonte. |
| DECISÃO CONFIRMADA | Escolha já aprovada em documento ou conversa identificável. | Não novamente, salvo mudança de contexto. |
| DECISÃO PROPOSTA | Escolha nova apresentada pelo plano. | Sim. |
| OPÇÃO | Melhoria dispensável ou alternativa de desenho. | Sim, inclusive para excluir. |
| QUESTÃO ABERTA | Falta informação para definir comportamento. | Sim. |

## 4. Ficha de cada decisão

Para cada decisão proposta, apresentar:

1. **Pergunta de decisão** — uma escolha clara, sem jargão técnico.
2. **Situação atual** — como o sistema funciona hoje.
3. **Mudança prática** — o que o usuário verá ou fará de forma diferente.
4. **Perfis afetados** — administrador, editor, leitor ou público específico.
5. **Cenário real** — exemplo de rotina do CTRH.
6. **Alternativas** — incluindo manter o comportamento atual quando viável.
7. **Recomendação** — fundamentada, mas não presumida como aprovada.
8. **Impactos** — operação, dados, segurança, usabilidade, relatórios e manutenção.
9. **Dependências** — decisões de outros ciclos que mudam conforme a escolha.
10. **Reversibilidade** — facilidade e custo de mudar depois.
11. **Decisão do responsável** — aprovada, rejeitada, alterada ou adiada.
12. **Redação final para o plano** — regra objetiva que o executor deverá seguir.

## 5. Ordem de revisão

A revisão ocorrerá ciclo por ciclo, mas deverá identificar dependências cruzadas antes da aprovação final:

1. R1 e R2 — distinguir infraestrutura técnica de impactos observáveis;
2. R3 — responsabilidade, carteira pessoal e visibilidade;
3. R4 — prazos, obrigatoriedades e saneamento;
4. R5 — andamento, histórico, lixeira e ações;
5. R6 — página inicial, prioridades e alertas;
6. R7 — relatórios, finalidades e permissões;
7. R8 — métricas, interpretações e limites analíticos;
8. R9 — preferências, padrões por papel e persistência;
9. R10 — acesso, recuperação e comunicação;
10. R11 — experiência de erro, monitoramento e release;
11. R12 — matriz final de permissões e critérios de entrada em produção.

## 6. Gate de saída da Fase D0

A Fase D0 somente termina quando:

- todos os ciclos tiverem inventário completo de decisões;
- nenhuma decisão proposta permanecer apresentada como requisito aprovado;
- decisões adiadas estiverem explicitamente excluídas da primeira versão;
- dependências e contradições estiverem resolvidas;
- o plano for reescrito com linguagem inequívoca;
- o responsável pelo produto aprovar a versão revisada;
- `AGENTS.md` e `docs/HANDOFF.md` autorizarem nominalmente o primeiro ciclo.

## 7. Proibição de execução silenciosa

A ferramenta não pode preencher lacunas escolhendo a alternativa que considere tecnicamente melhor. Quando uma lacuna afetar o produto, deverá parar e apresentar a decisão ao responsável.

# ADENDO DE GOVERNANÇA POR ETAPA — PLANO REMANESCENTE CTRH

**Versão:** 2.0.2  
**Data:** 23 de julho de 2026  
**Status:** VIGENTE — DEBATE E APROVAÇÃO OBRIGATÓRIOS ANTES DE CADA CICLO

## 1. Decisão de autoridade

Este adendo substitui, para fins de autorização e sequência, o `ADENDO_SUSPENSAO_PLANO_CTRH_v2.0.1.md`.

O Plano Remanescente v2.0 permanece salvo como referência organizada do trabalho possível. Ele não constitui autorização automática para implementar seus ciclos, escopos, exemplos, recomendações ou critérios.

Também não será exigida a homologação integral de todos os ciclos antes de qualquer avanço. A governança ocorrerá **ciclo por ciclo**.

## 2. Regra central

Cada ciclo possui duas fases independentes e obrigatórias:

1. **Debate pré-implementação:** o ciclo é desmontado em decisões independentes e explicado ao responsável pelo produto em termos leigos e em termos de lógica de produto, funcionalidades, telas, fluxos, permissões, dados e experiência do usuário.
2. **Implementação autorizada:** somente as decisões expressamente aprovadas — ou retificadas e posteriormente aprovadas — podem ser transformadas em código, migrations, banco, Preview ou publicação.

A aprovação do título ou do objetivo geral do ciclo não aprova automaticamente seus itens internos.

## 3. Explicação obrigatória de cada decisão

Para cada decisão independente, a ferramenta deverá apresentar:

1. como o sistema funciona hoje;
2. o que mudaria concretamente na tela e na rotina;
3. quais usuários seriam afetados;
4. um cenário real de uso;
5. alternativas possíveis, inclusive manter o comportamento atual;
6. recomendação da ferramenta, identificada apenas como recomendação;
7. impactos positivos e negativos;
8. dependências com decisões de outros ciclos;
9. dificuldade e custo de reverter depois;
10. decisão expressa do responsável: aprovar, rejeitar, alterar ou adiar.

Quando necessário, deverão ser utilizados esquemas, fluxos ou protótipos explicativos antes da decisão.

## 4. Classificação dos itens

Cada item deverá ser identificado como:

- **necessidade técnica**;
- **preservação do que já existe**;
- **decisão anteriormente confirmada**;
- **nova decisão proposta**;
- **melhoria opcional**;
- **questão ainda aberta**.

Essa classificação impede que uma recomendação nova seja apresentada como requisito técnico inevitável ou como decisão já aprovada.

## 5. Autorização válida

A implementação de um ciclo somente poderá começar depois de:

1. concluir o debate dos itens que integrarão aquele ciclo;
2. registrar as decisões aprovadas, alteradas, adiadas e rejeitadas;
3. consolidar a redação final das regras aprovadas;
4. apresentar o escopo exato que será implementado;
5. receber autorização expressa do responsável pelo produto para implementar essa consolidação;
6. registrar a decisão em `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md`.

Silêncio, ausência de objeção, recomendação técnica, documento anterior ou autorização para continuar analisando não equivalem a autorização de implementação.

## 6. Limite da autorização

A aprovação vale somente para os comportamentos discutidos e registrados.

Durante a implementação, a ferramenta não poderá:

- completar lacunas por conta própria;
- escolher silenciosamente uma alternativa de produto;
- ampliar o escopo porque a ampliação parece conveniente;
- antecipar decisões de outro ciclo;
- modificar permissões, obrigatoriedades, padrões, cálculos, telas ou tratamento de dados não debatidos.

Se surgir uma nova decisão ou consequência não apresentada, o item afetado deverá parar e retornar ao responsável pelo produto. O restante do escopo poderá continuar apenas quando for independente e seguro.

## 7. Sequência operacional

```text
Debate R1 → decisões e retificações → aprovação expressa → implementação R1 → homologação R1
Debate R2 → decisões e retificações → aprovação expressa → implementação R2 → homologação R2
...
Debate R12 → decisões e retificações → aprovação expressa → implementação R12 → homologação final
```

Não é necessário decidir antecipadamente todos os detalhes dos ciclos futuros. Dependências conhecidas deverão ser explicadas no ciclo atual, mas as escolhas futuras permanecem abertas até seu próprio debate.

## 8. Próxima atividade autorizada

Está autorizada apenas a **análise e o debate pré-implementação do Ciclo R1**.

Essa autorização permite leitura do código e do banco, explicações, alternativas, recomendações, esquemas e documentação de decisão. Não autoriza alterações funcionais, migrations, Supabase, Vercel ou Production.

A implementação do R1 dependerá de autorização expressa posterior sobre o escopo consolidado.

## 9. Precedência

Em matéria de autorização, prevalece a seguinte ordem:

1. este Adendo de Governança v2.0.2;
2. decisões expressas registradas para o ciclo específico;
3. Protocolo de Debate e Aprovação v1.1;
4. `AGENTS.md` e `docs/HANDOFF.md` atualizados;
5. Plano Remanescente v2.0 como referência;
6. Plano Mestre v1.0 como histórico.

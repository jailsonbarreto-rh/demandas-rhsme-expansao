# ADENDO DE GOVERNANÇA POR ETAPA — CENTRAL DE DEMANDAS CTRH

**Versão:** 2.0.4  
**Data:** 26 de julho de 2026  
**Status:** VIGENTE — DEBATE, APROVAÇÃO E SINCRONIZAÇÃO DOCUMENTAL OBRIGATÓRIOS

## 1. Autoridade

Este adendo substitui o `ADENDO_GOVERNANCA_POR_ETAPA_CTRH_v2.0.3.md` para fins de autorização e sequência.

O `Plano_Integrado_Reformulado_CTRH_v3.1.md` organiza a estratégia geral em dois trilhos coordenados. O `Plano_Executivo_Operacao_Atual_CTRH_v1.2.md` organiza o roteiro executável possível do Trilho A. Nenhum deles autoriza automaticamente a implementação de pacotes, ciclos, itens ou decisões `OP-Dxx`. A governança ocorre pacote por pacote e decisão por decisão, e o Registro de Decisões é a fonte exclusiva das decisões expressamente aprovadas.

## 2. Fases obrigatórias

Cada pacote ou ciclo possui três fases independentes:

1. **Debate pré-implementação:** decompor o pacote em decisões concretas e explicar telas, fluxos, permissões, dados e efeitos na rotina.
2. **Implementação autorizada:** transformar em código ou banco somente decisões expressamente aprovadas e registradas.
3. **Sincronização e homologação:** homologar apenas depois que código, banco e documentos vigentes descrevem a mesma regra.

A aprovação do título ou objetivo geral não aprova automaticamente os itens internos.

## 3. Conteúdo da análise

Para cada decisão, apresentar:

1. situação atual;
2. mudança prática;
3. usuários afetados;
4. cenário real;
5. alternativas, inclusive manter o comportamento atual;
6. recomendação identificada como recomendação;
7. impactos positivos e negativos;
8. dependências;
9. reversibilidade;
10. decisão expressa do responsável;
11. documentos vigentes e históricos afetados.

## 4. Classificação

Cada item deve ser classificado como:

- necessidade técnica;
- preservação do existente;
- decisão anteriormente confirmada;
- nova decisão proposta;
- melhoria opcional;
- questão aberta;
- reconciliação documental.

Reconciliação documental não reabre automaticamente o mérito de decisão já aprovada. Ela corrige a divergência entre a regra vigente e os textos que ainda descrevem estado anterior.

## 5. Formação da autorização

Antes da implementação:

1. concluir o debate dos itens incluídos;
2. registrar decisões aprovadas, alteradas, adiadas e rejeitadas;
3. consolidar a redação final;
4. apresentar o escopo exato;
5. identificar documentos afetados;
6. receber autorização expressa;
7. atualizar o Registro de Decisões.

Silêncio, recomendação, documento anterior ou autorização para continuar analisando não equivalem a autorização de implementação.

## 6. Sincronização documental

Toda mudança de lógica, regra de negócio, permissão, obrigatoriedade, dado, cálculo, rota ou comportamento visível deve atualizar no mesmo PR os documentos vigentes afetados.

O executor deve:

1. pesquisar no repositório os termos da regra antiga;
2. atualizar Registro de Decisões, Product Context, plano vigente, AGENTS, ADRs, documentação técnica e Handoff conforme o impacto;
3. preservar documentos históricos, acrescentando nota de superação quando puderem induzir regressão;
4. repetir a pesquisa antes do PR;
5. preencher o checklist documental do template de pull request.

A entrega não pode ser homologada quando o código contradiz documento vigente, o plano descreve regra superada, o Handoff não corresponde ao ambiente real ou uma decisão implementada não está registrada.

Consulte `docs/product/POLITICA_SINCRONIZACAO_DOCUMENTAL_CTRH_v1.1.md`.

## 7. Limites

A ferramenta não pode:

- completar lacunas silenciosamente;
- ampliar o escopo por conveniência;
- antecipar outro pacote;
- alterar comportamento não debatido;
- usar documento histórico para desfazer decisão posterior;
- adiar atualização documental para outro pacote.

Nova escolha de produto descoberta durante a implementação retorna ao responsável antes de prosseguir. A descoberta interrompe somente o item afetado; o restante pode prosseguir quando for independente, seguro e não antecipar a decisão pendente.

## 8. Sequência operacional

```text
análise
→ decisões independentes
→ debate e retificações
→ aprovação expressa
→ registro
→ implementação
→ testes e Preview
→ sincronização documental
→ busca de contradições remanescentes
→ homologação
→ próximo debate
```

## 9. Estado pós-R3

As decisões R3-D01 a R3-D09 foram implementadas e prevalecem sobre textos anteriores:

- responsável oficial por UUID;
- ausência de responsável permitida;
- responsável externo e nome livre excluídos de novos cadastros e reatribuições;
- legado textual sem UUID preservado;
- `/demandas` como carteira da equipe;
- `/minhas-demandas` como carteira pessoal;
- `escopo=meu` apenas como compatibilidade legada;
- indicadores contextuais por carteira.

O R3 não será refeito. O Plano Executivo v1.2 preserva esse marco e organiza os pacotes posteriores, sem autorizar sua implementação.

## 10. Próxima atividade autorizada

O E0 está concluído. Conforme GOV-012, OP-D15, OP-D01 e A1-CORE-A01, a única implementação funcional atualmente autorizada é o A1-Core residual, em releases reversíveis e sem antecipar R4, R5, R2 ou regras dependentes do legado futuro.

Após o encerramento do A1-Core, a atividade seguinte será o debate itemizado do R4. A prioridade de sequência não pré-autoriza nenhuma decisão funcional do R4.

## 11. Precedência

1. este Adendo v2.0.4;
2. decisões expressas registradas;
3. Protocolo v1.3;
4. Política de Sincronização Documental v1.1;
5. AGENTS e Handoff atualizados;
6. Product Context;
7. Plano Integrado v3.1, como estratégia geral;
8. Plano Executivo da Operação Atual v1.2, como roteiro do Trilho A;
9. documentos anteriores apenas como históricos.

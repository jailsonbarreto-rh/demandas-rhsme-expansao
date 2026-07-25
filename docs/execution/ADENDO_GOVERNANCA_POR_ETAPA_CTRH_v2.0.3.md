# ADENDO DE GOVERNANÇA POR ETAPA — PLANO REMANESCENTE CTRH

**Versão:** 2.0.3  
**Data:** 25 de julho de 2026  
**Status:** VIGENTE — DEBATE, APROVAÇÃO E SINCRONIZAÇÃO DOCUMENTAL OBRIGATÓRIOS

## 1. Autoridade

Este adendo substitui o `ADENDO_GOVERNANCA_POR_ETAPA_CTRH_v2.0.2.md` para fins de autorização e sequência.

O Plano Remanescente v2.1 organiza o trabalho possível, mas não autoriza automaticamente a implementação de ciclos ou itens. A governança ocorre ciclo por ciclo e decisão por decisão.

## 2. Fases obrigatórias

Cada ciclo possui três fases independentes:

1. **Debate pré-implementação:** decompor o ciclo em decisões concretas e explicar telas, fluxos, permissões, dados e efeitos na rotina.
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

Consulte `docs/product/POLITICA_SINCRONIZACAO_DOCUMENTAL_CTRH_v1.0.md`.

## 7. Limites

A ferramenta não pode:

- completar lacunas silenciosamente;
- ampliar o escopo por conveniência;
- antecipar outro ciclo;
- alterar comportamento não debatido;
- usar documento histórico para desfazer decisão posterior;
- adiar atualização documental para outro ciclo.

Nova escolha de produto descoberta durante a implementação retorna ao responsável antes de prosseguir.

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

O R3 não será refeito. A sequência de debate retoma R1, depois R2, antes de R4 e R5.

## 10. Próxima atividade autorizada

Após a homologação desta reconciliação documental, fica autorizada somente a análise e o debate pré-implementação do R1. Não estão autorizadas alterações funcionais, migrations ou publicações.

## 11. Precedência

1. este Adendo v2.0.3;
2. decisões expressas registradas;
3. Protocolo v1.2;
4. Política de Sincronização Documental v1.0;
5. AGENTS e Handoff atualizados;
6. Product Context e Plano Remanescente v2.1;
7. documentos anteriores apenas como históricos.

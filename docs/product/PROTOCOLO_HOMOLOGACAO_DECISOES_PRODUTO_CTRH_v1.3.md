# PROTOCOLO DE DEBATE, APROVAÇÃO E SINCRONIZAÇÃO DAS DECISÕES DE PRODUTO — CTRH

**Versão:** 1.3  
**Data:** 26 de julho de 2026  
**Status:** VIGENTE — GOVERNANÇA POR PACOTE E DECISÃO  
**Finalidade:** garantir que nenhuma mudança seja implementada sem compreensão, decisão expressa, registro e atualização dos documentos que orientarão trabalhos futuros.

## 1. Regra central

O `Plano_Integrado_Reformulado_CTRH_v3.1.md` é a estratégia geral, e o `Plano_Executivo_Operacao_Atual_CTRH_v1.2.md` é o roteiro do Trilho A. Eles organizam o trabalho possível e não autorizam automaticamente pacote, ciclo, item ou decisão `OP-Dxx`.

Antes de cada pacote, a ferramenta deve decompor o trabalho em decisões independentes, explicar cada uma e submetê-la ao responsável pelo produto. A implementação somente começa após concordância expressa ou retificação posteriormente aprovada e registro no Registro de Decisões.

A conclusão exige também sincronização documental. Uma regra implementada, mas contradita por documento vigente, não está homologada.

## 2. Unidade de análise

A unidade de aprovação é a decisão concreta, não o título ou objetivo geral do pacote.

Devem ser tratadas separadamente mudanças que afetem:

- conteúdo da tela;
- navegação ou execução de tarefa;
- visibilidade de informação;
- permissões;
- obrigatoriedades;
- informações armazenadas ou exibidas;
- alertas, prioridades, filtros, relatórios e métricas;
- preservação e saneamento do legado;
- comportamentos automáticos;
- autoridade e redação dos documentos do projeto.

## 3. Explicações obrigatórias

Para cada decisão, apresentar:

1. como o sistema funciona hoje;
2. o que muda concretamente;
3. usuários afetados;
4. cenário real do CTRH;
5. alternativas, inclusive manter o atual;
6. recomendação identificada apenas como recomendação;
7. impactos positivos e negativos;
8. dependências;
9. dificuldade de reversão;
10. decisão expressa: aprovar, rejeitar, alterar ou adiar;
11. documentos vigentes e históricos afetados.

## 4. Classificação

| Classe | Significado | Tratamento |
|---|---|---|
| Necessidade técnica | Integridade, segurança, desempenho ou manutenção sem regra nova por si só. | Explicar efeitos e escolhas perceptíveis. |
| Preservação do existente | Mantém comportamento já aprovado. | Apresentar evidência. |
| Decisão anteriormente confirmada | Regra aprovada em fonte identificável. | Citar a fonte e confirmar que não foi superada. |
| Nova decisão proposta | Comportamento novo. | Exige decisão expressa. |
| Melhoria opcional | Útil, mas dispensável. | Incluir, adiar ou excluir expressamente. |
| Questão aberta | Alternativas relevantes ou informação insuficiente. | Não implementar. |
| Reconciliação documental | Regra já aprovada ou implantada, mas documentação vigente diverge. | Corrigir textos sem reabrir silenciosamente o mérito. |

Uma recomendação tecnicamente razoável nunca é decisão anterior sem fonte verificável.

## 5. Resultado da análise

Cada decisão pode ser:

- aprovada;
- alterada;
- adiada;
- rejeitada;
- pendente.

Ausência de resposta, aprovação do objetivo geral ou autorização para continuar analisando não equivalem a aprovação.

## 6. Formação do escopo autorizado

Depois do debate, consolidar:

- decisões aprovadas e redação final;
- decisões alteradas;
- itens adiados e rejeitados;
- questões pendentes;
- arquivos, telas, regras e dados afetados;
- documentos que precisarão ser sincronizados;
- critérios de aceite.

A implementação depende de autorização expressa sobre essa consolidação e de registro prévio em `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md`, que é a fonte exclusiva das decisões aprovadas.

## 7. Sincronização documental

### 7.1 Antes de implementar

- pesquisar no repositório termos relacionados à regra atual e à proposta;
- identificar documentos vigentes e históricos afetados;
- incluir essas atualizações no escopo autorizado.

### 7.2 Durante a implementação

- atualizar documentos vigentes junto da mudança funcional;
- não deixar documentação para outro pacote;
- preservar documentos históricos com nota de superação quando necessário;
- parar quando dois documentos vigentes apresentarem regras incompatíveis sem precedência definida.

### 7.3 Antes do PR

- repetir a pesquisa por termos antigos;
- confirmar que ocorrências restantes são vigentes ou claramente históricas;
- atualizar `docs/HANDOFF.md`;
- preencher o checklist documental do template de PR.

### 7.4 Antes da homologação

Confirmar:

1. decisão registrada;
2. código e banco coerentes;
3. Product Context atualizado;
4. Plano Integrado e Plano Executivo atualizados quando houve mudança de estado, sequência ou escopo que os afete;
5. AGENTS atualizado quando houve obrigação permanente;
6. ADR e documentação técnica atualizados;
7. Handoff correspondente ao ambiente real;
8. documentos históricos identificados como históricos ou superados.

Consulte `docs/product/POLITICA_SINCRONIZACAO_DOCUMENTAL_CTRH_v1.1.md`.

## 8. Novas decisões durante a implementação

Se surgir nova escolha ou consequência:

1. parar o item afetado;
2. explicar a questão conforme este protocolo;
3. aguardar decisão expressa;
4. atualizar o registro e a matriz documental antes de continuar.

O restante pode prosseguir apenas quando independente, seguro e incapaz de antecipar ou tornar irreversível a decisão pendente.

## 9. Sequência de cada pacote

```text
análise do estado atual
→ decomposição em decisões
→ explicação de produto
→ debate e retificações
→ decisão expressa item a item
→ registro
→ consolidação do escopo
→ autorização de implementação
→ implementação e testes
→ Preview
→ sincronização documental
→ busca de contradições remanescentes
→ homologação
→ atividade seguinte expressamente autorizada
```

## 10. Proibição de execução silenciosa

Nenhuma ferramenta pode completar lacunas, antecipar outro pacote, transformar recomendação em requisito ou usar documento histórico para desfazer decisão posterior. Quando houver divergência que afete o produto, deve explicá-la e aguardar decisão.

## 11. Controle formal de mudanças

Novo fato, risco ou dependência não reabre automaticamente todo o programa. O executor deve:

1. identificar o item materialmente afetado;
2. registrar a descoberta e seus efeitos nos Trilhos A e B;
3. suspender somente esse item;
4. permitir a continuidade de itens independentes e seguros;
5. submeter qualquer nova escolha de produto ao responsável;
6. sincronizar os documentos vigentes quando a decisão for aprovada.

Planos novos ou revisados não aprovam por si mesmos as recomendações que contêm. Mudança de autoridade documental, decisão de produto e autorização de implementação são atos separados e precisam ser registrados separadamente.

## 12. Cadeia documental vigente

Depois do E0, a interpretação obrigatória segue:

1. Adendo de Governança v2.0.4;
2. este Protocolo v1.3;
3. Registro de Decisões;
4. Política de Sincronização Documental v1.1;
5. Product Context;
6. Plano Integrado v3.1;
7. Plano Executivo da Operação Atual v1.2;
8. ADRs e documentação técnica;
9. Handoff;
10. documentos anteriores somente como históricos.

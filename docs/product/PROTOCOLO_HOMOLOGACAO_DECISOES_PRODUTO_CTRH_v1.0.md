# PROTOCOLO DE DEBATE E APROVAÇÃO DAS DECISÕES DE PRODUTO — CTRH

**Versão:** 1.1  
**Status:** VIGENTE — GOVERNANÇA CICLO A CICLO  
**Finalidade:** garantir que nenhuma mudança de produto seja implementada antes de ser compreendida, debatida e aprovada expressamente pelo responsável pelo produto.

## 1. Regra central

O Plano Remanescente CTRH permanece salvo como referência organizada do trabalho possível. Ele não autoriza automaticamente a implementação de nenhum ciclo ou item.

Antes de cada Ciclo R1 a R12, a ferramenta deverá desmontar o ciclo em decisões independentes, explicar cada uma em linguagem não técnica e submetê-la ao responsável pelo produto. A implementação somente poderá começar após concordância expressa ou após a proposta ter sido retificada e então aprovada.

Não é necessário revisar antecipadamente todos os ciclos. O procedimento é sequencial: debate, aprovação, implementação e homologação do ciclo atual; depois começa o debate do ciclo seguinte.

## 2. Unidade de análise

A unidade de aprovação é a **decisão concreta**, não o título, o objetivo geral nem o conjunto abstrato do ciclo.

Devem ser tratadas separadamente as mudanças que afetem:

- o que aparece na tela;
- como o usuário navega ou executa uma tarefa;
- quem pode ver determinada informação;
- quem pode executar determinada ação;
- o que passa a ser obrigatório;
- quais informações são armazenadas ou exibidas;
- como alertas, prioridades, filtros, relatórios e métricas são calculados;
- como os dados antigos serão preservados, classificados ou saneados;
- quais comportamentos serão assumidos automaticamente pelo sistema.

## 3. Explicações obrigatórias para cada decisão

Para cada decisão independente, a ferramenta deverá apresentar:

1. **Como o sistema funciona hoje.**
2. **O que mudaria concretamente na tela e na rotina.**
3. **Quais usuários seriam afetados.**
4. **Um cenário real de uso no CTRH.**
5. **Alternativas possíveis**, incluindo manter o comportamento atual quando viável.
6. **Recomendação da ferramenta**, claramente identificada apenas como recomendação.
7. **Impactos positivos e negativos.**
8. **Dependências com decisões de outros ciclos.**
9. **Dificuldade e custo de reverter a decisão depois.**
10. **Decisão expressa do responsável pelo produto:** aprovar, rejeitar, alterar ou adiar.

Quando texto não for suficiente para demonstrar uma mudança visual, de navegação ou de fluxo, deverão ser apresentados esquemas, fluxos ou protótipos explicativos antes da decisão.

## 4. Classificação obrigatória dos itens

Cada item do ciclo deverá ser classificado como:

| Classe | Significado | Tratamento |
|---|---|---|
| **NECESSIDADE TÉCNICA** | Correção de integridade, segurança, desempenho ou manutenção que não altera por si só a regra de produto. | Explicar efeitos e riscos; aprovação específica quando houver impacto perceptível ou escolha relevante. |
| **PRESERVAÇÃO DO EXISTENTE** | Mantém comportamento já existente e aprovado. | Apresentar evidência do comportamento preservado. |
| **DECISÃO ANTERIORMENTE CONFIRMADA** | Regra já aprovada em conversa ou documento identificável. | Citar a fonte e confirmar que o contexto não mudou. |
| **NOVA DECISÃO PROPOSTA** | Comportamento novo introduzido pelo plano ou pela análise. | Exige debate e decisão expressa. |
| **MELHORIA OPCIONAL** | Melhoria útil, mas dispensável ao objetivo essencial do ciclo. | Exige decisão para incluir, adiar ou excluir. |
| **QUESTÃO AINDA ABERTA** | Não há informação suficiente ou existem alternativas relevantes. | Não implementar até decisão expressa. |

Uma recomendação tecnicamente razoável nunca deve ser apresentada como decisão anteriormente aprovada.

## 5. Resultado possível da análise

O responsável pelo produto poderá classificar cada decisão como:

- **APROVADA** — pode integrar o escopo de implementação;
- **ALTERADA** — a proposta deverá ser reescrita conforme a retificação e apresentada para confirmação;
- **ADIADA** — permanece fora do ciclo atual, sem implementação;
- **REJEITADA** — deve ser retirada do plano executável;
- **PENDENTE** — exige informação, exemplo ou protótipo adicional.

A ausência de resposta, o silêncio, a aprovação do objetivo geral ou a autorização para continuar o debate não equivalem a aprovação da decisão.

## 6. Formação do escopo autorizado

Depois do debate, a ferramenta deverá apresentar uma consolidação contendo:

- decisões aprovadas;
- redação final de cada regra;
- decisões alteradas e sua versão final;
- itens adiados;
- itens rejeitados;
- questões ainda pendentes;
- arquivos, telas, regras e dados afetados;
- critérios de aceite correspondentes.

A implementação somente poderá começar após autorização expressa para implementar essa consolidação.

A decisão e o escopo autorizado deverão ser registrados em `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md` antes da criação da branch funcional.

## 7. Novas decisões descobertas durante a implementação

A autorização vale apenas para o que foi discutido e registrado.

Se durante a implementação surgir uma nova escolha de produto, consequência não apresentada ou necessidade de ampliar o escopo, a ferramenta deverá:

1. parar o item afetado;
2. explicar a nova questão nos mesmos termos deste protocolo;
3. aguardar decisão expressa;
4. atualizar o registro antes de continuar.

O restante do escopo já aprovado poderá prosseguir somente quando for independente e seguro.

## 8. Sequência de cada ciclo

```text
Análise do estado atual
→ decomposição em decisões independentes
→ explicação em linguagem leiga e de produto
→ debate e retificações
→ decisão expressa item a item
→ consolidação do escopo autorizado
→ autorização expressa de implementação
→ implementação, testes e Preview
→ homologação do resultado
→ debate do ciclo seguinte
```

## 9. Proibição de execução silenciosa

Nenhuma ferramenta pode completar lacunas escolhendo a alternativa que considere melhor, antecipar decisões de outro ciclo ou transformar uma recomendação em requisito obrigatório. Quando a lacuna afetar o produto, deve explicá-la e aguardar decisão.

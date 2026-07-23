# ADENDO DE GOVERNANÇA POR ETAPA — PLANO REMANESCENTE CTRH

**Versão:** 2.0.2  
**Data:** 23 de julho de 2026  
**Status:** VIGENTE — EXECUÇÃO CONDICIONADA À APROVAÇÃO PRÉVIA DE CADA ETAPA

## 1. Decisão de autoridade

Este adendo substitui, para fins de autorização e sequência, o `ADENDO_SUSPENSAO_PLANO_CTRH_v2.0.1.md`.

O Plano Remanescente v2.0 continua válido como inventário organizado do trabalho possível, mas nenhum item nele descrito constitui, isoladamente, autorização de implementação.

A execução não depende mais de homologar antecipadamente todos os Ciclos R1 a R12. A governança passa a ocorrer **ciclo por ciclo**, sempre antes da implementação do ciclo correspondente.

## 2. Regra central

Cada ciclo possui obrigatoriamente duas fases independentes:

1. **Fase de debate e aprovação** — explicação, em linguagem não técnica, de todas as mudanças de lógica, comportamento, telas, permissões, dados, prioridades, relatórios e experiência do usuário previstas para o ciclo.
2. **Fase de implementação** — código, migrations, testes, Preview e publicação apenas do escopo expressamente aprovado pelo responsável pelo produto.

A existência do ciclo no plano, uma recomendação técnica, um PR documental ou a ausência de objeção não equivalem a aprovação.

## 3. Conteúdo obrigatório antes de pedir autorização

Antes de qualquer código ou migration, a ferramenta deverá apresentar ao responsável pelo produto:

- como o sistema funciona atualmente;
- qual problema real a etapa pretende resolver;
- como cada item se materializa nas telas, fluxos e regras do sistema;
- quais perfis serão afetados e o que cada um poderá ver ou fazer;
- quais dados passarão a ser obrigatórios, armazenados, calculados ou exibidos;
- exemplos concretos da rotina do CTRH;
- alternativas possíveis, incluindo manter o comportamento atual;
- recomendação técnica claramente identificada como recomendação;
- impactos positivos, riscos, dependências e custo de reversão;
- lista final separando `APROVAR`, `ALTERAR`, `ADIAR` e `REJEITAR`.

Quando a mudança visual ou de navegação não puder ser compreendida apenas por texto, deverão ser produzidos fluxos, esquemas ou protótipos explicativos antes da decisão.

## 4. Autorização válida

A implementação de um ciclo somente pode começar quando houver manifestação expressa do responsável pelo produto que:

- identifique o ciclo ou conjunto específico de itens;
- confirme o comportamento aprovado;
- registre alterações em relação à proposta original;
- indique o que foi adiado ou rejeitado;
- autorize explicitamente a implementação daquele escopo.

A decisão deverá ser transcrita para o registro de decisões do repositório antes da criação da branch funcional.

## 5. Limite da autorização

A aprovação vale somente para os itens discutidos e registrados.

Durante a implementação, a ferramenta não poderá:

- completar lacunas por conta própria;
- escolher silenciosamente uma alternativa de produto;
- ampliar o escopo porque a ampliação parece conveniente;
- antecipar comportamento de ciclo posterior;
- modificar permissões, obrigatoriedades, padrões, cálculos ou telas não debatidos.

Se surgir uma decisão nova ou uma consequência não apresentada, a ferramenta deverá parar apenas o trecho afetado, explicar a questão e aguardar nova manifestação. O restante do escopo já aprovado poderá continuar somente quando for independente e seguro.

## 6. Sequência operacional

A sequência passa a ser:

```text
Debate R1 → aprovação expressa R1 → implementação R1 → homologação R1
Debate R2 → aprovação expressa R2 → implementação R2 → homologação R2
...
Debate R12 → aprovação expressa R12 → implementação R12 → homologação final
```

Não é necessário decidir antecipadamente os detalhes de todos os ciclos futuros. Dependências conhecidas deverão ser informadas durante o debate do ciclo atual, mas decisões futuras permanecem abertas até sua própria etapa de análise.

## 7. Próxima atividade autorizada

Está autorizada apenas a **análise pré-implementação do Ciclo R1**.

Isso inclui leitura do código e do banco, explicação em linguagem leiga, identificação das mudanças práticas, alternativas e recomendações. Não inclui alterações em código, migrations, Supabase, Vercel ou Production.

A implementação do R1 dependerá de autorização expressa posterior.

## 8. Precedência

Em matéria de autorização de implementação, prevalece a seguinte ordem:

1. este Adendo de Governança v2.0.2;
2. decisões expressas registradas para o ciclo específico;
3. `AGENTS.md` e `docs/HANDOFF.md` atualizados;
4. protocolo de homologação;
5. Plano Remanescente v2.0 como inventário;
6. Plano Mestre v1.0 como histórico.

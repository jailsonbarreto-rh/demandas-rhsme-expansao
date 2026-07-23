# ADENDO DE SUSPENSÃO DO PLANO REMANESCENTE CTRH

**Versão:** 2.0.1  
**Data:** 23 de julho de 2026  
**Status:** VIGENTE — EXECUÇÃO SUSPENSA  

## 1. Decisão de autoridade

Fica revogada a autorização de execução dos Ciclos R1 a R12 constante do Plano Remanescente de Execução CTRH v2.0 e do handoff produzido no rebaseline.

O Plano v2.0 permanece preservado como inventário técnico e proposta de trabalho, mas não pode ser utilizado como especificação aprovada para implementação.

Este adendo prevalece sobre qualquer trecho anterior que declare R1 ou outro ciclo como autorizado.

## 2. Motivo da suspensão

A revisão detalhada do Ciclo R3 demonstrou que o documento incorporou múltiplas decisões de produto como “escopo obrigatório” sem que seus efeitos práticos, alternativas e impactos tivessem sido apresentados e aprovados pelo responsável pelo produto.

Entre essas decisões estão regras de visibilidade, permissões, atribuição, obrigatoriedade de campos, comportamento da carteira pessoal, tratamento do legado e experiência por perfil. Há indícios equivalentes nos demais ciclos.

Uma recomendação tecnicamente razoável não equivale a uma decisão de produto aprovada.

## 3. Bloqueio operacional

Até nova autorização formal, nenhuma ferramenta ou agente poderá:

- iniciar R1, R2 ou qualquer ciclo R1 a R12;
- alterar código, migrations, Supabase, Vercel ou Production com base no Plano v2.0;
- tratar critérios, exemplos ou recomendações do plano como regras aprovadas;
- preencher lacunas escolhendo silenciosamente a alternativa considerada tecnicamente melhor;
- usar o merge do PR #43 como prova de aprovação das decisões de produto.

O PR #43 aprovou a organização documental do trabalho remanescente. Sua autorização de execução foi posteriormente revogada por decisão expressa do responsável pelo produto.

## 4. Única atividade autorizada

Fica autorizada exclusivamente a **Fase D0 — Auditoria e homologação das decisões de produto**, regida por:

`docs/product/PROTOCOLO_HOMOLOGACAO_DECISOES_PRODUTO_CTRH_v1.0.md`

A Fase D0 é documental e analítica. Pode produzir explicações, matrizes de decisão, alternativas e protótipos explicativos, mas não pode executar mudanças funcionais.

## 5. Condições para retomada

A implementação somente poderá ser retomada depois de:

1. inventariar as decisões de produto de todos os ciclos;
2. explicar cada decisão em linguagem operacional e não técnica;
3. apresentar alternativas, impactos, dependências e reversibilidade;
4. obter decisão expressa do responsável pelo produto;
5. retirar ou adiar escolhas não aprovadas;
6. publicar nova versão do plano com apenas decisões homologadas;
7. alterar formalmente o status do plano para aprovado;
8. atualizar `AGENTS.md` e `docs/HANDOFF.md` com o primeiro ciclo nominalmente autorizado.

## 6. Próxima atividade

**D0 — Auditoria e homologação das decisões de produto.**

Nenhum ciclo de implementação está autorizado.

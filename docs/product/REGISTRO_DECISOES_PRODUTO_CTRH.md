# REGISTRO DE DECISÕES DE PRODUTO — CTRH

**Status:** vigente  
**Finalidade:** registrar somente decisões expressamente aprovadas pelo responsável pelo produto antes da implementação de cada ciclo.

## 1. Regra de uso

- O Plano Remanescente v2.0 é referência do trabalho possível, não autorização automática.
- Cada ciclo passa primeiro por debate pré-implementação.
- O ciclo será desmontado em decisões independentes.
- Somente decisões expressas entram neste registro.
- Silêncio, ausência de objeção, recomendação técnica, texto anterior do plano ou aprovação do objetivo geral não equivalem a aprovação dos itens internos.
- Qualquer consequência nova descoberta durante a implementação retorna para decisão antes de ser codificada.
- A branch funcional somente pode ser criada depois que o escopo aprovado estiver registrado.

## 2. Decisões de governança

### GOV-001 — Aprovação obrigatória antes de cada ciclo

**Data:** 23 de julho de 2026  
**Decisão:** APROVADA.

Cada Ciclo R1 a R12 deverá ser explicado e debatido antes de sua implementação. A explicação traduzirá os itens técnicos para mudanças concretas de lógica de produto, funcionalidades, telas, fluxos, permissões, dados e experiência do usuário.

A implementação somente começa após concordância expressa ou após a proposta ter sido retificada e então aprovada. A autorização abrange exclusivamente o escopo consolidado e aprovado.

### GOV-002 — Revisão sequencial, não integral antecipada

**Data:** 23 de julho de 2026  
**Decisão:** APROVADA.

Não é necessário homologar antecipadamente todos os ciclos. O processo ocorre sequencialmente:

```text
debate do ciclo atual
→ decisões e retificações
→ aprovação expressa
→ implementação
→ homologação
→ debate do ciclo seguinte
```

### GOV-003 — Conteúdo mínimo da explicação de cada decisão

**Data:** 23 de julho de 2026  
**Decisão:** APROVADA.

Para cada decisão independente, deverão ser apresentados:

1. como o sistema funciona hoje;
2. o que mudaria concretamente na tela e na rotina;
3. quais usuários seriam afetados;
4. um cenário real de uso;
5. alternativas possíveis, inclusive manter o comportamento atual;
6. recomendação da ferramenta, identificada apenas como recomendação;
7. impactos positivos e negativos;
8. dependências com decisões de outros ciclos;
9. dificuldade e custo de reverter depois;
10. decisão expressa: aprovar, rejeitar, alterar ou adiar.

### GOV-004 — Classificação obrigatória dos itens

**Data:** 23 de julho de 2026  
**Decisão:** APROVADA.

Cada item deverá ser classificado como:

- necessidade técnica;
- preservação do que já existe;
- decisão anteriormente confirmada;
- nova decisão proposta;
- melhoria opcional;
- questão ainda aberta.

### GOV-005 — Nova decisão descoberta durante a implementação

**Data:** 23 de julho de 2026  
**Decisão:** APROVADA.

Se durante a implementação surgir uma escolha de produto, consequência ou ampliação não apresentada no debate, o item afetado deverá parar e voltar ao responsável pelo produto. O restante do escopo poderá prosseguir apenas se for independente e seguro.

## 3. Modelo de registro de decisão do ciclo

Para cada decisão, registrar:

| Campo | Conteúdo |
|---|---|
| ID | Código único do ciclo e da decisão |
| Classificação | Uma das seis classes aprovadas |
| Situação atual | Funcionamento existente |
| Mudança prática | Efeito em tela, rotina e lógica de produto |
| Usuários afetados | Administrador, editor, leitor ou grupo específico |
| Cenário real | Exemplo operacional do CTRH |
| Alternativas | Opções consideradas, inclusive manter como está |
| Recomendação | Recomendação não vinculante da ferramenta |
| Impactos | Benefícios, custos e riscos |
| Dependências | Relação com outras decisões ou ciclos |
| Reversibilidade | Facilidade e custo de desfazer depois |
| Decisão | Aprovada, alterada, adiada, rejeitada ou pendente |
| Redação final | Regra objetiva autorizada para implementação |

## 4. Controle por ciclo

| Ciclo | Debate prévio | Decisões registradas | Implementação autorizada | Estado |
|---|---|---|---|---|
| R1 | Pendente | Não | Não | Próxima atividade: explicação e debate |
| R2 | Não iniciado | Não | Não | Futuro |
| R3 | Parcialmente discutido, sem aprovação integral | Não | Não | Futuro |
| R4 | Não iniciado | Não | Não | Futuro |
| R5 | Não iniciado | Não | Não | Futuro |
| R6 | Não iniciado | Não | Não | Futuro |
| R7 | Não iniciado | Não | Não | Futuro |
| R8 | Não iniciado | Não | Não | Futuro |
| R9 | Não iniciado | Não | Não | Futuro |
| R10 | Não iniciado | Não | Não | Futuro |
| R11 | Não iniciado | Não | Não | Futuro |
| R12 | Não iniciado | Não | Não | Futuro |

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
6. recomendação identificada apenas como recomendação;
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

## 3. Decisões do Ciclo R3

### R3-D01 — Identidade oficial do responsável

**Data:** 23 de julho de 2026  
**Classificação:** nova decisão proposta  
**Decisão:** APROVADA.

O responsável por uma demanda passa a ser identificado oficialmente pelo UUID de um usuário cadastrado no Supabase Auth e em `perfis_usuarios`. O nome textual permanece apenas como fotografia legível da identidade vinculada.

### R3-D02 — Seleção restrita a usuários cadastrados

**Data:** 23 de julho de 2026  
**Classificação:** nova decisão proposta  
**Decisão:** APROVADA.

Novas demandas e futuras reatribuições não aceitam nome digitado livremente. O responsável é selecionado entre todos os usuários cadastrados, independentemente de serem administradores, editores ou leitores e independentemente do status do perfil. A regra existente que permite demanda sem responsável é preservada.

### R3-D03 — Permissões existentes preservadas

**Data:** 23 de julho de 2026  
**Classificação:** preservação do que já existe  
**Decisão:** APROVADA.

A mudança de identificação do responsável não altera quem pode criar, editar, consultar, excluir ou administrar usuários. Papéis, status, permissões e políticas de acesso permanecem como estavam.

### R3-D04 — Migração dos responsáveis históricos

**Data:** 23 de julho de 2026  
**Classificação:** necessidade técnica  
**Decisão:** APROVADA.

As formas textuais `Erica`, `Giselle`, `Sabrina`, `Thiago`, `Jaqueline`, `Jailson`, `Jessica`, `Beth` e `Helena`, inclusive suas ocorrências com sufixo `Migrado`, serão vinculadas aos respectivos perfis oficiais. `Jaqueline IHA` será vinculada a Jaqueline Lima Ximenes Melo.

A migração abrange 378 demandas e registra eventos auditáveis de reatribuição.

### R3-D05 — Preservação de Vanessa Migrado

**Data:** 23 de julho de 2026  
**Classificação:** preservação do que já existe  
**Decisão:** APROVADA.

A única ocorrência `Vanessa Migrado` continuará preservada como informação histórica, com `responsavel_id` nulo, enquanto não existir perfil oficial cadastrado para Vanessa. Editar outros campos dessa demanda não poderá apagar nem substituir silenciosamente essa informação.

### R3-D06 — Coerência obrigatória no servidor

**Data:** 23 de julho de 2026  
**Classificação:** necessidade técnica  
**Decisão:** APROVADA.

Quando houver `responsavel_id`, o banco validará a existência do usuário e derivará o nome diretamente do perfil. O cliente não poderá criar divergência entre UUID e nome. A proteção será aplicada nas RPCs e por gatilho de banco, sem modificar outras regras de negócio.

### R3-D07 — Acesso visual inicial à carteira pessoal

**Data:** 24 de julho de 2026  
**Classificação:** nova decisão proposta  
**Decisão:** APROVADA E POSTERIORMENTE AJUSTADA POR R3-D08.

A primeira implementação exibiu, abaixo de `Atenção agora`, um bloco central destacado com o título `Minhas demandas`, o subtítulo `Acompanhe sua carteira de processos.` e o botão `Acessar minha carteira`.

A ação abria a rota geral de demandas com `escopo=meu`. O vínculo por UUID e a identidade visual foram validados, mas a carteira pessoal ainda era percebida tecnicamente como filtro, o que tornou pouco evidente a navegação inversa e a reentrada a partir da carteira geral.

### R3-D08 — Carteiras como áreas próprias de navegação

**Data:** 24 de julho de 2026  
**Classificação:** nova decisão proposta  
**Decisão:** APROVADA.

A carteira geral e a carteira pessoal passam a ser áreas distintas e permanentes do sistema:

- `/demandas` representa a carteira completa da equipe;
- `/minhas-demandas` representa somente as demandas vinculadas ao UUID do usuário autenticado;
- a navegação principal contém uma aba própria `Minhas demandas`;
- ambas as telas exibem cabeçalho contextual e botão destacado para alternância direta;
- `Limpar filtros` limpa apenas os critérios de pesquisa e nunca muda a carteira atual;
- o acesso pessoal permanece disponível em cartão compacto destacado na grade de indicadores;
- URLs antigas com `escopo=meu` são redirecionadas para a nova rota, preservando os demais filtros;
- demandas sem `responsavel_id`, inclusive `Vanessa Migrado`, não integram nenhuma carteira pessoal.

A alteração é exclusivamente de navegação e apresentação. Não modifica Supabase, dados, permissões, papéis ou demais regras de negócio.

## 4. Modelo de registro de decisão do ciclo

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

## 5. Controle por ciclo

| Ciclo | Debate prévio | Decisões registradas | Implementação autorizada | Estado |
|---|---|---|---|---|
| R1 | Pendente | Não | Não | Aguardando debate |
| R2 | Não iniciado | Não | Não | Futuro |
| R3 | Concluído para responsáveis oficiais e navegação das carteiras | Sim | Sim | Revisão de navegação em implementação controlada |
| R4 | Não iniciado | Não | Não | Futuro |
| R5 | Não iniciado | Não | Não | Futuro |
| R6 | Não iniciado | Não | Não | Futuro |
| R7 | Não iniciado | Não | Não | Futuro |
| R8 | Não iniciado | Não | Não | Futuro |
| R9 | Não iniciado | Não | Não | Futuro |
| R10 | Não iniciado | Não | Não | Futuro |
| R11 | Não iniciado | Não | Não | Futuro |
| R12 | Não iniciado | Não | Não | Futuro |

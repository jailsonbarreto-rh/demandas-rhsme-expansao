# REGISTRO DE DECISÕES DE PRODUTO — CTRH

<!-- IMPLEMENTATION_AUTHORIZATION: UX-RADAR-002 -->

**Status:** vigente  
**Atualizado em:** 28 de julho de 2026  
**Finalidade:** registrar somente decisões expressamente aprovadas pelo responsável pelo produto antes da implementação de cada pacote.

## 1. Regra de uso

- O Plano Integrado v3.1 e o Plano Executivo v1.2 organizam o trabalho possível, não autorização automática.
- Cada pacote passa primeiro por debate pré-implementação.
- O pacote será desmontado em decisões independentes.
- Somente decisões expressas entram neste registro.
- Silêncio, ausência de objeção, recomendação técnica, texto anterior do plano ou aprovação do objetivo geral não equivalem a aprovação dos itens internos.
- Qualquer consequência nova descoberta durante a implementação retorna para decisão antes de ser codificada.
- A branch funcional somente pode ser criada depois que o escopo aprovado estiver registrado.
- A decisão mais recente registrada prevalece sobre descrição incompatível em plano, especificação ou relatório anterior.
- A implementação somente é concluída quando os documentos vigentes afetados foram sincronizados.

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
- questão ainda aberta;
- reconciliação documental, quando a regra já foi decidida e implantada, mas os documentos vigentes ainda divergem.

### GOV-005 — Nova decisão descoberta durante a implementação

**Data:** 23 de julho de 2026  
**Decisão:** APROVADA.

Se durante a implementação surgir uma escolha de produto, consequência ou ampliação não apresentada no debate, o item afetado deverá parar e voltar ao responsável pelo produto. O restante do escopo poderá prosseguir apenas se for independente e seguro.

### GOV-006 — Sincronização documental obrigatória

**Data:** 25 de julho de 2026  
**Classificação:** decisão de governança  
**Decisão:** APROVADA.

Toda alteração concreta de lógica, regra de negócio, permissão, obrigatoriedade, modelo de dados, cálculo, rota ou comportamento visível deverá atualizar, no mesmo trabalho versionado, todos os documentos vigentes afetados.

A entrega somente será considerada concluída quando:

1. a decisão estiver registrada;
2. código e banco refletirem a decisão;
3. `docs/PRODUCT_CONTEXT.md`, o Plano Integrado e o Plano Executivo afetado descreverem a mesma regra;
4. `AGENTS.md`, ADRs e documentação técnica afetados estiverem atualizados;
5. documentos históricos potencialmente conflitantes estiverem identificados como históricos ou superados;
6. `docs/HANDOFF.md` registrar o estado efetivamente implantado;
7. a busca por termos antigos não retornar orientação contraditória como se fosse vigente.

A documentação é parte do contrato do produto. Não será tratada como tarefa editorial opcional nem adiada para outro ciclo.

Consulte `docs/product/POLITICA_SINCRONIZACAO_DOCUMENTAL_CTRH_v1.1.md`.

### GOV-007 — Adoção da cadeia documental v3.1/v1.2

**Data:** 26 de julho de 2026  
**Classificação:** reconciliação documental  
**Decisão:** APROVADA.

A cadeia documental passa a distinguir:

1. `docs/execution/Plano_Integrado_Reformulado_CTRH_v3.1.md` como estratégia geral dos Trilhos A e B;
2. `docs/execution/Plano_Executivo_Operacao_Atual_CTRH_v1.2.md` como roteiro do trabalho possível do Trilho A;
3. este Registro como fonte exclusiva das decisões expressamente aprovadas;
4. Adendo v2.0.4, Protocolo v1.3 e Política v1.1 como governança vigente;
5. Plano Remanescente v2.1 e versões documentais anteriores como registros históricos.

A adoção dos planos não aprova nenhuma decisão `OP-Dxx`, não autoriza implementação funcional e não converte recomendações em regras de produto. Pacotes e decisões continuam sujeitos a debate, registro e autorização expressa.

### GOV-008 — Autorização exclusiva do Pacote E0

**Data:** 26 de julho de 2026  
**Classificação:** reconciliação documental e necessidade técnica  
**Decisão:** APROVADA E CONCLUÍDA.

O Pacote E0 foi autorizado exclusivamente para consolidar a cadeia documental v3.1/v1.2, criar o gate automatizado e corrigir referências documentais. Foi concluído no PR #58. A conclusão do E0 não autorizou automaticamente os pacotes seguintes.

### GOV-009 — Preservação informacional universal

**Data:** 27 de julho de 2026  
**Classificação:** preservação do que já existe e decisão de governança de dados  
**Decisão:** APROVADA.

As regras atuais governam novos cadastros e novas operações. Dados oficiais legados, históricos ou já registrados não podem ser apagados, omitidos, sobrescritos, truncados, convertidos silenciosamente em vazio nem substituídos por valor aparentemente compatível apenas porque não atendem a uma regra atual ou futura.

O tratamento obrigatório é:

1. preservar o valor original e sua proveniência;
2. tentar normalização, tradução e correlação segura;
3. aplicar a regra atual automaticamente somente quando a correspondência for comprovável;
4. registrar como pendente, ambíguo, conflitante ou não associado o que não puder ser adaptado com segurança;
5. manter a informação consultável e recuperável para saneamento posterior;
6. nunca inventar correspondência nem transformar ausência de correlação em ausência de informação.

A regra vale para responsáveis, setores, tipos, classificações, status, prazos, datas, assuntos, números, comentários, observações, documentos, links, eventos históricos e qualquer outro dado oficial.

O caso `Vanessa Migrado` é o exemplo canônico: a informação textual histórica permanece preservada sem UUID até que exista decisão e vínculo oficial. A exceção histórica não reintroduz nome livre para novos cadastros.

Toda mudança futura que possa apagar, reduzir, ocultar, reinterpretar ou sobrescrever informação oficial deve ser apresentada ao responsável pelo produto antes da implementação. O item afetado deve parar até decisão expressa.

Consulte `docs/product/PRINCIPIO_PRESERVACAO_INFORMACIONAL_CTRH_v1.0.md`.

### GOV-010 — Separação entre auditoria técnica e apresentação operacional

**Data:** 27 de julho de 2026  
**Classificação:** decisão de produto e correção de apresentação  
**Decisão:** APROVADA E IMPLEMENTADA.

Metadados técnicos de migration, lote, hash, rotina ou versão podem e devem permanecer preservados para auditoria, mas não substituem informação operacional nem devem ser exibidos literalmente ao usuário quando não ajudam a compreender ou executar o trabalho.

A interface apresenta linguagem administrativa útil. Os registros brutos permanecem preservados no banco.

A correção implementada no PR #69, publicada pelo PR #70 e protegida pelo PR #71 determinou:

- `Demanda importada do lote saneado <hash>.` e `Demanda importada da planilha inicial.` são apresentadas como `Demanda importada do sistema legado.`;
- `Responsável vinculado a perfil oficial na migração R3.` é apresentado como `Responsável vinculado ao perfil oficial.`;
- eventos técnicos permanecem no histórico individual, mas não aparecem como movimentação operacional global;
- nenhum comentário ou evento bruto foi apagado ou reescrito.

### GOV-011 — Segurança e exposição consolidadas ao final da fase funcional

**Data:** 27 de julho de 2026  
**Classificação:** mudança de sequência  
**Decisão:** APROVADA.

A retirada de dados reais dos repositórios, a contenção do repositório predecessor, a revisão de deployments antigos e eventual reescrita de histórico Git ficam adiadas para um pacote consolidado de segurança ao final das implementações funcionais e antes da entrega do produto para uso.

Até esse pacote final:

- nenhum arquivo real será apagado por esse motivo;
- nenhum histórico Git será reescrito;
- a frente de segurança não bloqueará as implementações funcionais independentes;
- a preservação para desenvolvimento e conferência prevalece sobre limpeza prematura.

## 3. Decisões do Pacote E3

### OP-D02 — Semântica neutra de setor, acompanhamento e distribuição por responsável

**Data:** 27 de julho de 2026  
**Classificação:** correção de linguagem e prevenção de inferência indevida  
**Decisão:** APROVADA E IMPLEMENTADA.

O campo `setor` permanece textual e registra o setor informado na demanda. A contagem de demandas agrupadas por esse campo não comprova atividade recente, produtividade, desempenho, esforço realizado nem estrutura organizacional oficial.

A quantidade de demandas vinculadas a um responsável representa distribuição de carteira ou estoque, não classificação competitiva nem avaliação de desempenho. Para as demandas não encerradas, o conceito oficial permanece `Em acompanhamento`.

As redações vigentes são:

- `Setores mais Ativos` → `Demandas por setor informado`;
- `Ativas` → `Em acompanhamento`;
- `Ranking de responsáveis — 10 maiores volumes` → `Distribuição por responsável — 10 maiores volumes`.

Os dados, cálculos, contagens, filtros e regras operacionais permanecem inalterados. A correção do histórico técnico foi implementada nos PRs #69–#71; as demais semânticas do E3 foram implementadas no PR #73.

Consulte `docs/adr/ADR-005-semantica-setor-e-distribuicoes.md`.

## 4. Decisões do Ciclo R3

### R3-D01 — Identidade oficial do responsável

**Data:** 23 de julho de 2026  
**Classificação:** nova decisão proposta  
**Decisão:** APROVADA.

O responsável por uma demanda passa a ser identificado oficialmente pelo UUID de um usuário cadastrado no Supabase Auth e em `perfis_usuarios`. O nome textual permanece apenas como fotografia legível da identidade vinculada.

### R3-D02 — Seleção restrita a usuários cadastrados

**Data:** 23 de julho de 2026  
**Classificação:** nova decisão proposta  
**Decisão:** APROVADA.

Novas demandas e futuras reatribuições não aceitam nome digitado livremente nem responsável externo. O responsável é selecionado entre usuários cadastrados, independentemente de serem administradores, editores ou leitores e independentemente do status do perfil. A regra existente que permite demanda sem responsável é preservada.

Esta decisão substitui descrições anteriores de responsável externo com UUID nulo e texto livre.

### R3-D03 — Permissões existentes preservadas

**Data:** 23 de julho de 2026  
**Classificação:** preservação do que já existe  
**Decisão:** APROVADA.

A mudança de identificação do responsável não altera quem pode criar, editar, consultar, excluir ou administrar usuários. Papéis, status, permissões e políticas de acesso permanecem como estavam.

### R3-D04 — Migração dos responsáveis históricos

**Data:** 23 de julho de 2026  
**Classificação:** necessidade técnica  
**Decisão:** APROVADA E IMPLEMENTADA.

As formas textuais `Erica`, `Giselle`, `Sabrina`, `Thiago`, `Jaqueline`, `Jailson`, `Jessica`, `Beth` e `Helena`, inclusive suas ocorrências com sufixo `Migrado`, foram vinculadas aos respectivos perfis oficiais. `Jaqueline IHA` foi vinculada a Jaqueline Lima Ximenes Melo.

A migração abrangeu 378 demandas e registrou eventos auditáveis de reatribuição.

### R3-D05 — Preservação de Vanessa Migrado

**Data:** 23 de julho de 2026  
**Classificação:** preservação do que já existe  
**Decisão:** APROVADA E IMPLEMENTADA.

A única ocorrência `Vanessa Migrado` permanece preservada como informação histórica, com `responsavel_id` nulo, enquanto não existir perfil oficial cadastrado para Vanessa. Editar outros campos dessa demanda não pode apagar nem substituir silenciosamente essa informação.

A informação não transforma Vanessa em opção de novo cadastro ou reatribuição.

### R3-D06 — Coerência obrigatória no servidor

**Data:** 23 de julho de 2026  
**Classificação:** necessidade técnica  
**Decisão:** APROVADA E IMPLEMENTADA.

Quando houver `responsavel_id`, o banco valida a existência do usuário e deriva o nome diretamente do perfil. O cliente não pode criar divergência entre UUID e nome. A proteção foi aplicada nas RPCs e por gatilho de banco, sem modificar outras regras de negócio.

### R3-D07 — Acesso visual inicial à carteira pessoal

**Data:** 24 de julho de 2026  
**Classificação:** nova decisão proposta  
**Decisão:** APROVADA E POSTERIORMENTE AJUSTADA POR R3-D08.

A primeira implementação exibiu, abaixo de `Atenção agora`, um bloco central destacado com o título `Minhas demandas`, o subtítulo `Acompanhe sua carteira de processos.` e o botão `Acessar minha carteira`.

A ação abria a rota geral de demandas com `escopo=meu`. O vínculo por UUID e a identidade visual foram validados, mas a carteira pessoal ainda era percebida tecnicamente como filtro, o que tornou pouco evidente a navegação inversa e a reentrada a partir da carteira geral.

### R3-D08 — Carteiras como áreas próprias de navegação

**Data:** 24 de julho de 2026  
**Classificação:** nova decisão proposta  
**Decisão:** APROVADA E IMPLEMENTADA.

A carteira geral e a carteira pessoal são áreas distintas e permanentes:

- `/demandas` representa a carteira completa da equipe;
- `/minhas-demandas` representa somente demandas vinculadas ao UUID autenticado;
- a navegação principal contém aba própria `Minhas demandas`;
- ambas exibem cabeçalho contextual e alternância direta;
- `Limpar filtros` limpa critérios de pesquisa e nunca muda a carteira;
- o acesso pessoal permanece disponível em cartão compacto destacado;
- URLs antigas com `escopo=meu` redirecionam para `/minhas-demandas`, preservando os demais filtros;
- demandas sem `responsavel_id`, inclusive `Vanessa Migrado`, não integram carteira pessoal.

A alteração é de navegação e apresentação. Não modifica permissões, papéis ou demais regras de negócio.

### R3-D09 — Indicadores contextuais por carteira

**Data:** 24 de julho de 2026  
**Classificação:** nova decisão proposta  
**Decisão:** APROVADA E IMPLEMENTADA.

Os indicadores superiores refletem a carteira aberta:

- na Visão geral e em `/demandas`, usam a carteira completa;
- em `/minhas-demandas`, usam somente demandas vinculadas ao UUID autenticado;
- o clique preserva a carteira e aplica o filtro dentro dela;
- alternar entre carteiras recalcula imediatamente as quantidades.

A decisão não cria categorias ou regras novas de prazo. Aplica regras existentes à coleção delimitada pela rota.

### R3-D10 — Reconciliação documental pós-R3

**Data:** 25 de julho de 2026  
**Classificação:** reconciliação documental  
**Decisão:** APROVADA.

Todos os documentos vigentes devem refletir as decisões R3-D01 a R3-D09. Em particular:

- excluir responsável externo e nome livre das regras atuais de cadastro e reatribuição;
- manter somente usuário cadastrado por UUID ou ausência de responsável;
- preservar informação textual legada sem convertê-la em opção futura;
- registrar `/demandas` e `/minhas-demandas` como rotas canônicas;
- tratar `escopo=meu` apenas como compatibilidade legada;
- registrar o R3 como implementado, sem reexecução;
- retomar cronologicamente o debate por R1 e R2 antes de R4 e R5.

O Plano Remanescente v2.1 e o Product Context atualizado substituem as descrições conflitantes anteriores. Documentos históricos permanecem preservados, mas não orientam regressão.

**Nota de precedência:** a orientação de continuidade por R1/R2 registrada naquele momento foi superada, quanto à próxima atividade, por GOV-007, GOV-008 e pelas decisões posteriores deste Registro. As regras materiais do R3 permanecem vigentes; nenhum pacote posterior está autorizado automaticamente.

## 5. Decisão de interface autorizada

### UX-RADAR-001 — Consolidação da identidade e da microcopy operacional do Radar

**Data:** 28 de julho de 2026  
**Classificação:** decisão expressamente aprovada pelo responsável pelo produto.  
**Decisão:** APROVADA E IMPLEMENTADA.

A identidade completa `Radar de Governança` — ícone, título e subtítulo — será apresentada no cabeçalho principal, ocupando o lugar de `Painel de Demandas`, sem repetição de um segundo hero dentro da página. O botão inicial de navegação também passará a se chamar `Radar de Governança`.

Serão retiradas da interface as três frases explicativas que repetem decisões internas sobre produtividade, desempenho e interpretação da ausência de prazo. Permanecem preservados os cálculos, denominadores explícitos, contadores de cobertura, rótulos neutros e a documentação de governança; a mudança é exclusivamente de exposição ao usuário.

O badge técnico que cita fornecedor ou mecanismo de armazenamento será substituído por estado operacional derivado da condição real da aplicação: sistema online, sincronização em curso, conexão indisponível ou modo de demonstração. O indicador visual `Ctrl/⌘ K` será removido, mantendo-se integralmente o atalho de teclado.

Não há autorização nem necessidade de alterar dados, schema, migrations, permissões, métricas, regras de cálculo ou integração do Supabase.

### UX-RADAR-002 — Clareza da carteira e polimento visual contido

**Data:** 28 de julho de 2026  
**Classificação:** decisão expressamente aprovada pelo responsável pelo produto.  
**Decisão:** APROVADA PARA IMPLEMENTAÇÃO.

O botão de navegação da carteira coletiva passa de `Demandas` para `Todas as demandas`, distinguindo de forma explícita o escopo da equipe em relação a `Minhas demandas`. O título contextual da própria carteira permanece `Todas as demandas`.

Os rótulos visuais `Composição atual` e `Leitura da carteira` serão retirados do Radar por não acrescentarem orientação acionável. A região analítica manterá nome acessível, e todos os cartões, cálculos, denominadores, rótulos de dados e comportamentos permanecem preservados.

O polimento visual fica restrito ao sistema existente: remover o espaçamento residual deixado pelo cabeçalho retirado, harmonizar o ritmo entre blocos e acomodar os quatro destinos de navegação em uma grade de duas colunas em telas estreitas. Não serão introduzidos novos componentes, cores, métricas ou padrões de interação.

Não há autorização nem necessidade de alterar dados, schema, migrations, permissões, integração do Supabase, regras de negócio, rotas ou cálculos.

## 6. Modelo de registro de decisão do ciclo

| Campo | Conteúdo |
|---|---|
| ID | Código único do ciclo e da decisão |
| Classificação | Uma das classes aprovadas |
| Situação atual | Funcionamento existente |
| Mudança prática | Efeito em tela, rotina e lógica de produto |
| Usuários afetados | Administrador, editor, leitor ou grupo específico |
| Cenário real | Exemplo operacional do CTRH |
| Alternativas | Opções consideradas, inclusive manter como está |
| Recomendação | Recomendação não vinculante da ferramenta |
| Impactos | Benefícios, custos e riscos |
| Dependências | Relação com outras decisões ou ciclos |
| Reversibilidade | Facilidade e custo de desfazer depois |
| Documentos afetados | Documentos vigentes e históricos a sincronizar |
| Decisão | Aprovada, alterada, adiada, rejeitada ou pendente |
| Redação final | Regra objetiva autorizada para implementação |

## 7. Controle por ciclo

| Ciclo | Debate prévio | Decisões registradas | Implementação autorizada | Estado |
|---|---|---|---|---|
| E0 | Concluído | GOV-007 e GOV-008 | Concluída | PR #58 concluído |
| E1 | Concluído | Autorização registrada no Handoff histórico | Concluída | Production alinhada pelo PR #59; bloqueio restaurado no PR #60 |
| E1A | Concluído | Autorização registrada no Handoff histórico | Concluída | PR #61 concluído sem reexecução de SQL |
| E2 / segurança final | Adiado | GOV-011 | Não no momento | Executar após as implementações funcionais e antes da entrega |
| E3 | Concluído | GOV-010 e OP-D02 | Concluída | Histórico corrigido nos PRs #69–#71; demais semânticas concluídas no PR #73 |
| UX-RADAR-001 | Concluído | UX-RADAR-001 | Concluída | PR #88, publicação #89 e bloqueio #90 |
| UX-RADAR-002 | Em implementação | UX-RADAR-002 | Em execução | Nomenclatura e polimento visual aprovados em 28/07/2026 |
| E4 | Não iniciado | Não | Não | Futuro; depende de debate e autorização expressa |
| R1 | Pendente | Não | Não | Sem autorização atual |
| R2 | Não iniciado | Não | Não | Futuro |
| R3 | Concluído | R3-D01 a R3-D10 | Concluída | Implementado e preservado |
| R4 | Não iniciado | Não | Não | Futuro após R1 e R2 |
| R5 | Não iniciado | Não | Não | Suspenso até R4 |
| R6 | Não iniciado | Não | Não | Futuro |
| R7 | Não iniciado | Não | Não | Futuro |
| R8 | Não iniciado | Não | Não | Futuro |
| R9 | Não iniciado | Não | Não | Futuro |
| R10 | Não iniciado | Não | Não | Futuro |
| R11 | Não iniciado | Não | Não | Futuro |
| R12 | Não iniciado | Não | Não | Futuro |

# PLANO MESTRE DE EXECUÇÃO — CENTRAL DE DEMANDAS CTRH

## Evolução para central personalizada de trabalho, prazos, relatórios e análise gerencial

**Versão:** 1.0  
**Data de corte:** 21 de julho de 2026  
**Situação:** pronto para execução controlada  
**Destinatário primário:** agente de engenharia Codex ou ferramenta equivalente  
**Produto:** Central de Demandas — CTRH / SME-RJ  
**Repositório:** WilsonMPeixoto-2/demandas-rhsme-expansao  
**Produção:** https://demandas-rhsme-expansao.vercel.app/  
**Banco:** Supabase — projeto CTRH PROCESSOS

---

# 1. INSTRUÇÃO MANDATÓRIA AO AGENTE EXECUTOR

Este documento é um contrato de execução. O agente deve lê-lo integralmente antes de alterar qualquer arquivo, banco, configuração ou ambiente. A ordem dos ciclos é vinculante. Uma tarefa somente pode ser declarada concluída quando seus testes, critérios de aceite, revisão de escopo e evidências estiverem satisfeitos.

## 1.1 Comando de interpretação

Se o responsável pelo produto disser “execute este plano”, “prossiga conforme o plano” ou formulação equivalente, consideram-se aprovadas as decisões funcionais marcadas como **DECISÃO FIXADA**. Isso não autoriza automaticamente ações externas destrutivas, especialmente apagar deployments históricos, reescrever histórico Git ou eliminar dados de produção. Essas ações conservam os gates específicos deste documento.

O agente executor deve:

1. Trabalhar em branch própria e nunca desenvolver diretamente na main.
2. Executar apenas um ciclo publicável por vez.
3. Escrever ou atualizar testes antes da implementação que altera comportamento.
4. Preservar integralmente busca avançada, exportação Excel atual, acessibilidade, responsividade, perfis, RLS, Realtime e rotas existentes, exceto quando este plano ordenar alteração explícita.
5. Usar Supabase como fonte de verdade em produção.
6. Manter modo local somente para desenvolvimento e testes, com dados sintéticos.
7. Não colocar dados reais, segredos, senhas ou chaves administrativas em código cliente, fixtures públicas, logs, screenshots, PRs ou artefatos de teste.
8. Não transformar volume atribuído em avaliação de produtividade individual.
9. Não criar infraestrutura corporativa desproporcional para uma equipe com menos de dez usuários.
10. Parar e relatar o bloqueio quando ocorrer qualquer condição de parada definida na seção 16.

## 1.2 Proibições expressas

O agente não pode:

- reinterpretar o significado dos status;
- criar novos status sem decisão formal do responsável pelo produto;
- tratar Tramitado como Encerrado;
- tratar ausência de prazo como prazo vencido;
- vincular responsável por aproximação de nomes sem confirmação;
- alterar dados históricos em massa por inferência;
- expor “modo local” em produção;
- adicionar biblioteca de busca, gráficos, estado global ou notificações sem necessidade demonstrada;
- substituir ExcelJS, Supabase, React Router, TanStack Table, React Hook Form ou Zod sem autorização;
- criar Figma, mockup externo ou dependência de design para executar o plano;
- publicar um PR que misture ciclos independentes;
- aplicar migration de contrato antes de o frontend compatível estar em produção e homologado;
- apagar deployments antigos sem inventário, evidência de exposição e autorização específica;
- declarar sucesso com testes omitidos, ignorados, flaky ou executados somente parcialmente.

## 1.3 Modelo obrigatório de execução por ciclo

Cada ciclo seguirá esta sequência:

1. Confirmar precondições e branch.
2. Ler AGENTS.md, docs/PRODUCT_CONTEXT.md, os ADRs relevantes e este plano antes de interpretar a tarefa.
3. Registrar o gate de produto: pessoa afetada, dor atual, cenário real, resultado esperado e comportamento existente protegido.
4. Escrever testes de caracterização ou testes RED.
5. Executar os testes e registrar a falha esperada.
6. Implementar a menor solução completa do ciclo.
7. Executar testes específicos.
8. Validar o cenário real do usuário, incluindo clareza, quantidade de passos, preservação de contexto e ausência de incentivo a controle paralelo.
9. Executar gate integral aplicável.
10. Revisar diff, escopo e aderência ao produto.
11. Atualizar documentação.
12. Criar commit atômico.
13. Publicar branch e PR.
14. Validar Preview.
15. Homologar os critérios técnicos e funcionais.
16. Mesclar e validar Production somente quando o ciclo autorizar.

## 1.4 Gate técnico padrão

Executar a partir da raiz do repositório:

~~~bash
npm ci
npm audit --audit-level=high
npm audit signatures
npm run lint
npm run test:coverage
npm run build
npm run check:bundle
npm run test:e2e
~~~

Resultado esperado: todos os comandos terminam com código 0; nenhum teste é removido para obter aprovação; o orçamento de bundle permanece aprovado; os testes E2E rodam em desktop e mobile conforme a configuração do projeto.

---

# 2. RESULTADO FINAL ESPERADO

## 2.1 Tese central

O sistema deve deixar de ser apenas um cadastro operacional pesquisável e tornar-se a central diária de trabalho do CTRH. Ao entrar, cada usuário deverá saber o que está sob sua responsabilidade, o que exige ação, o que pode se tornar problema, o que está aguardando terceiros, o que está incompleto e que relatório pode ser produzido sem reconstruir controles paralelos.

## 2.2 Entregas funcionais

Ao final do plano, o sistema deverá oferecer:

- página inicial personalizada por login e papel;
- carteira “Minhas demandas” baseada em vínculo por identificador de perfil;
- separação entre demanda em acompanhamento, providência CTRH, espera externa, sobrestamento e encerramento;
- próxima ação e data de acompanhamento para toda demanda não encerrada criada ou movimentada após a implantação;
- alertas completos e preventivos, não limitados a um item por categoria;
- cadastro explícito de prazo definido, não informado ou não aplicável;
- fila de saneamento de cadastros legados;
- registro separado de andamento e mudança de status;
- histórico que responda quem fez, quando fez, o que mudou e por quê;
- edição e reatribuição rastreadas;
- exclusão lógica recuperável;
- busca preservada e ampliada por responsável e escopo pessoal;
- link direto compartilhável para demanda;
- Central de Relatórios com sete modelos Excel;
- painel gerencial orientado a estoque, risco, carga e fluxo;
- indicadores acompanhados de cobertura e limitações dos dados;
- visões e preferências salvas por usuário;
- recuperação de senha;
- login mais simples e informativo;
- documentação, rollback e homologação final.

## 2.3 Resultado que não deve ser produzido

O plano não cria ranking competitivo, avaliação de desempenho, workflow burocrático de múltiplas aprovações, central complexa de notificações, mecanismo externo de busca, data warehouse, BI separado, microserviços ou infraestrutura de mensagens. E-mail diário ou semanal permanece fora do escopo inicial e somente poderá ser avaliado após trinta dias de uso dos alertas internos.

---

# 3. LINHA DE BASE CONFIRMADA

Os números abaixo representam a auditoria realizada sobre o estado observado em 21 de julho de 2026. O executor deve repetir as consultas de linha de base no início da execução e registrar diferenças; não deve sobrescrever estes números silenciosamente.

| Dimensão | Estado observado | Consequência para o plano |
|---|---:|---|
| Demandas no Supabase | 379 | Volume compatível com processamento no cliente; não exige busca externa nem paginação de servidor. |
| Registros de histórico | 385 | O histórico é insuficiente para análises temporais abrangentes. |
| Perfis | 5 | A personalização por login é simples e de alto retorno. |
| Demandas vencidas aparentes | 23 | Há risco real, mas limitado pela baixa cobertura de prazo. |
| Sem prazo final | 354, ou 93,4% | Alertas por prazo representam somente pequena parte da realidade. |
| Sem prazo interno | 369, ou 97,4% | A nomenclatura e a aplicabilidade precisam ser saneadas. |
| Apenas evento inicial | 376 de 379 | Tempo parado, produtividade e ciclo não podem ser inferidos com confiabilidade histórica. |
| Status Tramitado | 262, cerca de 69% | “Ativas” não pode continuar sendo a única leitura do estoque. |
| Valores textuais de responsável | 16 | Nome livre não identifica com segurança os cinco perfis. |
| Testes automatizados | 158 aprovados na auditoria | A evolução deve ampliar, não reduzir, a regressão existente. |
| Build, lint e dependências | aprovados | A base técnica é saudável. |
| Busca | multi-termo, tolerante e explicável | Deve ser preservada como ativo maduro. |
| Excel | resumo executivo e base detalhada | Deve ser evoluído, não reconstruído do zero. |
| Bundle público | contém 50 demandas reais de initialDemandas.ts | Correção objetiva de prioridade zero. |

## 3.1 Arquivos centrais existentes

O executor deve conhecer, no mínimo:

- src/App.tsx — orquestra sessão, filtros, rotas, modais, busca e exportação;
- src/types.ts — tipos atuais de demanda, histórico e usuário;
- src/services/contracts.ts — contratos dos serviços;
- src/services/supabaseDemandasRepository.ts — leitura e mutações remotas;
- src/services/localDemandasRepository.ts — modo local e dados iniciais;
- src/services/createAppServices.ts — composição dos backends;
- src/components/Header.tsx — indicadores e ações globais;
- src/components/VisaoGeral.tsx — painel atual;
- src/components/AtencaoImediata.tsx — alertas atuais limitados;
- src/components/DemandasTable.tsx — tabela, ordenação e ações;
- src/components/FilterPanel.tsx — filtros e busca;
- src/components/DemandDetailDrawer.tsx — prontuário e histórico;
- src/components/ModalNovo.tsx, ModalEditar.tsx e ModalStatus.tsx — mutações atuais;
- src/components/AuthPanel.tsx — login e primeiro acesso;
- src/export/excelAnalytics.ts e src/export/exportDemandasExcel.ts — relatório atual;
- supabase/migrations/20260707000000_sme_demandas.sql — estrutura-base;
- src/data/initialDemandas.ts — dado real atualmente alcançável pelo bundle;
- scripts/bootstrap-supabase.mjs — carga inicial dependente do arquivo cliente.

## 3.2 Pontos fortes que constituem regressão proibida

- Busca por número, tipo, assunto, responsável, setor, classificação, status e histórico.
- Normalização de caixa, acento e pontuação do número.
- Todos os termos exigidos, mesmo distribuídos entre campos.
- Resultado aproximado explicado quando não há correspondência completa.
- Destaque seguro sem injeção de HTML.
- Buscas recentes e atalho Ctrl/Command+K.
- Filtros e demanda preservados na URL.
- Excel sem macros, com prevenção de formula injection.
- RLS, RPCs, Realtime e três papéis de acesso.
- Modais Radix acessíveis, confirmação de descarte e drawer navegável.
- Responsividade e testes em desktop e mobile.

## 3.3 O produto no mundo real

A Central de Demandas não é um sistema genérico de tickets e não é apenas uma versão web de uma planilha. Ela organiza parte do trabalho administrativo de Recursos Humanos da SME-RJ realizado por uma equipe pequena do CTRH. Cada registro representa um processo, expediente ou outra demanda que precisa ser compreendida, atribuída, analisada, movimentada, encaminhada, acompanhada, assinada, ajustada ou encerrada.

O trabalho não é linear. Uma demanda pode estar sob providência direta do CTRH, seguir para assinatura, ser encaminhada a outro setor e aguardar retorno, ficar sobrestada por uma condição externa, voltar para ajuste ou ser encerrada. Por isso, o sistema precisa representar responsabilidade e próxima providência, não apenas armazenar o status atual.

O produto é interno, com menos de dez usuários, e será consultado repetidamente ao longo do dia. A maior parte do trabalho ocorre em desktop, mas consultas rápidas e verificação de prazos precisam continuar utilizáveis no celular. Não há público externo, autoatendimento cidadão ou necessidade de escala para milhares de acessos simultâneos.

## 3.4 Ecossistema de trabalho

O sistema convive com processos administrativos oficiais e canais institucionais. Ele não substitui o sistema oficial em que o processo tramita nem cria validade administrativa própria. Sua função é ser a camada operacional do CTRH: organizar a carteira, antecipar providências, preservar memória de acompanhamento, facilitar a localização e produzir informação gerencial.

Consequências práticas:

- o número do processo ou documento é a chave reconhecida no cotidiano;
- o link de origem, quando cadastrado, deve levar ao sistema oficial;
- o histórico da Central registra o acompanhamento interno, não substitui os autos;
- o Excel é um produto de saída para análise e prestação de informação, não uma base paralela que retorna como fonte principal;
- a base Supabase é a fonte de verdade da Central;
- a interface deve usar vocabulário reconhecível pela equipe, sem converter o trabalho administrativo em terminologia artificial de software.

## 3.5 Pessoas reais e suas necessidades

### Administrador ou gestor da Central

Precisa enxergar a equipe sem abrir centenas de linhas: volume em acompanhamento, o que depende do CTRH, o que está vencido, o que está sem responsável, o que aguarda retorno e onde os dados não permitem análise. Também aprova acessos, corrige cadastros, restaura exclusões e produz relatórios. Ele não precisa de vigilância sobre servidores; precisa distribuir atenção e reduzir risco operacional.

### Editor ou analista

É quem trata demandas no cotidiano. Ao entrar, precisa identificar rapidamente sua carteira e a próxima providência. Durante o trabalho, localiza processo, registra andamento, altera status, ajusta prazo, reatribui e consulta o histórico. Se cada registro exigir muitos cliques ou campos sem valor imediato, a equipe voltará à planilha, ao bloco de notas ou à memória pessoal.

### Leitor ou consulente

Precisa encontrar processo e compreender situação, responsabilidade, prazo e histórico, sem risco de alterar dados. Pode produzir relatórios permitidos e compartilhar o link interno de uma demanda.

### Responsável pelo produto

Precisa confiar que uma evolução técnica dialoga com o problema real, preserva decisões anteriores, não cria complexidade sem retorno e não transforma lacunas de dados em conclusões falsas. A qualidade é medida pela utilidade no trabalho e pela coerência do produto, não apenas pela aprovação da CI.

## 3.6 Dores que justificam o sistema

1. Informação espalhada entre planilhas, memória, e-mails e sistemas de tramitação.
2. Dificuldade de localizar rapidamente uma demanda quando alguém informa apenas o número, parte do assunto, servidor, setor ou comentário anterior.
3. Falta de resposta imediata para “o que está comigo?” e “o que preciso fazer hoje?”.
4. Prazos percebidos tarde, quando a situação já se tornou crítica.
5. Status que informa uma etapa, mas não deixa clara a próxima ação.
6. Responsáveis registrados por nomes livres, com grafias e abreviações diferentes.
7. Histórico restrito a mudanças de status, deixando edições e reatribuições invisíveis.
8. Relatórios que exigiriam filtrar, copiar, reorganizar e formatar dados manualmente.
9. Indicadores que parecem precisos, mas se apoiam em campos pouco preenchidos.
10. Risco de o sistema virar apenas mais um lugar para alimentar, sem substituir controles paralelos.

## 3.7 Trabalhos que o usuário “contrata” o produto para fazer

O agente deve avaliar cada funcionalidade pelos trabalhos abaixo:

- **Orientar:** dizer ao usuário onde começar e o que exige atenção.
- **Encontrar:** localizar processo em segundos com a informação disponível.
- **Compreender:** mostrar situação, responsabilidade, prazo, próxima ação e trajetória sem reconstrução mental.
- **Agir:** registrar andamento ou transição com pouco atrito e sem perder contexto.
- **Prevenir:** sinalizar problemas antes do vencimento.
- **Coordenar:** tornar explícitos responsáveis, esperas, transferências e retornos.
- **Lembrar:** conservar memória institucional quando pessoas mudam ou esquecem detalhes.
- **Informar:** produzir relatórios confiáveis sem refazer planilhas.
- **Decidir:** permitir ao gestor distribuir atenção e sanear a base.
- **Confiar:** distinguir fato registrado, dado incompleto e inferência analítica.

Uma função que não melhora pelo menos um desses trabalhos deve ter sua necessidade reavaliada.

## 3.8 Modelo mental correto

O produto reúne quatro objetos mentais complementares:

1. **Carteira:** conjunto de demandas da equipe e de cada usuário.
2. **Agenda:** prazos, próximas ações e datas de revisão.
3. **Prontuário:** dados atuais e linha do tempo de cada demanda.
4. **Central de informação:** busca, indicadores e relatórios.

Não tratar o sistema somente como tabela CRUD. A tabela é uma forma de consulta; a razão do produto é sustentar carteira, agenda, prontuário e informação no mesmo fluxo.

## 3.9 Como o trabalho acontece

### Cenário A — começo do dia

Uma editora entra no sistema. Ela não deveria precisar abrir a aba Demandas, ativar vários filtros e ordenar datas para descobrir o que fazer. A página inicial já deve mostrar sua carteira, atrasos, próximas ações e itens parados. Em menos de dez segundos, ela escolhe o primeiro processo.

### Cenário B — alguém pergunta por um processo

O usuário recebe um número sem pontuação, parte de um assunto ou referência a um comentário antigo. Usa Ctrl/Command+K, pesquisa e encontra o registro com explicação de onde ocorreu a correspondência. Abre o drawer, entende a situação e copia o link. Esse fluxo deve permanecer rápido; novas funções não podem degradar a busca.

### Cenário C — houve trabalho, mas o status não mudou

O analista consultou outro setor, complementou informação ou cobrou retorno. Ele registra Andamento, atualiza a próxima ação e sua data, sem escolher artificialmente um novo status. O sistema preserva o evento e a agenda futura.

### Cenário D — a demanda saiu do CTRH

O processo foi tramitado a outro setor. Isso não significa que desapareceu ou foi encerrado. A demanda entra em Aguardando retorno, conserva responsável interno pelo acompanhamento e recebe uma data para verificar resposta.

### Cenário E — relatório solicitado

O gestor precisa informar carteira, riscos ou movimentações de um período. Em vez de exportar uma base e construir manualmente um relatório, escolhe um modelo, confirma recorte e recebe Excel com resumo, base e rastreabilidade. O relatório deixa claro o que os dados permitem concluir.

### Cenário F — dado legado incompleto

Uma demanda antiga não possui prazo nem vínculo de responsável. O sistema não inventa, não chama de vencida e não bloqueia a consulta. Ele identifica a lacuna, leva o administrador à fila de saneamento e exige dados completos na próxima movimentação pertinente.

## 3.10 Princípios de produto que prevalecem sobre conveniência técnica

### Ação antes de contemplação

A tela inicial prioriza trabalho e risco. Gráficos vêm depois da fila de ação.

### Próxima ação antes de status isolado

Status sem próxima providência é insuficiente para coordenar trabalho.

### Menor atrito compatível com qualidade

Campos e confirmações existem quando evitam erro material ou criam informação útil. Não transformar toda movimentação em formulário longo.

### Contexto preservado

Abrir, editar, registrar andamento e voltar não pode apagar filtros, busca, rota ou escopo.

### Uma fonte de verdade

Excel é exportação. Preferências pessoais não viram base paralela. Dados operacionais permanecem no Supabase.

### Transparência sobre a qualidade

Mostrar cobertura e lacunas. Não preencher vazio com zero, não apresentar inferência como fato e não chamar volume de desempenho.

### Segurança proporcional

O sistema não precisa de governança corporativa complexa, mas autenticação não pode ser contornada e dados reais não podem ser entregues antes do login.

### Continuidade institucional

Histórico, autoria e responsáveis devem permitir que outra pessoa compreenda a demanda sem depender de conversa privada ou memória individual.

### Familiaridade

Usar “Processo”, “Responsável”, “Prazo interno”, “Prazo final”, “Próxima ação”, “Andamento”, “Tramitado” e “Encerrado”. Não impor jargão de tickets, sprints ou CRM.

## 3.11 Antipadrões de produto

Uma implementação está errada, mesmo com testes verdes, se:

- aumenta cliques sem aumentar qualidade da informação;
- obriga o usuário a alterar status apenas para registrar trabalho;
- esconde todas as demandas e mostra somente a mais antiga de cada alerta;
- considera Tramitado concluído;
- chama ausência de prazo de atraso;
- personaliza por comparação textual de nome;
- exibe gráficos antes do que precisa de ação;
- produz ranking que sugere desempenho individual;
- gera relatório bonito, mas com recorte diferente da tela;
- perde filtros ao abrir ou fechar uma demanda;
- exige saneamento manual repetitivo que poderia ser preparado com dry-run;
- cria centro de notificações mais trabalhoso que a própria demanda;
- adiciona arquitetura destinada a escala que o produto não possui;
- passa no teste técnico, mas faz o usuário manter uma planilha paralela.

## 3.12 Indicadores de sucesso do produto

Estes objetivos orientam homologação; não são usados para avaliar pessoas:

- usuário identifica sua primeira providência em até dez segundos após entrar;
- processo conhecido é localizado em até quinze segundos;
- andamento simples é registrado em até trinta segundos, sem trocar status;
- link de uma demanda é compartilhado em até dois cliques após abri-la;
- relatório predefinido é gerado em até dois minutos, sem formatação manual;
- cartão e lista filtrada sempre exibem a mesma quantidade;
- nenhuma demanda nova não encerrada fica sem próxima ação e data;
- nenhum dado real é recebido por usuário não autenticado;
- redução progressiva das categorias “não informado” e “não atribuído”;
- usuários deixam de depender de planilha operacional paralela para a rotina coberta.

## 3.13 Gate de consciência do produto para o Codex

Antes de implementar cada ciclo, o agente deve escrever no comentário do PR ou no relato de execução:

1. Qual pessoa usa esta entrega?
2. Que dificuldade concreta ela enfrenta hoje?
3. Como a entrega reduz tempo, ambiguidade, risco ou retrabalho?
4. Qual comportamento existente não pode ser prejudicado?
5. Como será comprovado o ganho além de “testes passaram”?

Depois da implementação, deve responder:

1. O fluxo ficou mais curto ou mais claro?
2. O usuário entende o que fazer em seguida?
3. O contexto de navegação foi preservado?
4. O resultado usa dados confiáveis e declara limitações?
5. Há risco de estimular controle paralelo?

Uma resposta genérica não satisfaz o gate. Ela deve citar a tela, o papel e o cenário afetados.

Correção técnica e correção de produto são gates independentes. CI verde, tipos corretos e ausência de erro de runtime não compensam um fluxo que aumente atrito, distorça o significado do trabalho ou deixe o usuário sem saber a próxima ação. A homologação de produto reprova o ciclo nesses casos.

O agente não deve completar lacunas recorrendo automaticamente a padrões genéricos de help desk, CRM, Kanban ou painel administrativo. Quando este documento não definir um detalhe, a escolha deve ser derivada do trabalho do CTRH descrito nas seções 3.3 a 3.12, documentada no PR e limitada à menor decisão reversível. Se duas escolhas plausíveis produzirem comportamentos substancialmente diferentes para o usuário, aplica-se a condição de parada e o responsável pelo produto deve decidir.

---

# 4. ESCOPO, PRIORIDADE E ORDEM DE ENTREGA

## 4.1 Ciclos obrigatórios

| Ordem | Ciclo | Produto independente | Dependência |
|---:|---|---|---|
| 0 | Linha de base e decisões | ADRs, evidências e gate de interpretação | nenhuma |
| 1 | Proteção do bundle | produção sem dados reais embutidos | ciclo 0 |
| 2 | Semântica e filtros | regra única de carteira e filtros tipados | ciclo 1 |
| 3 | Expansão do modelo de dados | schema aditivo e leitura compatível | ciclo 2 |
| 4 | Mutações e auditoria | RPCs, eventos, autoria e exclusão lógica | ciclo 3 |
| 5 | Responsabilidade por login | vínculo de perfil, diretório e “Minhas” | ciclo 4 |
| 6 | Prazos e qualidade de dados | aplicabilidade, próxima ação e saneamento | ciclo 5 |
| 7 | Andamentos e prontuário | experiência completa da linha do tempo | ciclo 6 |
| 8 | Meu trabalho e alertas | início personalizado e fila preventiva | ciclo 7 |
| 9 | Central de Relatórios | sete modelos Excel | ciclos 6 a 8 |
| 10 | Painel gerencial | estoque, fluxo, risco e cobertura | ciclos 7 a 9 |
| 11 | Visões e preferências | personalização persistida | ciclos 5 e 8 |
| 12 | Acesso e login | recuperação de senha e simplificação | ciclo 1 |
| 13 | Contrato, homologação e produção | revogações, documentação e encerramento | todos |

## 4.2 Regra de publicação

Cada ciclo produz branch, commits, PR e Preview próprios. O ciclo seguinte pode começar somente depois de o anterior estar mesclado ou depois de o responsável autorizar explicitamente uma cadeia de branches dependentes. O agente não deve abrir um único PR com todos os ciclos.

---

# 5. DECISÕES FUNCIONAIS FIXADAS

## 5.1 Semântica dos status

**DECISÃO FIXADA:** o sistema manterá os seis status existentes. Em vez de chamar todo registro não encerrado de “ativo”, criará categorias operacionais derivadas.

| Status | Categoria operacional | Exige ação CTRH agora? | Conta como em acompanhamento? | Comportamento |
|---|---|---:|---:|---|
| Aguardando Andamento | Providência CTRH | sim | sim | Deve possuir próxima ação e data. |
| Ajustar | Providência CTRH | sim | sim | Deve possuir correção descrita, próxima ação e data. |
| Para Assinatura | Providência CTRH | sim | sim | Deve possuir próxima ação; alerta específico após três dias. |
| Tramitado | Aguardando retorno externo | não | sim | Não é encerrado; requer data de acompanhamento. |
| Sobrestado | Monitoramento | não | sim | Requer motivo no histórico e data de revisão. |
| Encerrado | Encerrada | não | não | Próxima ação é removida; histórico permanece. |

Termos oficiais de interface:

- “Em acompanhamento”: todos, exceto Encerrado.
- “Com providência CTRH”: Aguardando Andamento, Ajustar e Para Assinatura.
- “Aguardando retorno”: Tramitado.
- “Sobrestadas”: Sobrestado.
- “Encerradas”: Encerrado.

O rótulo genérico “Demandas Ativas” deve ser substituído por “Em acompanhamento”. Relatórios poderão apresentar simultaneamente estoque em acompanhamento e subconjunto com providência CTRH.

## 5.2 Prazos

**DECISÃO FIXADA:** as colunas físicas limite1 e limite2 permanecem no banco para evitar renomeação de baixo valor. Toda interface e documentação utilizará:

- limite1: **Prazo interno** — data prevista para análise ou providência interna do CTRH;
- limite2: **Prazo final** — data-limite externa, legal, administrativa ou de entrega.

Cada prazo possuirá situação:

- definido — exige data;
- não informado — não possui data e permanece como pendência de qualidade;
- não se aplica — não possui data e exige justificativa com pelo menos dez caracteres.

Ausência de prazo nunca será classificada automaticamente como atraso.

## 5.3 Próxima ação

**DECISÃO FIXADA:** próxima ação não é sinônimo de prazo final. Toda demanda não encerrada criada ou movimentada após a ativação deverá possuir:

- descrição objetiva da próxima ação, com no mínimo cinco caracteres úteis;
- data de acompanhamento da próxima ação;
- responsável interno vinculado ou indicação explícita de não atribuição.

Para Tramitado, a próxima ação descreve a verificação de retorno. Para Sobrestado, descreve a condição ou revisão. Ao encerrar, a RPC limpa próxima ação e data.

Dados legados poderão permanecer temporariamente sem próxima ação, mas serão exibidos na fila de saneamento. Nenhuma alteração em registro legado poderá salvar silenciosamente a ausência: o formulário exigirá saneamento antes de concluir a edição ou mudança de status.

## 5.4 Responsabilidade

**DECISÃO FIXADA:** responsavel_id será a identidade operacional. O texto responsavel será mantido como snapshot e compatibilidade legada.

- Responsável interno: responsavel_id preenchido; o texto é atualizado pela RPC com o nome do perfil.
- Responsável externo: responsavel_id nulo; texto livre explícito.
- Não atribuído: responsavel_id nulo e texto vazio.
- “Minhas demandas”: compara responsavel_id com o id do usuário autenticado; nunca compara nomes.
- Migração: somente correspondência normalizada exata e unívoca pode ser sugerida; aplicação exige mapa aprovado.

## 5.5 Eventos de histórico

**DECISÃO FIXADA:** a linha do tempo usará os tipos abaixo.

| Tipo | Gatilho | Conteúdo mínimo |
|---|---|---|
| criacao | nova demanda | status, setor, autor e origem |
| andamento | comentário sem mudança de status | comentário, próxima ação e data quando alteradas |
| mudanca_status | status anterior diferente do novo | anterior, novo, comentário e próxima ação |
| edicao | alteração de metadados | lista antes/depois e justificativa |
| reatribuicao | alteração de responsável | responsável anterior e novo |
| alteracao_prazo | data, situação ou justificativa de prazo alterada | antes/depois por campo |
| exclusao | exclusão lógica | motivo obrigatório e autor |
| restauracao | retorno da lixeira | motivo e autor |

Todo evento deve exibir data/hora, autor ou “Autor não identificado”, setor, tipo, status resultante e descrição. Dados antigos sem autoria permanecem identificados como legado; autoria não será inventada.

## 5.6 Alertas e priorização

**DECISÃO FIXADA:** os limiares iniciais ficam em src/config/workRules.ts e não terão tela administrativa nesta versão.

~~~ts
export const WORK_RULES = {
  urgentWindowDays: 3,
  attentionWindowDays: 15,
  actionableIdleDays: 7,
  externalWaitingReviewDays: 15,
  signatureIdleDays: 3,
} as const;
~~~

Prioridade, na ordem:

1. Crítico: prazo final ou próxima ação vencidos.
2. Urgente: vence hoje ou em até três dias.
3. Atenção: vence entre quatro e quinze dias.
4. Assinatura: Para Assinatura sem evento há três dias ou mais.
5. Parada: categoria Providência CTRH sem evento há sete dias ou mais.
6. Aguardando retorno: Tramitado sem evento há quinze dias ou mais.
7. Cadastro incompleto: sem responsável, prazo não informado ou próxima ação ausente.

Uma demanda pode gerar vários sinais, mas aparece uma única vez na fila principal, com a severidade mais alta e chips adicionais. Ordenação: severidade; data mais antiga; maior tempo parado; número do processo.

## 5.7 Métricas

**DECISÃO FIXADA:** “ranking de responsáveis” será renomeado para “distribuição da carteira por responsável”. Volume não é produtividade.

- Estoque em acompanhamento: status diferente de Encerrado.
- Providência CTRH: categoria operacional de ação.
- Aguardando retorno: Tramitado.
- Entradas do período: created_at dentro do intervalo.
- Encerramentos: primeiro evento de mudança para Encerrado no período.
- Reaberturas: evento de Encerrado para outro status no período.
- Estoque inicial: aberto no início do período.
- Estoque final: aberto no fim do período.
- Tempo no status: desde o último evento de mudança de status.
- Tempo médio de atendimento: somente demandas de origem sistema, criadas e encerradas após o go-live do novo histórico.
- Cobertura de prazo: proporção com prazo definido ou marcado não se aplica.
- Cobertura de responsabilidade: proporção com responsavel_id ou responsável externo explícito.
- Cobertura de histórico: proporção com evento além da criação.

Métrica sem cobertura suficiente deve exibir a limitação e não receber aparência de conclusão definitiva.

---

# 6. EXPERIÊNCIA-ALVO POR PAPEL

## 6.1 Administrador

Página inicial padrão: visão da equipe com alternância “Equipe” e “Minha carteira”. Deve mostrar estoque, providências, riscos, sem responsável, sem próxima ação e fila de saneamento. Administração inclui perfis, qualidade de dados e lixeira.

## 6.2 Editor

Página inicial padrão: “Meu trabalho”. Deve mostrar carteira própria, próximas ações, atrasos, assinaturas, itens parados e acesso ao registro de andamento. Pode alternar para visão da equipe, mas sem ações administrativas.

## 6.3 Leitor

Página inicial padrão: consulta. Pode pesquisar, abrir detalhes, copiar link, usar filtros permitidos e exportar relatórios. Não visualiza controles de mutação.

## 6.4 Rotas-alvo

| Rota | Finalidade | Acesso |
|---|---|---|
| / | início personalizado | todos autenticados |
| /demandas | busca, filtros e listagem | todos autenticados |
| /demandas/:id | drawer profundo e link compartilhável | todos autenticados |
| /relatorios | Central de Relatórios | todos autenticados; modelos conforme papel |
| /admin | perfis e parâmetros informativos | administrador |
| /admin/qualidade-dados | fila de saneamento | administrador |
| /admin/lixeira | exclusões recuperáveis | administrador |
| /redefinir-senha | definição de nova senha por link | sessão de recuperação |

## 6.5 Hierarquia da página “Meu trabalho”

1. Saudação curta com nome do perfil e escopo atual.
2. Cartões: Comigo em acompanhamento; Com providência; Atrasadas; Próximos sete dias.
3. Fila prioritária completa, mostrando até dez e link “Ver todas”.
4. Próximas ações em ordem cronológica.
5. Visões rápidas: Minhas, Vencidas, Próximas, Para assinatura, Paradas.
6. Últimas movimentações relevantes do usuário.

O painel não deve obrigar o usuário a ler gráficos antes de ver o trabalho que exige ação.

---

# 7. ARQUITETURA-ALVO E MAPA DE ARQUIVOS

## 7.1 Princípio arquitetural

Regras de status, prioridade, filtro e métrica serão funções puras fora dos componentes. Componentes apresentam dados; App.tsx orquestra rotas e diálogos; serviços encapsulam Supabase; RPCs concentram mutações auditáveis. Não será criado gerenciador global de estado.

## 7.2 Novos módulos previstos

| Caminho | Responsabilidade única |
|---|---|
| AGENTS.md | instruções persistentes para qualquer agente que trabalhe no repositório |
| docs/PRODUCT_CONTEXT.md | contexto do produto, pessoas, dores, cenários, vocabulário e princípios |
| docs/execution/Plano_Mestre_Execucao_CTRH_v1.0.md | cópia integral e versionada deste plano |
| src/domain/workSemantics.ts | categorias operacionais e predicados de status |
| src/domain/workSemantics.test.ts | contrato semântico dos seis status |
| src/config/workRules.ts | limiares explícitos de alerta |
| src/filters/filterTypes.ts | estado tipado de filtros |
| src/filters/filterUrl.ts | parse e serialização da URL |
| src/filters/applyDemandFilters.ts | aplicação pura do recorte |
| src/work/workTypes.ts | sinais, severidades e fila |
| src/work/priorityEngine.ts | cálculo determinístico de alertas |
| src/work/workMetrics.ts | indicadores pessoais e gerenciais |
| src/components/MeuTrabalho.tsx | início personalizado |
| src/components/WorkAlertList.tsx | fila preventiva acessível |
| src/components/ResponsavelField.tsx | responsável interno, externo ou vazio |
| src/components/DeadlineApplicabilityField.tsx | situação, data e justificativa de prazo |
| src/components/ModalAndamento.tsx | andamento sem mudança de status |
| src/components/DataQualityPanel.tsx | fila de saneamento |
| src/components/DeletedDemandasPanel.tsx | lixeira e restauração |
| src/components/ReportsCenter.tsx | seleção de modelo e parâmetros |
| src/export/reportTypes.ts | contratos dos relatórios |
| src/export/reportCatalog.ts | sete modelos e regras de disponibilidade |
| src/export/workbookStyles.ts | tokens do Excel já existente |
| src/export/buildReportWorkbook.ts | composição do workbook por modelo |
| src/export/sheets/*.ts | abas especializadas |
| src/analytics/operationalMetrics.ts | estoque, fluxo, risco e cobertura |
| src/preferences/preferencesService.ts | contrato de preferências e visões |
| src/hooks/useUserPreferences.ts | carregamento e atualização por login |
| src/components/PasswordRecoveryPanel.tsx | solicitação e redefinição de senha |
| scripts/check-public-bundle.mjs | prova de ausência de dados reais no dist |
| scripts/migration/prepare-responsibility-map.mjs | mapa de responsáveis com dry-run |
| scripts/migration/prepare-data-quality.mjs | planilha de saneamento sem inferência |

## 7.3 Arquivos existentes a preservar e evoluir

App.tsx permanece como composição, mas filtragem e semântica serão extraídas. excelAnalytics.ts e exportDemandasExcel.ts permanecem como adaptadores compatíveis até a Central de Relatórios estar aprovada. DemandasTable não receberá regras de negócio. Os modais existentes conservarão padrões AppDialog, ConfirmDialog, FormError e React Hook Form/Zod.

---

# 8. MODELO DE DADOS-ALVO

## 8.1 Campos aditivos em sme_demandas

| Campo | Tipo | Regra |
|---|---|---|
| responsavel_id | uuid nulo | FK perfis_usuarios(id), on delete set null |
| proxima_acao | text nulo na transição | obrigatório para novos/movimentados não encerrados |
| proxima_acao_em | date nulo na transição | obrigatório para novos/movimentados não encerrados |
| limite1_situacao | text | definido, nao_informado, nao_se_aplica |
| limite1_justificativa | text nulo | obrigatória quando não se aplica |
| limite2_situacao | text | definido, nao_informado, nao_se_aplica |
| limite2_justificativa | text nulo | obrigatória quando não se aplica |
| link_origem | text nulo | somente URL HTTPS; botão aparece se preenchido |
| origem | text | legado ou sistema |
| deleted_at | timestamptz nulo | exclusão lógica |
| deleted_by | uuid nulo | FK auth.users(id) |
| deletion_reason | text nulo | mínimo dez caracteres quando excluído |

O texto responsavel existente não será removido. A fonte autoritativa para “Minhas” será responsavel_id. created_at, updated_at, created_by e updated_by devem entrar no objeto de domínio e nas consultas.

## 8.2 Campos aditivos em sme_historico

| Campo | Tipo | Regra |
|---|---|---|
| tipo_evento | text | enum lógico da seção 5.5 |
| status_anterior | text nulo | preenchido em mudança de status |
| alteracoes | jsonb | array de {campo, anterior, novo}; padrão [] |

created_by e created_at existentes permanecem. O frontend deverá obter nome do autor por diretório mínimo de perfis; não deve expor e-mail ou nível desnecessariamente.

## 8.3 Preferências e visões

Tabela preferencias_usuario:

- user_id uuid primary key references auth.users(id) on delete cascade;
- pagina_inicial text: meu_trabalho, visao_geral ou demandas;
- escopo_padrao text: meu ou equipe;
- tamanho_pagina integer: 10, 25 ou 50;
- updated_at timestamptz.

Tabela visoes_salvas:

- id uuid primary key default gen_random_uuid();
- user_id uuid references auth.users(id) on delete cascade;
- nome text entre 1 e 60 caracteres;
- filtros jsonb validado pelo frontend e limitado às chaves conhecidas;
- padrao boolean;
- created_at e updated_at timestamptz;
- unique(user_id, lower(nome)).

RLS: cada usuário consulta e altera somente seus registros. Administrador não precisa consultar preferências alheias.

## 8.4 Índices mínimos

~~~sql
create index if not exists sme_demandas_responsavel_abertas_idx
  on public.sme_demandas (responsavel_id)
  where deleted_at is null and status <> 'Encerrado';

create index if not exists sme_demandas_proxima_acao_idx
  on public.sme_demandas (proxima_acao_em)
  where deleted_at is null and status <> 'Encerrado';

create index if not exists sme_demandas_status_visivel_idx
  on public.sme_demandas (status)
  where deleted_at is null;

create index if not exists sme_historico_demanda_data_idx
  on public.sme_historico (demanda_id, created_at desc);
~~~

## 8.5 Estratégia expandir e contrair

1. Migration de expansão adiciona campos, índices, tipos de evento e novas RPCs; não remove APIs antigas.
2. Frontend atual continua funcionando.
3. Novo frontend é publicado e homologado usando as novas APIs.
4. Dados legados são saneados.
5. Migration de contrato revoga update/delete diretos e execução das RPCs antigas.
6. Nenhuma etapa deve inverter essa ordem.

---

# 9. CONTRATOS TYPESCRIPT-ALVO

Os tipos de Demanda, ComentarioHistorico, PerfilUsuario e UserDirectoryEntry permanecerão em src/types.ts durante este plano. Tipos exclusivos de filtros, alertas, métricas, relatórios e preferências ficarão nos módulos específicos indicados na seção 7. Não criar uma refatoração paralela de tipos.

~~~ts
export type DemandStatus =
  | 'Aguardando Andamento'
  | 'Tramitado'
  | 'Para Assinatura'
  | 'Encerrado'
  | 'Sobrestado'
  | 'Ajustar';

export type WorkBucket =
  | 'providencia_ctrh'
  | 'aguardando_retorno'
  | 'monitoramento'
  | 'encerrada';

export type DeadlineState = 'definido' | 'nao_informado' | 'nao_se_aplica';
export type DemandOrigin = 'legado' | 'sistema';

export interface DeadlineValue {
  date: string;
  state: DeadlineState;
  justification: string;
}

export interface Demanda {
  id: number;
  numero: string;
  tipo: 'Expediente' | 'Processo' | 'Outros';
  assunto: string;
  responsavel: string;
  responsavelId: string | null;
  limite1: string;
  limite1Situacao: DeadlineState;
  limite1Justificativa: string;
  limite2: string;
  limite2Situacao: DeadlineState;
  limite2Justificativa: string;
  proximaAcao: string;
  proximaAcaoEm: string;
  linkOrigem: string;
  status: DemandStatus;
  setor: string;
  classificacao: string;
  origem: DemandOrigin;
  createdAt: string;
  updatedAt: string;
}

export type HistoryEventType =
  | 'criacao'
  | 'andamento'
  | 'mudanca_status'
  | 'edicao'
  | 'reatribuicao'
  | 'alteracao_prazo'
  | 'exclusao'
  | 'restauracao';

export interface FieldChange {
  field: string;
  before: string | null;
  after: string | null;
}

export interface ComentarioHistorico {
  id: number;
  demandaId: number;
  data_hora: string;
  tipoEvento: HistoryEventType;
  status_anterior: DemandStatus | '';
  status_novo: DemandStatus;
  setor: string;
  comentario: string;
  autorId: string | null;
  autorNome: string;
  alteracoes: FieldChange[];
}
~~~

Contratos de mutação:

~~~ts
export interface DemandasRepository {
  load(): Promise<AppData>;
  listDeleted(): Promise<Demanda[]>;
  create(input: CreateDemandaInput): Promise<void>;
  edit(id: number, input: EditDemandaInput): Promise<void>;
  recordProgress(id: number, input: ProgressInput): Promise<void>;
  transitionStatus(id: number, input: StatusTransitionInput): Promise<void>;
  softDelete(id: number, reason: string): Promise<void>;
  restore(id: number, reason: string): Promise<void>;
  subscribe(onRemoteChange: () => void): () => void;
}
~~~

Nenhum método genérico update(id, Partial<Demanda>) permanecerá no contrato final, porque permite alteração sem justificar o conjunto de campos.

AppData conterá demandas, historico e directory: UserDirectoryEntry[]. O load remoto consultará demandas visíveis, histórico visível e listar_perfis_minimos em Promise.all; em seguida, preencherá autorNome no mapper. ProfilesService manterá list para administração e acrescentará listDirectory para seletores. listDeleted falhará para não administrador por regra da RPC/RLS, não apenas por ocultação da rota.

---

# 10. PLANO DETALHADO DE IMPLEMENTAÇÃO

As tarefas seguintes são unidades de revisão. Cada uma termina com software executável e testável.

## CICLO 0 — LINHA DE BASE E DECISÕES

### Objetivo

Confirmar o estado real e registrar as decisões fixadas antes de tocar no comportamento.

### Arquivos

- Criar: AGENTS.md
- Criar: docs/PRODUCT_CONTEXT.md
- Criar: docs/execution/Plano_Mestre_Execucao_CTRH_v1.0.md como cópia integral deste documento
- Criar: docs/superpowers/specs/2026-07-22-central-trabalho-ctrh-design.md
- Criar: docs/adr/ADR-001-semantica-status-carteira.md
- Criar: docs/adr/ADR-002-prazos-proxima-acao.md
- Criar: docs/adr/ADR-003-historico-e-exclusao-logica.md
- Atualizar: docs/HANDOFF.md

### Passos obrigatórios

- [ ] Obter a main remota atual e registrar SHA. A auditoria observou ca9c783b; diferença não é erro, mas exige reconciliação.
- [ ] Confirmar que o worktree não possui alterações do usuário antes de criar branch.
- [ ] Criar branch docs/central-trabalho-gate-0.
- [ ] Executar npm ci e npm run check:full.
- [ ] Repetir consultas somente de leitura de contagem, prazos, responsáveis e histórico.
- [ ] Comparar o resultado com a seção 3 e explicar divergências.
- [ ] Copiar este plano sem resumir para docs/execution/Plano_Mestre_Execucao_CTRH_v1.0.md; conferir hash ou diff de conteúdo.
- [ ] Transformar as seções 2, 3.3 a 3.13, 5 e 6 em docs/PRODUCT_CONTEXT.md, preservando decisões e exemplos concretos, sem inserir dados reais de demandas.
- [ ] Criar AGENTS.md na raiz exigindo a leitura de docs/PRODUCT_CONTEXT.md, deste plano e dos ADRs aplicáveis antes de alterar código.
- [ ] Registrar em AGENTS.md os comandos de validação, a ordem dos ciclos, as proibições da seção 1.2, o gate de produto da seção 3.13 e a regra de uma branch/PR por ciclo.
- [ ] Manter AGENTS.md curto e operacional: apontar para a fonte detalhada em vez de duplicar o plano inteiro.
- [ ] Verificar que todos os caminhos citados em AGENTS.md existem e que nenhum dos três documentos contém segredo, credencial, nome de pessoa real ou registro operacional.
- [ ] Registrar nos ADRs exatamente as decisões da seção 5.
- [ ] Não implementar código funcional neste ciclo.
- [ ] Criar commit docs: registrar semantica da central de trabalho.

### Critério de aceite

AGENTS.md torna o contexto obrigatório para futuras sessões; docs/PRODUCT_CONTEXT.md permite compreender o produto sem depender do histórico do chat; a cópia versionada deste plano é integral; e os três ADRs não contêm “a definir”, “talvez” ou alternativas abertas. Se o comando do usuário foi “execute este plano”, as decisões fixadas já estão aprovadas. Se o usuário pedir apenas análise, o agente entrega essa documentação e para.

### Condição de parada

Se a main atual tiver alteração substancial nos mesmos arquivos mapeados neste plano, o executor deve produzir uma matriz “plano versus código atual” e solicitar reconciliação antes do ciclo 1.

## CICLO 1 — RETIRAR DADOS REAIS DO BUNDLE PÚBLICO

### Objetivo

Garantir que nenhum build cliente contenha as demandas reais usadas no modo local e impedir modo local em produção.

### Arquivos

- Mover: src/data/initialDemandas.ts para scripts/bootstrap/initial-demandas.json
- Criar: src/data/demoDemandas.ts
- Criar: scripts/check-public-bundle.mjs
- Modificar: src/services/createAppServices.ts
- Modificar: src/config/appConfig.ts
- Modificar: scripts/bootstrap-supabase.mjs
- Modificar: scripts/bootstrap-supabase.test.ts
- Modificar: src/services/localDemandasRepository.test.ts
- Modificar: src/App.local.test.tsx
- Modificar: src/config/appConfig.test.ts
- Modificar: package.json
- Modificar: docs/SUPABASE_SETUP.md

### Interface de demonstração

demoDemandas.ts conterá entre seis e oito registros totalmente fictícios. Números usarão prefixo DEMO, assuntos genéricos e nomes “Usuário Demonstração A/B”. Nenhum texto será copiado da base real.

### Testes RED

~~~ts
it('bloqueia modo local quando PROD é verdadeiro', () => {
  expect(resolveAppConfig({ PROD: true, VITE_APP_MODE: 'local' })).toEqual({
    mode: 'invalid',
    message: 'O modo local não está disponível em produção.',
  });
});

it('não importa o acervo real no grafo do cliente', async () => {
  const source = await readFile('src/services/createAppServices.ts', 'utf8');
  expect(source).not.toContain('initialDemandas');
});
~~~

### Implementação obrigatória

- [ ] Escrever os testes acima e confirmar falha.
- [ ] Mover o acervo para diretório alcançável apenas por scripts Node.
- [ ] Alterar bootstrap para JSON explícito; validar schema antes de importar.
- [ ] Criar demoDemandas sintético e atualizar modo local.
- [ ] Em resolveAppConfig, retornar invalid para local em produção antes de qualquer fallback.
- [ ] Manter desenvolvimento sem variáveis no modo local sintético.
- [ ] Criar check-public-bundle.mjs que lê os números do JSON administrativo e falha se algum deles aparecer em dist/assets.
- [ ] Acrescentar npm run check:public-bundle ao gate check depois do build.
- [ ] Executar build e provar que o script aprova.
- [ ] Procurar no dist termos canários e confirmar ausência.
- [ ] Executar gate integral.
- [ ] Criar commit fix: remover dados reais do bundle publico.

### Critérios de aceite

1. Login não autenticado baixa somente dados sintéticos ou nenhum dado operacional.
2. Production nunca resolve para local.
3. Bootstrap administrativo continua funcional fora do Vite.
4. Testes locais não dependem de dados reais.
5. Nenhum dado de produção é alterado.

### Rollback

Reverter o frontend não é aceitável se restaurar exposição. Em falha de bootstrap, corrigir o script mantendo o acervo fora de src. Não republicar initialDemandas no grafo cliente.

### Gate externo adiado

Não apagar deployments antigos neste ciclo. Apenas inventariar quais versões ainda servem o bundle vulnerável; a eliminação fica no ciclo 13 e exige autorização destrutiva específica.

## CICLO 2 — SEMÂNTICA ÚNICA E FILTROS TIPADOS

### Objetivo

Eliminar comparações dispersas status !== Encerrado e preparar filtros pessoais sem mudar ainda o banco.

### Arquivos

- Criar: src/domain/workSemantics.ts
- Criar: src/domain/workSemantics.test.ts
- Criar: src/filters/filterTypes.ts
- Criar: src/filters/filterUrl.ts
- Criar: src/filters/filterUrl.test.ts
- Criar: src/filters/applyDemandFilters.ts
- Criar: src/filters/applyDemandFilters.test.ts
- Modificar: src/App.tsx
- Modificar: src/components/Header.tsx
- Modificar: src/components/FilterPanel.tsx
- Modificar: src/export/excelAnalytics.ts
- Modificar: testes correlatos

### Interfaces exatas

~~~ts
export function getWorkBucket(status: DemandStatus): WorkBucket;
export function isInFollowUp(demanda: Pick<Demanda, 'status'>): boolean;
export function needsCtrhAction(demanda: Pick<Demanda, 'status'>): boolean;
export function isClosed(demanda: Pick<Demanda, 'status'>): boolean;

export interface DemandFilters {
  query: string;
  type: 'Todos' | Demanda['tipo'];
  classification: string;
  status: 'acompanhamento' | 'providencia_ctrh' | 'todos' | DemandStatus;
  sector: string;
  responsibleId: string | 'todos' | 'sem_responsavel';
  scope: 'equipe' | 'meu';
  periodField: 'limite1' | 'limite2' | 'historico' | 'proxima_acao';
  periodStart: string;
  periodEnd: string;
  alert: string;
}
~~~

### Testes mínimos

- Cada um dos seis status retorna exatamente a categoria da seção 5.1.
- “Em acompanhamento” inclui Tramitado e Sobrestado e exclui Encerrado.
- “Providência CTRH” inclui apenas três status.
- URL antiga com status “Somente ativos (padrão)” migra para acompanhamento.
- Parâmetro desconhecido é ignorado, não executado.
- Serialize(parse(url)) preserva filtros conhecidos.
- O recorte atual de busca permanece idêntico antes e depois da extração.

### Passos

- [ ] Criar testes RED de semântica.
- [ ] Implementar funções puras sem React.
- [ ] Substituir comparações dispersas nos indicadores e Excel.
- [ ] Criar modelo tipado de filtros e adaptador de URL.
- [ ] Preservar parâmetros antigos por uma versão de compatibilidade.
- [ ] Extrair o filtro-base de App.tsx para função pura.
- [ ] Renomear somente o cartão “Demandas Ativas” para “Em acompanhamento”.
- [ ] Confirmar que busca aproximada, recentes, período e exportação não mudaram.
- [ ] Executar gate integral.
- [ ] Commit refactor: centralizar semantica e filtros de demandas.

### Critério de aceite

Nenhum componente define por conta própria se uma demanda está ativa, acionável ou encerrada. rg por status !== 'Encerrado' deve retornar somente testes de caracterização ou código explicitamente justificado.

## CICLO 3 — EXPANSÃO ADITIVA DO MODELO DE DADOS

### Objetivo

Adicionar os campos necessários sem quebrar o frontend em produção e fazer o domínio ler valores legados de forma segura.

### Arquivos

- Criar: supabase/migrations/20260722090000_central_trabalho_expand.sql
- Modificar: supabase/migrations/migration.test.ts
- Modificar: src/lib/database.types.ts
- Modificar: src/types.ts
- Modificar: src/services/dataMappers.ts
- Modificar: src/services/dataMappers.test.ts
- Modificar: src/services/supabaseDemandasRepository.ts
- Modificar: src/services/supabaseDemandasRepository.test.ts
- Modificar: src/services/localDemandasRepository.ts
- Modificar: fixtures sintéticas e testes locais
- Atualizar: docs/SUPABASE_SETUP.md

### Conteúdo obrigatório da migration

1. Adicionar as colunas da seção 8.1.
2. Adicionar tipo_evento, status_anterior e alteracoes ao histórico.
3. Preencher origem = legado para registros existentes e alterar o default para sistema.
4. Preencher situação de prazo como definido quando a data existir e nao_informado quando for nula.
5. Identificar o primeiro histórico de cada demanda como criacao; os demais registros antigos ficam mudanca_status, sem inventar status anterior.
6. Criar checks de domínio para situações, origem e exclusão lógica.
7. Criar índices da seção 8.4.
8. Não revogar APIs, grants ou funções antigas.

### Checks SQL

~~~sql
alter table public.sme_demandas
  add constraint sme_demandas_limite1_consistencia_check check (
    (limite1_situacao = 'definido' and limite1 is not null and limite1_justificativa is null)
    or (limite1_situacao = 'nao_informado' and limite1 is null and limite1_justificativa is null)
    or (limite1_situacao = 'nao_se_aplica' and limite1 is null
        and length(btrim(coalesce(limite1_justificativa, ''))) >= 10)
  ) not valid;

alter table public.sme_demandas
  add constraint sme_demandas_limite2_consistencia_check check (
    (limite2_situacao = 'definido' and limite2 is not null and limite2_justificativa is null)
    or (limite2_situacao = 'nao_informado' and limite2 is null and limite2_justificativa is null)
    or (limite2_situacao = 'nao_se_aplica' and limite2 is null
        and length(btrim(coalesce(limite2_justificativa, ''))) >= 10)
  ) not valid;
~~~

Os nomes SQL deste documento são vinculantes e já estão em snake_case. Checks NOT VALID são usados para expansão; novos dados já são validados e a validação retroativa ocorre no ciclo 13.

### Defaults de mapper para compatibilidade

Quando uma resposta mockada ou fixture antiga não trouxer os novos campos:

- responsavelId = null;
- situação do prazo = definido se houver data válida, senão nao_informado;
- justificativas, próxima ação e link = string vazia;
- origem = legado;
- createdAt e updatedAt = string vazia somente em fixture; produção deve retorná-los.

### Testes RED mínimos

- Migration contém as novas colunas, checks e índices.
- Migration não executa drop table, truncate nem delete.
- Migration não revoga as funções atuais.
- Mapper converte datas e novos campos.
- Mapper aceita linha legada sem novos campos em teste de compatibilidade.
- Repositório seleciona created_at e updated_at.
- Registros deleted_at não aparecem no load operacional.

### Passos

- [ ] Fazer snapshot seguro de schema e dados antes de qualquer aplicação externa.
- [ ] Escrever testes estáticos da migration.
- [ ] Escrever testes RED dos mappers e repositórios.
- [ ] Criar migration somente aditiva.
- [ ] Atualizar manualmente src/lib/database.types.ts, seguindo o padrão atual do repositório, e cobrir a atualização por teste.
- [ ] Atualizar objeto de domínio sem alterar a interface visual.
- [ ] Atualizar modo local sintético.
- [ ] Executar migration em banco local ou ambiente de homologação e repetir.
- [ ] Rodar consultas de invariantes: mesma quantidade de demandas, mesmo número de históricos, nenhum órfão e nenhum número duplicado.
- [ ] Aplicar em produção somente após backup confirmado e aprovação do Preview compatível.
- [ ] Executar smoke de leitura com versão antiga e nova.
- [ ] Commit feat: expandir modelo da central de trabalho.

### Consultas de invariantes

~~~sql
select count(*) from public.sme_demandas;
select count(*) from public.sme_historico;
select numero, count(*) from public.sme_demandas group by numero having count(*) > 1;
select h.id from public.sme_historico h
left join public.sme_demandas d on d.id = h.demanda_id
where d.id is null;
select limite1_situacao, count(*) from public.sme_demandas group by limite1_situacao;
select limite2_situacao, count(*) from public.sme_demandas group by limite2_situacao;
~~~

### Critério de aceite

Contagens e relações permanecem íntegras; o frontend atual continua lendo; o frontend novo recebe todos os campos; nenhuma mutação funcional ainda depende dos campos novos.

### Rollback

Como a migration é aditiva, o rollback operacional preferencial é manter colunas não utilizadas e reverter o frontend. Não apagar colunas de produção durante incidente. Um rollback destrutivo somente pode ocorrer a partir de backup e autorização específica.

## CICLO 4 — MUTAÇÕES TRANSACIONAIS, AUTORIA E EXCLUSÃO LÓGICA

### Objetivo

Garantir que toda criação, edição, andamento, transição, exclusão e restauração passe por RPC auditável.

### Arquivos

- Criar: supabase/migrations/20260722100000_central_trabalho_mutations.sql
- Modificar: supabase/migrations/migration.test.ts
- Modificar: src/services/contracts.ts
- Modificar: src/services/supabaseDemandasRepository.ts
- Modificar: src/services/localDemandasRepository.ts
- Modificar: testes dos repositórios
- Modificar: src/hooks/useDemandasData.ts
- Modificar: src/App.tsx
- Criar: src/validation/demandMutationSchemas.ts
- Criar: testes de validação

### RPCs obrigatórias

| Função | Finalidade | Regra crítica |
|---|---|---|
| criar_sme_demanda_v2 | criar e registrar evento | origem sistema; próxima ação obrigatória se não encerrada |
| editar_sme_demanda | alterar metadados | justificativa; JSON antes/depois; sem status |
| registrar_andamento_sme_demanda | comentar sem trocar status | rejeita Encerrado; comentário, próxima ação e data obrigatórios e atualizados |
| transicionar_status_sme_demanda | trocar status | anterior diferente do novo; comentário; próxima ação conforme destino |
| excluir_sme_demanda | exclusão lógica | administrador; motivo mínimo; preserva histórico |
| restaurar_sme_demanda | restaurar | administrador; motivo mínimo; registra evento |
| listar_perfis_minimos | diretório de nomes e setores | somente usuário ativo; não expõe nível nem status desnecessário |

### Assinaturas do cliente

~~~ts
export interface CreateDemandaInput extends Omit<Demanda, 'id' | 'createdAt' | 'updatedAt' | 'origem'> {}

export interface EditDemandaInput {
  assunto: string;
  responsavelId: string | null;
  responsavel: string;
  limite1: string;
  limite1Situacao: DeadlineState;
  limite1Justificativa: string;
  limite2: string;
  limite2Situacao: DeadlineState;
  limite2Justificativa: string;
  setor: string;
  classificacao: string;
  linkOrigem: string;
  proximaAcao: string;
  proximaAcaoEm: string;
  justificativa: string;
}

export interface ProgressInput {
  comentario: string;
  proximaAcao: string;
  proximaAcaoEm: string;
}

export interface StatusTransitionInput extends ProgressInput {
  status: DemandStatus;
}
~~~

### Regras de segurança e transação

- Todas as funções são security definer com search_path vazio.
- Todas validam private.can_edit ou private.is_admin internamente.
- Todas usam auth.uid como autor; cliente não envia actor id.
- Edição bloqueia alteração de status.
- editar_sme_demanda grava exatamente um evento: reatribuicao quando somente o responsável muda; alteracao_prazo quando somente campos de prazo mudam; edicao quando há outra mudança ou combinação. alteracoes inclui todos os campos efetivamente modificados.
- Andamento em demanda Encerrada é bloqueado. Reabertura ocorre somente por transicionar_status_sme_demanda.
- Transição bloqueia status igual; a mensagem orienta “Registrar andamento”.
- Exclusão não executa DELETE.
- A restauração falha se o registro não estiver excluído.
- O diretório mínimo exige private.is_active.
- O JSON de alterações é produzido no banco a partir de valores reais antes/depois.
- Texto de justificativa é sanitizado por tamanho e vazio; HTML é tratado como texto no frontend.

### Testes mínimos da migration

1. Usuário leitor não consegue executar mutações.
2. Editor cria, edita, registra andamento e transiciona.
3. Editor não exclui nem restaura.
4. Administrador exclui e restaura.
5. Evento e demanda são atualizados na mesma transação.
6. Falha na inserção do histórico reverte a mutação.
7. created_by é auth.uid, independentemente do payload.
8. Exclusão mantém demanda e histórico.
9. Load normal exclui deleted_at; lixeira lista somente excluídas para admin.
10. Transição para Encerrado limpa próxima ação e data.
11. Transição para qualquer outro status exige próxima ação e data.

### Passos

- [ ] Escrever testes RED de contrato e migration.
- [ ] Criar funções SQL com validação explícita.
- [ ] Implementar contratos tipados no frontend.
- [ ] Alterar repositórios remoto e local.
- [ ] Atualizar hook para métodos nomeados; remover uso novo de update genérico.
- [ ] Manter métodos antigos apenas como compatibilidade interna temporária e marcá-los deprecated.
- [ ] Testar concorrência simples com duas edições e confirmar que updated_at reflete a última transação.
- [ ] Executar gate integral.
- [ ] Commit feat: registrar mutacoes auditaveis.

### Critério de aceite

Para cada mutação de teste, uma nova entrada de histórico identifica autor, tipo e conteúdo. Nenhuma exclusão elimina trilha. O frontend ainda não precisa expor toda a experiência; o contrato já está pronto.

## CICLO 5 — RESPONSÁVEL VINCULADO AO LOGIN E MINHAS DEMANDAS

### Objetivo

Substituir dependência de texto livre por identidade de perfil, preservando responsáveis externos e históricos.

### Arquivos

- Criar: src/components/ResponsavelField.tsx
- Criar: src/components/ResponsavelField.test.tsx
- Modificar: src/services/contracts.ts
- Modificar: src/services/supabaseProfilesService.ts
- Modificar: src/services/supabaseProfilesService.test.ts
- Modificar: src/components/ModalNovo.tsx
- Modificar: src/components/ModalEditar.tsx
- Modificar: src/components/FilterPanel.tsx
- Modificar: src/App.tsx
- Modificar: src/components/DemandasTable.tsx
- Modificar: src/components/DemandDetailDrawer.tsx
- Criar: scripts/migration/prepare-responsibility-map.mjs
- Criar: scripts/migration/apply-responsibility-map.mjs
- Criar: testes dos scripts
- Atualizar: docs/MIGRACAO_LEGADO.md

### Contrato do campo

~~~ts
export type ResponsibleSelection =
  | { kind: 'internal'; profileId: string }
  | { kind: 'external'; name: string }
  | { kind: 'unassigned' };
~~~

O campo apresenta três opções explícitas. Perfil interno é select pesquisável simples, sem nova dependência. Responsável externo abre texto. Não atribuído mostra aviso de qualidade, mas é permitido na criação por administrador/editor.

### Regras da RPC

- internal: valida perfil existente e ativo, grava id e nome atual no snapshot;
- external: grava id nulo e nome informado;
- unassigned: grava id nulo e texto vazio;
- reatribuição gera tipo_evento reatribuicao, mesmo dentro de uma edição maior;
- nome de perfil alterado posteriormente não muda eventos históricos; a tela usa nome atual para carteira e snapshot no evento para auditoria.

### “Minhas demandas”

- scope = meu filtra responsavelId igual a session.user.id.
- Usuário leitor pode usar o filtro.
- Administrador e editor veem botão “Minhas demandas”.
- Filtro explícito por responsável aparece em “Mais filtros”.
- URL usa responsavel=<uuid> ou scope=meu; nunca salva nome.
- Link compartilhado conserva o recorte.

### Mapeamento legado

prepare-responsibility-map.mjs produz CSV fora do Git com:

- texto_legado;
- quantidade;
- perfil_sugerido_id;
- perfil_sugerido_nome;
- motivo_sugestao;
- decisao_aprovada_id;
- observacao.

Algoritmo de sugestão:

1. Normalizar acentos, caixa e espaços.
2. Sugerir somente se houver exatamente um perfil cujo nome completo, primeiro nome exclusivo ou identificador de e-mail coincida exatamente após normalização.
3. Se houver zero ou mais de um, deixar vazio.
4. Nunca aplicar a coluna de sugestão; apply usa somente decisao_aprovada_id.

apply-responsibility-map.mjs:

- exige --dry-run por padrão;
- valida cada UUID contra o diretório;
- mostra quantidades por decisão;
- gera hash SHA-256 do arquivo aprovado;
- somente executa com --apply --confirm-hash=<hash>;
- atualiza via RPC auditável, nunca update direto;
- é idempotente.

### Testes mínimos

- Perfil interno grava id e texto.
- Externo não grava id.
- Não atribuído é filtrável.
- “Minhas” não encontra homônimo sem id.
- Troca de login muda o resultado.
- Leitor não recebe permissão de editar ao usar filtro.
- Mapa não aplica sugestão sem coluna aprovada.
- Ambiguidade nunca escolhe primeiro resultado.
- Execução repetida não duplica eventos.

### Passos

- [ ] Escrever testes RED do campo e filtros.
- [ ] Implementar diretório mínimo no ProfilesService.
- [ ] Integrar campo aos modais.
- [ ] Integrar id ao mapper e à tabela.
- [ ] Implementar scope e filtro por responsável.
- [ ] Criar scripts de dry-run e testes.
- [ ] Gerar relatório de mapeamento sem aplicar.
- [ ] Submeter mapa ao responsável do produto.
- [ ] Aplicar somente mapa aprovado e registrar hash.
- [ ] Reconsultar cobertura de responsabilidade.
- [ ] Executar gate integral.
- [ ] Commit feat: vincular carteira aos perfis.

### Critério de aceite

Cada usuário vê uma carteira pessoal confiável baseada em UUID. Registros externos ou não atribuídos continuam localizáveis. Nenhum texto histórico é perdido.

## CICLO 6 — PRAZOS, PRÓXIMA AÇÃO E SANEAMENTO ASSISTIDO

### Objetivo

Transformar campos ambíguos em informação acionável e melhorar a cobertura sem inventar datas.

### Arquivos

- Criar: src/components/DeadlineApplicabilityField.tsx
- Criar: src/components/DeadlineApplicabilityField.test.tsx
- Modificar: src/validation/demandaSchemas.ts
- Modificar: src/validation/demandMutationSchemas.ts
- Modificar: src/components/ModalNovo.tsx
- Modificar: src/components/ModalEditar.tsx
- Modificar: src/components/ModalStatus.tsx
- Modificar: src/components/DemandDetailDrawer.tsx
- Modificar: src/components/DemandasTable.tsx
- Criar: src/components/DataQualityPanel.tsx
- Criar: src/components/DataQualityPanel.test.tsx
- Criar: scripts/migration/prepare-data-quality.mjs
- Criar: scripts/migration/apply-data-quality.mjs
- Criar: testes dos scripts
- Modificar: src/App.tsx e rotas
- Modificar: src/index.css e responsive-modernization.css

### Comportamento do componente de prazo

- “Definido”: exibe DateMaskInput e exige data válida.
- “Não informado”: oculta data, limpa justificativa e mostra aviso “Pendência de cadastro”.
- “Não se aplica”: oculta data e exige justificativa com dez caracteres.
- Mudança de situação pede confirmação somente se descartar data existente.
- Prazo interno posterior ao prazo final gera erro quando ambos definidos.
- O formulário nunca envia dd/mm/aaaa como valor real.

### Próxima ação na interface

- ModalNovo: obrigatória se status não for Encerrado.
- ModalStatus: obrigatória para destino não encerrado.
- ModalEditar: se o legado não tiver próxima ação, a edição exige preenchimento.
- Drawer: seção “Próxima providência” antes de Prazos.
- Tabela desktop: próxima ação aparece como linha secundária sob Assunto, sem criar nova coluna larga.
- Mobile: próxima ação e data ficam antes dos metadados secundários.

### Qualidade de dados

DataQualityPanel mostra contagens e lista combinável:

- responsável não vinculado;
- sem responsável;
- prazo interno não informado;
- prazo final não informado;
- sem próxima ação;
- sem data da próxima ação;
- somente evento inicial.

Cada item abre a demanda. Não haverá alteração em massa pela interface nesta versão.

### Saneamento único por arquivo

prepare-data-quality.mjs exporta CSV com o estado atual e colunas de decisão vazias. apply-data-quality.mjs segue o mesmo contrato hash/dry-run do ciclo 5. Datas e justificativas somente são aplicadas quando explicitamente preenchidas. O script não sugere prazo.

### Testes mínimos

- Cada combinação válida e inválida de DeadlineState.
- Justificativa com espaços não satisfaz mínimo.
- Data é limpa ao marcar não se aplica.
- Próxima ação exigida em cinco status e limpa em Encerrado.
- Edição legada força saneamento da próxima ação.
- Data interna posterior à final é rejeitada.
- Fila de qualidade contabiliza exatamente cada categoria.
- “Não se aplica” não aparece como vencida nem sem prazo.
- Exportação distingue não informado de não aplicável.

### Passos

- [ ] Escrever matriz de testes RED.
- [ ] Implementar componente reutilizável.
- [ ] Integrar aos três fluxos de formulário.
- [ ] Exibir próxima ação no drawer e tabela.
- [ ] Criar rota e painel de qualidade.
- [ ] Criar scripts de saneamento e dry-run.
- [ ] Atualizar Excel analítico para incluir situação e justificativa.
- [ ] Executar homologação com um registro por combinação.
- [ ] Executar gate integral.
- [ ] Commit feat: tornar prazos e proximas acoes acionaveis.

### Critério de aceite

O sistema não confunde vazio, não informado e não aplicável. Toda nova demanda não encerrada e toda movimentação nova possui próxima ação e data. O legado incompleto permanece visível e rastreável até saneamento.

## CICLO 7 — REGISTRAR ANDAMENTO E APRESENTAR PRONTUÁRIO COMPLETO

### Objetivo

Separar comentário de acompanhamento de mudança de status e tornar a linha do tempo inteligível.

### Arquivos

- Criar: src/components/ModalAndamento.tsx
- Criar: src/components/ModalAndamento.test.tsx
- Modificar: src/components/ModalStatus.tsx
- Modificar: src/components/DemandDetailDrawer.tsx
- Modificar: src/components/ModalHistorico.tsx
- Modificar: src/components/DemandasTable.tsx
- Modificar: src/App.tsx
- Criar: src/components/HistoryEvent.tsx
- Criar: src/components/HistoryEvent.test.tsx
- Modificar: estilos e testes E2E

### Ações da demanda

Ordem no drawer para editor/administrador:

1. Registrar andamento — ação principal e mais frequente.
2. Alterar status.
3. Editar dados.
4. Copiar link.
5. Abrir no sistema de origem, somente se link_origem existir.
6. Fechar drawer.

Na tabela, o menu “Mais ações” apresenta a mesma ordem. O leitor recebe Histórico, Copiar link e Abrir origem.

### ModalAndamento

Campos:

- comentário do andamento, obrigatório;
- próxima ação, preenchida com valor atual e obrigatória;
- data da próxima ação, preenchida e obrigatória;
- resumo somente leitura do status atual.

Enviar chama recordProgress. Não altera status. Após sucesso, fecha modal, atualiza drawer e mantém rota e filtros.

### ModalStatus

- Campo status não oferece o status atual como destino selecionável.
- Comentário explica a transição.
- Destino não encerrado exige próxima ação e data.
- Encerrado mostra confirmação de que a próxima ação será limpa.
- Sobrestado exige comentário com motivo e data de revisão.

### HistoryEvent

Cada item apresenta:

- rótulo textual do tipo;
- data e hora;
- autor;
- status resultante;
- comentário;
- alterações antes/depois, quando existirem;
- setor.

Mudanças de campo ficam recolhidas sob “Ver alterações”, mas acessíveis por teclado. Alterações vazias legadas não mostram controle vazio. Cor nunca é a única indicação.

### Link compartilhável

Copiar link utiliza window.location.origin + /demandas/:id e preserva query atual. Clipboard falho oferece texto selecionável. O link não contorna autenticação; usuário não autenticado é levado ao login e retorna à rota após entrar.

### Testes mínimos

- Andamento não modifica status.
- Status igual é rejeitado.
- Encerrar limpa próxima ação.
- Drawer mantém filtros após fechar modal.
- Evento de edição mostra antes/depois.
- Autor ausente exibe “Autor não identificado”.
- Leitor não vê botões de mutação.
- Copiar link preserva demanda e query.
- Login retorna à rota profunda.
- Teclado, Escape, foco e modal sobre drawer permanecem corretos.

### Passos

- [ ] Escrever testes RED dos dois fluxos.
- [ ] Implementar ModalAndamento com AppDialog.
- [ ] Reduzir ModalStatus ao contrato de transição.
- [ ] Criar HistoryEvent reutilizável.
- [ ] Atualizar drawer e histórico modal.
- [ ] Integrar links e retorno pós-login.
- [ ] Adicionar E2E desktop e mobile.
- [ ] Executar axe nas novas superfícies.
- [ ] Executar gate integral.
- [ ] Commit feat: separar andamento de mudanca de status.

### Critério de aceite

Um usuário consegue registrar trabalho realizado sem falsificar mudança de status. A linha do tempo responde autor, momento, ação e justificativa para eventos novos.

## CICLO 8 — MEU TRABALHO E MOTOR DE ALERTAS

### Objetivo

Transformar a página inicial em fila diária personalizada e preventiva.

### Arquivos

- Criar: src/config/workRules.ts
- Criar: src/work/workTypes.ts
- Criar: src/work/priorityEngine.ts
- Criar: src/work/priorityEngine.test.ts
- Criar: src/work/workMetrics.ts
- Criar: src/work/workMetrics.test.ts
- Criar: src/components/MeuTrabalho.tsx
- Criar: src/components/MeuTrabalho.test.tsx
- Criar: src/components/WorkAlertList.tsx
- Criar: src/components/WorkAlertList.test.tsx
- Excluir após migrar todos os call sites: src/components/AtencaoImediata.tsx
- Modificar: src/components/VisaoGeral.tsx
- Modificar: src/components/Header.tsx
- Modificar: src/App.tsx
- Modificar: src/index.css e responsive-modernization.css
- Modificar: tests/e2e/routing.spec.ts, smoke.spec.ts e accessibility.spec.ts

### Tipo de sinal

~~~ts
export type AlertSeverity = 'critico' | 'urgente' | 'atencao' | 'monitoramento' | 'cadastro';

export type AlertKind =
  | 'prazo_final_vencido'
  | 'proxima_acao_vencida'
  | 'vence_em_breve'
  | 'assinatura_parada'
  | 'providencia_parada'
  | 'aguardando_retorno'
  | 'sem_responsavel'
  | 'prazo_nao_informado'
  | 'sem_proxima_acao';

export interface WorkAlert {
  demandaId: number;
  severity: AlertSeverity;
  primaryKind: AlertKind;
  additionalKinds: AlertKind[];
  title: string;
  explanation: string;
  recommendedAction: string;
  referenceDate: string;
  daysDelta: number | null;
}
~~~

### Assinatura do motor

~~~ts
export function buildWorkAlerts(
  demandas: Demanda[],
  historico: ComentarioHistorico[],
  options: {
    now: Date;
    scope: 'equipe' | 'meu';
    userId: string;
  },
): WorkAlert[];
~~~

### Regras determinísticas

1. Excluir Encerrado e registros logicamente excluídos.
2. Aplicar escopo antes de calcular contagens pessoais.
3. Calcular datas em meia-noite local sem converter inadvertidamente para UTC.
4. Gerar todos os sinais da seção 5.6.
5. Consolidar por demanda.
6. Escolher principal pela ordem de severidade.
7. Não duplicar demanda na fila.
8. Preservar os sinais adicionais como chips textuais.
9. Ordenar pela regra fixada.

### Página do editor

- Cartões: Em acompanhamento comigo; Com providência; Atrasadas; Próximos sete dias.
- Fila principal: até dez itens consolidados.
- Cada item: severidade, número, assunto, próxima ação, data, explicação e Abrir.
- Link “Ver todas” envia para /demandas com alerta e scope na URL.
- Bloco de próximas ações mostra quinze dias em ordem cronológica.
- Estado vazio positivo: “Nenhuma providência crítica na sua carteira”.

### Página do administrador

- Abre escopo equipe.
- Toggle Equipe/Minha carteira.
- Cartões adicionais: Sem responsável e Sem próxima ação.
- Link direto para Qualidade de dados.

### Cabeçalho

Os quatro cartões globais atuais são reduzidos ou recontextualizados para não repetir a página. Devem permanecer acionáveis. “Em acompanhamento”, “Com providência”, “Vencidas” e “Para assinatura” são os rótulos preferidos.

### Testes de borda obrigatórios

- Ano bissexto e virada de mês.
- Hoje não é vencido.
- Três dias é urgente; quatro é atenção.
- Quinze é atenção; dezesseis não gera janela de prazo.
- Três dias em assinatura gera sinal; dois não.
- Registro sem histórico além de criação usa updatedAt como fallback identificado.
- Encerrado não gera alerta mesmo com data antiga.
- Não se aplica não gera sem prazo.
- Uma demanda com três sinais aparece uma vez.
- Homônimo sem responsavelId não entra em “Meu”.
- Ordenação é estável.

### Passos

- [ ] Escrever todos os testes de borda antes da UI.
- [ ] Implementar motor puro e métricas pessoais.
- [ ] Criar componentes sem cálculos duplicados.
- [ ] Integrar início por papel.
- [ ] Conectar cartões e alertas a filtros URL.
- [ ] Substituir a limitação de um item por categoria.
- [ ] Validar desktop 1440 px e mobile 360/390 px.
- [ ] Executar axe e teste reduced motion.
- [ ] Executar gate integral.
- [ ] Commit feat: criar central personalizada de trabalho.

### Critério de aceite

O editor identifica em uma tela o que precisa fazer. O administrador identifica riscos da equipe. Contagens e listas usam a mesma função e o mesmo recorte; não podem divergir.

## CICLO 9 — CENTRAL DE RELATÓRIOS EXCEL

### Objetivo

Evoluir o Excel existente para sete modelos parametrizados, preservando estilo, compatibilidade e rastreabilidade.

### Arquivos

- Criar: src/export/reportTypes.ts
- Criar: src/export/reportCatalog.ts
- Criar: src/export/reportCatalog.test.ts
- Criar: src/export/workbookStyles.ts
- Criar: src/export/buildReportWorkbook.ts
- Criar: src/export/buildReportWorkbook.test.ts
- Criar: src/export/exportReportExcel.ts
- Criar: src/export/sheets/summarySheet.ts
- Criar: src/export/sheets/demandasSheet.ts
- Criar: src/export/sheets/risksSheet.ts
- Criar: src/export/sheets/workloadSheet.ts
- Criar: src/export/sheets/historySheet.ts
- Criar: src/export/sheets/monthlyFlowSheet.ts
- Criar: src/export/sheets/demandDossierSheet.ts
- Criar: src/components/ReportsCenter.tsx
- Criar: src/components/ReportsCenter.test.tsx
- Modificar: src/export/excelAnalytics.ts
- Modificar: src/export/exportDemandasExcel.ts como adaptador
- Modificar: src/components/Header.tsx
- Modificar: src/App.tsx e rotas
- Modificar: vercel.json para reescrever /relatorios e /relatorios/:path* para /index.html
- Modificar: testes existentes do Excel

### Catálogo fixo

~~~ts
export type ReportPreset =
  | 'minha_carteira'
  | 'prazos_riscos'
  | 'gerencial_consolidado'
  | 'por_responsavel'
  | 'movimentacoes_periodo'
  | 'demanda_individual'
  | 'mensal_estoque_fluxo';
~~~

### Modelos e abas

| Modelo | Abas mínimas | Recorte obrigatório |
|---|---|---|
| Minha carteira | Resumo, Minhas Demandas | responsavelId do login |
| Prazos e riscos | Resumo de Riscos, Demandas Críticas, Qualidade | intervalo e escopo |
| Gerencial consolidado | Resumo, Demandas, Carteira por Responsável | equipe |
| Por responsável | Resumo, Carteiras, Demandas | responsável ou todos |
| Movimentações do período | Resumo, Movimentações, Demandas Afetadas | período obrigatório |
| Demanda individual | Dossiê, Linha do Tempo | demanda única |
| Mensal estoque e fluxo | Fluxo Mensal, Movimentações, Estoque Final | mês obrigatório |

Nomes das abas não excedem 31 caracteres. Nenhuma planilha usa macros, conexão externa ou fórmula volátil.

### Parâmetros da tela

- Modelo.
- Período quando aplicável.
- Escopo equipe/meu.
- Responsável quando aplicável.
- Incluir encerradas, conforme modelo.
- Resumo do recorte antes de gerar.

O leitor pode gerar consulta e demanda individual. Modelos de equipe não revelam dados além dos que o leitor já pode consultar no sistema.

### Regras analíticas

- Todos os relatórios usam as mesmas funções de semântica, filtros, prioridade e métricas da aplicação.
- Minha carteira nunca usa nome textual.
- Situação de prazo distingue definido, não informado e não aplicável.
- Carteira por responsável é volume e risco; não é produtividade.
- Relatório mensal calcula estoque inicial, entradas, encerramentos, reaberturas e estoque final.
- Tempo médio exclui origem legado e registra universo utilizado.
- Metadados registram modelo, período, filtros, usuário, data/hora, fonte e versão.

### Compatibilidade

exportDemandasExcel continua existindo temporariamente e chama gerencial_consolidado com o recorte atual. Isso preserva imports e testes enquanto Header passa a abrir /relatorios.

### Testes mínimos

1. Cada preset produz exatamente as abas declaradas.
2. Minha carteira não inclui outro UUID.
3. Movimentações exige período.
4. Individual exige uma demanda.
5. Mensal fecha a identidade estoque inicial + entradas + reaberturas - encerramentos = estoque final.
6. Formula injection permanece neutralizada em toda célula textual.
7. Datas são células de data com formato brasileiro.
8. Autofiltros e congelamento permanecem válidos.
9. OOXML não possui relação órfã ou marcador de recuperação.
10. Arquivo vazio válido é gerado somente quando o modelo permitir; caso contrário, UI bloqueia com mensagem.
11. Cores são redundantes com texto.
12. Bundle inicial não incorpora ExcelJS.

### Passos

- [ ] Caracterizar o workbook atual antes da refatoração.
- [ ] Extrair tokens e construtores sem alterar saída atual.
- [ ] Criar catálogo e validação de parâmetros.
- [ ] Implementar uma aba por arquivo.
- [ ] Criar os sete presets.
- [ ] Criar ReportsCenter e rota.
- [ ] Manter importação dinâmica de ExcelJS.
- [ ] Gerar fixtures de cada modelo e reabrir com ExcelJS.
- [ ] Inspecionar manualmente ao menos Minha carteira, Prazos e riscos e Mensal no LibreOffice ou Excel.
- [ ] Executar gate integral e orçamento do bundle.
- [ ] Commit feat: criar central de relatorios excel.

### Critério de aceite

O usuário escolhe finalidade e parâmetros e recebe um workbook coerente com o recorte. A exportação atual não é perdida; torna-se o preset consolidado.

## CICLO 10 — PAINEL GERENCIAL ORIENTADO A AÇÃO E COBERTURA

### Objetivo

Apresentar estoque, fluxo, risco e qualidade dos dados sem produzir conclusões falsas.

### Arquivos

- Criar: src/analytics/operationalMetrics.ts
- Criar: src/analytics/operationalMetrics.test.ts
- Criar: src/components/ManagementDashboard.tsx
- Criar: src/components/ManagementDashboard.test.tsx
- Criar: src/components/DataCoverageCard.tsx
- Modificar: src/components/VisaoGeral.tsx
- Modificar: src/App.tsx
- Modificar: src/index.css e responsividade
- Modificar: Excel para consumir métricas compartilhadas

### Interface de métricas

~~~ts
export interface OperationalMetrics {
  stock: {
    followUp: number;
    ctrhAction: number;
    waitingExternal: number;
    suspended: number;
    closed: number;
  };
  risk: {
    overdue: number;
    dueToday: number;
    next3Days: number;
    next15Days: number;
    idle: number;
  };
  flow: {
    openingStock: number;
    entries: number;
    closures: number;
    reopenings: number;
    closingStock: number;
  };
  coverage: {
    responsible: number;
    deadlines: number;
    nextAction: number;
    history: number;
    cycleTimeEligibleCount: number;
  };
}
~~~

### Layout funcional

1. Estoque e providências.
2. Riscos e prazos.
3. Entradas, encerramentos e variação do mês.
4. Distribuição da carteira por responsável com volume normal e volume em risco.
5. Cobertura dos dados e limitação analítica.
6. Últimas movimentações.

Não adicionar biblioteca de gráficos. Barras e números atuais são suficientes para 379 registros. Toda visualização deve ser clicável e abrir o mesmo recorte em /demandas.

### Limitações exibidas

- Se cycleTimeEligibleCount for inferior a dez, não mostrar média; mostrar “Amostra insuficiente”.
- Registros de origem legado não entram em tempo médio.
- Cobertura inferior a 80% exibe aviso no indicador relacionado.
- Percentuais exibem numerador e denominador em texto acessível.

### Testes mínimos

- Identidade de estoque mensal fecha.
- Reabertura é contabilizada uma vez.
- Alterações sem status não contam como encerramento.
- Demanda legada é excluída de tempo médio.
- Risco por responsável soma ao risco total no mesmo recorte.
- Cartão e destino filtrado têm mesma contagem.
- Amostra insuficiente não mostra média.
- Cobertura trata não se aplica como prazo classificado.

### Passos

- [ ] Escrever testes puros com relógio fixo.
- [ ] Implementar métricas sem React.
- [ ] Fazer Excel consumir o mesmo módulo.
- [ ] Criar painel e links de recorte.
- [ ] Remover “Setores mais ativos” ou renomear para “Distribuição por setor”.
- [ ] Remover qualquer uso de “produtividade” para volume.
- [ ] Validar interpretação com base sintética conhecida.
- [ ] Executar gate integral.
- [ ] Commit feat: orientar painel a estoque risco e fluxo.

### Critério de aceite

O painel responde onde agir e informa quando a base não sustenta determinada leitura. Nenhum número do painel diverge do Excel equivalente.

## CICLO 11 — VISÕES E PREFERÊNCIAS SALVAS POR LOGIN

### Objetivo

Persistir página inicial, escopo, tamanho de página e recortes frequentes por usuário.

### Arquivos

- Criar: supabase/migrations/20260722110000_user_preferences_saved_views.sql
- Modificar: supabase/migrations/migration.test.ts
- Criar: src/preferences/preferencesTypes.ts
- Criar: src/preferences/preferencesService.ts
- Criar: src/preferences/supabasePreferencesService.ts
- Criar: src/preferences/localPreferencesService.ts
- Criar: testes dos serviços
- Criar: src/hooks/useUserPreferences.ts
- Criar: src/components/SavedViewsMenu.tsx
- Criar: src/components/UserPreferencesDialog.tsx
- Modificar: src/services/createAppServices.ts
- Modificar: src/App.tsx
- Modificar: src/components/FilterPanel.tsx
- Modificar: src/components/DemandasTable.tsx

### Regras de preferência

- Default administrador: página meu_trabalho com escopo equipe.
- Default editor: página meu_trabalho com escopo meu.
- Default leitor: página demandas com escopo equipe.
- Usuário pode mudar página inicial.
- Tamanho permitido: 10, 25 ou 50.
- Visão salva guarda apenas chaves conhecidas de DemandFilters.
- No máximo vinte visões por usuário.
- Um único default por usuário, garantido por índice parcial.
- Renomear, substituir e excluir requer confirmação adequada.

### RLS

Testar com dois usuários: A não consegue ler, inserir, alterar nem excluir preferências ou visões de B, inclusive por requisição direta.

### UX

- “Salvar visão” aparece quando há filtro ativo.
- Menu “Minhas visões” lista nome e resumo.
- Aplicar visão substitui filtros atuais e atualiza URL.
- Visão incompatível com versão nova ignora chave desconhecida e exibe aviso não bloqueante.
- Preferências carregam após sessão; não piscam conteúdo de outro login.
- Logout limpa estado em memória.

### Testes mínimos

- Defaults por papel.
- Isolamento por usuário.
- Limite de vinte.
- Um default.
- Nome duplicado case-insensitive rejeitado.
- Round-trip de filtros.
- Logout/login não vaza preferência.
- Modo local sintético usa chave namespaced pelo id local.

### Passos

- [ ] Criar migration e testes RLS.
- [ ] Implementar serviços remoto e local.
- [ ] Implementar hook sem duplicar chamadas.
- [ ] Integrar página inicial, escopo e paginação.
- [ ] Criar salvar/aplicar/gerenciar visões.
- [ ] Executar testes de dois logins.
- [ ] Executar gate integral.
- [ ] Commit feat: salvar preferencias e visoes por usuario.

### Critério de aceite

Cada usuário retorna ao ambiente configurado e consegue abrir recortes frequentes sem reconstruí-los. Preferências nunca atravessam contas.

## CICLO 12 — RECUPERAÇÃO DE SENHA E SIMPLIFICAÇÃO DO LOGIN

### Objetivo

Permitir recuperação autônoma e deixar a entrada coerente com um sistema interno recorrente.

### Arquivos

- Modificar: src/services/contracts.ts
- Modificar: src/services/supabaseAuthService.ts
- Modificar: src/services/localAuthService.ts
- Modificar: testes de autenticação
- Modificar: src/hooks/useAppSession.ts
- Criar: src/components/PasswordRecoveryPanel.tsx
- Criar: src/components/PasswordRecoveryPanel.test.tsx
- Modificar: src/components/AuthPanel.tsx
- Modificar: src/validation/authSchemas.ts
- Modificar: src/App.tsx e rotas
- Modificar: src/brand.css e responsividade
- Modificar: vercel.json para /redefinir-senha
- Atualizar: docs/SUPABASE_SETUP.md

### Contrato

~~~ts
export interface AuthService {
  restore(): Promise<AppUser | null>;
  signIn(email: string, password: string): Promise<AppUser>;
  requestAccess(email: string, password: string): Promise<void>;
  requestPasswordReset(email: string, redirectTo: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  signOut(): Promise<void>;
  subscribe(onChange: (user: AppUser | null) => void): () => void;
}
~~~

### Fluxo

1. “Esqueci minha senha” abre formulário de e-mail.
2. Mensagem de sucesso é neutra: não confirma existência da conta.
3. Supabase envia link para /redefinir-senha.
4. App reconhece evento PASSWORD_RECOVERY e exibe nova senha.
5. Nova senha segue os requisitos existentes.
6. Após sucesso, encerra sessão de recuperação e volta ao login.

### Configuração externa

O executor deve consultar o projeto Vercel e registrar a URL exata de Production e Preview antes de configurar redirects. Não inventar domínio. Se não houver acesso à configuração Auth URL do Supabase, implementar código, documentar o valor necessário e parar a publicação do fluxo até configuração por pessoa autorizada.

### Simplificação visual e textual

- Manter logomarca.
- Na coluna institucional, manter apenas marca e uma frase curta.
- Remover os três blocos Prazos, Responsáveis e Histórico.
- Login permanece foco principal.
- Primeiro acesso informa persistentemente que depende de aprovação do administrador.
- Incluir “Em caso de acesso pendente, procure um administrador do CTRH”; não inventar e-mail de suporte.
- Requisitos de senha ficam compactos e continuam acessíveis.

### Testes mínimos

- E-mail fora do domínio é rejeitado no cliente.
- Resposta de reset não revela conta existente.
- PASSWORD_RECOVERY abre rota correta.
- Senha fraca é rejeitada.
- Link expirado apresenta orientação.
- Retorno profundo pós-login permanece.
- Login e primeiro acesso passam axe em desktop e mobile.
- Modo local simula fluxo sem enviar e-mail.

### Passos

- [ ] Escrever testes RED de serviço e interface.
- [ ] Implementar contrato Supabase.
- [ ] Implementar rota de redefinição.
- [ ] Configurar rewrites.
- [ ] Simplificar a coluna institucional.
- [ ] Configurar redirects exatos no Supabase.
- [ ] Homologar com conta de teste, link válido e link expirado.
- [ ] Executar gate integral.
- [ ] Commit feat: adicionar recuperacao de senha.

### Critério de aceite

Usuário consegue redefinir senha sem intervenção técnica, e a tela de entrada fica mais direta sem perder identidade ou orientação.

## CICLO 13 — CONTRATO FINAL, HOMOLOGAÇÃO E PRODUÇÃO

### Objetivo

Remover caminhos legados somente depois de provar a nova operação, validar toda a aplicação e encerrar exposições históricas.

### Arquivos

- Criar: supabase/migrations/20260722180000_central_trabalho_contract.sql
- Modificar: supabase/migrations/migration.test.ts
- Remover adaptadores deprecated dos repositórios
- Atualizar: src/lib/database.types.ts
- Atualizar: docs/HANDOFF.md
- Atualizar: docs/RELATORIO_ESTADO_ATUAL.md
- Criar: docs/GUIA_USUARIO_CENTRAL_TRABALHO.md
- Criar: docs/RUNBOOK_PRODUCAO_ROLLBACK.md
- Atualizar: README.md

### Migration de contrato

- Revogar update direto em campos operacionais de sme_demandas.
- Revogar delete direto.
- Revogar execução das RPCs criar_sme_demanda e atualizar_status_sme_demanda antigas.
- Manter select conforme RLS.
- Validar constraints de prazos somente depois da consulta de violações retornar zero.
- Validar constraint de próxima ação somente depois do saneamento definido pelo responsável.
- Não dropar funções antigas no mesmo release; revogar primeiro. Drop pode ocorrer em manutenção posterior.

### Gate de pré-produção

1. CI verde no SHA candidato.
2. Preview no mesmo SHA.
3. Migration de expansão aplicada.
4. Todos os testes de administrador, editor e leitor aprovados.
5. Busca avançada aprovada.
6. Sete relatórios gerados.
7. Alertas comparados a dataset conhecido.
8. Mobile sem overflow horizontal.
9. Axe sem violações críticas ou sérias.
10. Bundle scan sem dados reais.
11. Backup confirmado e restaurabilidade documentada.
12. Rollback ensaiado em ambiente seguro.

### Homologação por papel

Administrador:

- aprova perfil;
- alterna Equipe/Minha;
- saneia uma demanda;
- exclui logicamente e restaura;
- gera relatório gerencial;
- acessa qualidade de dados.

Editor:

- vê Minhas demandas;
- cria demanda com próxima ação;
- registra andamento;
- altera status;
- edita e gera histórico;
- gera Minha carteira.

Leitor:

- pesquisa conteúdo e histórico;
- usa filtros;
- abre link direto;
- copia link;
- exporta modelo permitido;
- não vê nem executa mutações.

### Publicação

- [ ] Mesclar PR final após gates.
- [ ] Aplicar migration de contrato na janela definida.
- [ ] Publicar Production no SHA homologado.
- [ ] Executar smoke anônimo: login visível, nenhum dado no HTML/assets.
- [ ] Executar smoke autenticado dos três papéis.
- [ ] Consultar logs Vercel e Supabase.
- [ ] Confirmar Realtime em duas sessões.
- [ ] Registrar SHA, deployment, migrations, horário e responsável.

### Deployments antigos

1. Listar todos os deployments históricos.
2. Testar asset ou canário de dado real em cada um.
3. Produzir inventário com deployment id, URL, SHA, estado e evidência.
4. Preservar o deployment atual e qualquer versão sem exposição necessária ao rollback.
5. Solicitar autorização explícita para apagar somente os deployments afetados.
6. Após autorização, remover alvos exatos, nunca por glob.
7. Verificar que URLs antigas não servem o bundle.

### Monitoramento

- Primeiros 30 minutos: erros de autenticação, RPC, RLS, Realtime e JavaScript.
- Primeiro dia útil: feedback de carteira, alertas e relatórios.
- Após trinta dias: revisar cobertura, limiares de alerta e necessidade real de e-mail.

### Critério de aceite final

Todos os requisitos da matriz da seção 12 estão satisfeitos; nenhuma API legada permite mutação fora do histórico; não há dado real no bundle atual ou nos deployments antigos autorizados para remoção; documentação e rollback correspondem ao ambiente real.

---

# 11. ESTRATÉGIA DE MIGRAÇÃO, BACKUP E ROLLBACK

## 11.1 Antes de migration

- Exportar schema.
- Exportar perfis, demandas e histórico.
- Registrar contagens e hashes dos arquivos.
- Guardar backup fora do repositório e fora do bundle.
- Confirmar que o arquivo pode ser lido.
- Não imprimir conteúdo real em logs do agente.

## 11.2 Aplicação

Migrations são aplicadas em ordem, uma vez, com registro de versão. O executor não deve copiar trechos avulsos para o SQL Editor sem registrar a migration no repositório. Se a ferramenta conectada for o único meio disponível, executar o arquivo integral e depois confirmar a tabela de migrations.

## 11.3 Rollback por tipo

| Falha | Resposta |
|---|---|
| UI nova falha, schema expandido íntegro | reverter deployment; manter colunas aditivas |
| RPC nova falha antes da migration de contrato | reverter frontend para APIs antigas; corrigir RPC |
| Contrato aplicado e frontend falha | restaurar grants/RPCs por migration de rollback versionada; não editar manualmente sem registro |
| Dado incorreto por script | interromper, usar log/hash e operação inversa por RPC; restaurar backup se necessário |
| Relatório incorreto | desabilitar modelo afetado na UI; preservar demais funções |
| Alertas incorretos | reverter frontend; não alterar dados |
| Exposição no bundle | retirar deployment; nunca voltar ao seed real em src |

## 11.4 Regra de dados

Nenhum rollback pode apagar eventos novos válidos para “voltar ao estado anterior”. Reversões funcionais devem preservar ou registrar a trilha.

---

# 12. MATRIZ DE RASTREABILIDADE DOS REQUISITOS

| ID | Requisito | Ciclo | Evidência mínima |
|---|---|---:|---|
| R01 | Sem dados reais no bundle | 1, 13 | check-public-bundle e inspeção anônima |
| R02 | Local bloqueado em produção | 1 | teste resolveAppConfig |
| R03 | Semântica de status única | 2 | workSemantics.test |
| R04 | Tramitado não é encerrado nem providência CTRH | 2 | testes por status |
| R05 | Responsável ligado por UUID | 5 | mapper, RPC e teste Minhas |
| R06 | Externo e não atribuído preservados | 5 | testes ResponsibleSelection |
| R07 | Minhas demandas por login | 5 | teste com dois usuários e homônimo |
| R08 | Prazo definido/não informado/não aplicável | 6 | matriz Zod e componente |
| R09 | Próxima ação em não encerradas | 4, 6 | testes RPC e formulários |
| R10 | Andamento separado de status | 4, 7 | testes de mutação |
| R11 | Autoria e antes/depois | 4, 7 | evento renderizado e SQL |
| R12 | Exclusão recuperável | 4, 13 | teste lixeira e histórico |
| R13 | Alertas completos e consolidados | 8 | priorityEngine.test |
| R14 | Alertas preventivos 3/15 dias | 8 | testes de borda |
| R15 | Paradas e espera externa | 8 | relógio fixo e histórico |
| R16 | Personalização por papel | 8 | testes admin/editor/leitor |
| R17 | Busca atual preservada | todos | suíte search e E2E |
| R18 | Filtro por responsável e escopo | 5 | URL e filtro puro |
| R19 | Link compartilhável | 7 | E2E deep link |
| R20 | Link de origem opcional | 3, 7 | validação HTTPS e botão condicional |
| R21 | Sete relatórios Excel | 9 | catálogo e fixtures |
| R22 | Minha carteira por UUID | 9 | workbook test |
| R23 | Mensal fecha estoque | 9, 10 | identidade algébrica |
| R24 | Sem produtividade por volume | 9, 10 | revisão textual e testes de rótulo |
| R25 | Métricas com cobertura | 10 | operationalMetrics.test |
| R26 | Visões salvas isoladas | 11 | testes RLS dois usuários |
| R27 | Preferência de página e paginação | 11 | hook e E2E relogin |
| R28 | Recuperação de senha | 12 | serviço, rota e homologação real |
| R29 | Login simplificado | 12 | teste estrutural e captura |
| R30 | Acessibilidade desktop/mobile | todos | axe e Playwright |
| R31 | Expandir antes de contrair | 3, 13 | ordem de migrations e deploy |
| R32 | Backup e rollback | 13 | runbook e evidência |

---

# 13. MATRIZ DE TESTES FUNCIONAIS

## 13.1 Casos críticos

| Caso | Preparação | Ação | Resultado esperado |
|---|---|---|---|
| Minha carteira | duas demandas, nomes iguais, UUIDs distintos | login usuário A | somente UUID A |
| Prazo não aplicável | prazo final sem data e justificativa válida | salvar | sem alerta de atraso; cobertura classificada |
| Prazo não informado | prazo final sem data | abrir painel | aparece qualidade, não vencida |
| Andamento | demanda Aguardando | registrar comentário | status igual; novo evento andamento |
| Status | demanda Aguardando | mudar para Tramitado | evento com anterior/novo e data de acompanhamento |
| Encerramento | próxima ação preenchida | encerrar | próxima ação limpa; evento preservado |
| Exclusão | admin exclui | consultar lista normal e lixeira | some da normal; aparece na lixeira |
| Restauração | item na lixeira | restaurar | volta à lista; evento restauração |
| Alerta múltiplo | vencida, parada e sem responsável | abrir fila | uma linha, crítico principal, chips adicionais |
| Deep link | usuário deslogado abre /demandas/1 | autenticar | retorna ao drawer 1 |
| Relatório mensal | dataset fechado conhecido | gerar | identidade de estoque fecha |
| Reset | link válido | cadastrar senha | sucesso e retorno ao login |

## 13.2 Papéis

Testar toda ação pelo frontend e por chamada direta ao Supabase. Ocultar botão não substitui autorização RLS/RPC.

| Operação | Administrador | Editor | Leitor |
|---|---:|---:|---:|
| Consultar | sim | sim | sim |
| Exportar | sim | sim | sim |
| Criar/editar/andamento/status | sim | sim | não |
| Excluir/restaurar | sim | não | não |
| Gerenciar perfis | sim | não | não |
| Qualidade de dados | sim | leitura limitada não | não |
| Preferências próprias | sim | sim | sim |

## 13.3 Viewports

- Desktop: Chromium, largura 1440 e altura mínima 900.
- Mobile principal: Chromium, 390 × 844.
- Mobile estreito: 360 × 800.
- Nenhum fluxo crítico apresenta overflow horizontal de página.
- Tabelas podem ter região própria rolável com rótulo acessível.

---

# 14. PADRÃO DE COMMITS E PULL REQUESTS

## 14.1 Commits

Commits pequenos, em português ou inglês consistente com o histórico. Exemplos:

~~~text
fix: remover dados reais do bundle publico
refactor: centralizar semantica de demandas
feat: expandir modelo da central de trabalho
feat: registrar mutacoes auditaveis
feat: vincular carteira aos perfis
feat: tornar prazos acionaveis
feat: separar andamento de status
feat: criar meu trabalho e alertas
feat: criar central de relatorios
feat: adicionar preferencias por usuario
feat: adicionar recuperacao de senha
docs: consolidar runbook de producao
~~~

## 14.2 Corpo do PR

Todo PR contém:

1. Problema do usuário resolvido.
2. Pessoa, dor e cenário real afetados.
3. Fluxo anterior e fluxo resultante, incluindo quantidade de passos quando aplicável.
4. Comportamento existente que precisava ser preservado.
5. Evidência do ganho de produto e resposta ao gate da seção 3.13.
6. Escopo incluído e excluído.
7. Arquivos e migrations.
8. Testes executados com resultados.
9. Evidência visual quando houver UI.
10. Impacto em dados e compatibilidade.
11. Rollback.
12. Checklist de critérios do ciclo.

Não usar apenas “implementa Task X”.

---

# 15. DEFINIÇÃO DE PRONTO

Uma tarefa está pronta quando:

- o executor leu e respeitou AGENTS.md, docs/PRODUCT_CONTEXT.md, ADRs relevantes e este plano;
- código e migration correspondem aos contratos deste documento;
- testes RED falharam pelo motivo esperado antes da implementação;
- testes específicos e gate integral aprovam;
- UI foi testada nos viewports;
- acessibilidade foi verificada;
- contagens do cartão correspondem ao destino filtrado;
- nenhum dado real entrou em fixture ou artefato;
- documentação foi atualizada;
- diff não contém alterações fora do ciclo;
- commit e PR estão publicados;
- Preview está homologado;
- o cenário real descrito no gate de produto foi homologado e não induz controle paralelo;
- Production foi validada quando aplicável;
- rollback está claro e possível.

“Compilou”, “o teste unitário passou” ou “a migration executou” não bastam isoladamente.

---

# 16. CONDIÇÕES DE PARADA OBRIGATÓRIA

O agente deve parar, preservar o estado e pedir orientação quando:

1. Não conseguir identificar o repositório ou main correta.
2. Encontrar alterações não relacionadas do usuário nos mesmos arquivos.
3. Main tiver evoluído de forma incompatível com o plano.
4. Backup de produção não puder ser obtido antes de migration material.
5. Migration de homologação alterar contagens ou produzir órfãos.
6. Mapa de responsáveis tiver ambiguidades não aprovadas.
7. Saneamento exigir inventar prazo, responsável ou justificativa.
8. Não houver acesso para configurar redirect de recuperação.
9. CI, testes ou bundle gate falharem e a causa não estiver resolvida.
10. Preview não corresponder ao SHA do PR.
11. Ação exigir apagar deployments, dados ou histórico sem autorização específica.
12. RLS permitir operação de papel não autorizado.
13. Métrica não puder ser calculada conforme a definição fixada.

Não é condição de parada: ausência esperada de dados completos no legado, desde que a fila de qualidade os identifique e nenhuma inferência seja aplicada.

---

# 17. FORMATO DE RELATO APÓS CADA CICLO

O agente deve responder com:

~~~text
Ciclo concluído: <número e nome>
Branch: <nome>
Commit: <SHA>
PR: <URL>
Preview: <URL e estado>

Entregue:
- <resultado funcional>

Testes:
- <comando>: PASS

Dados/migrations:
- <o que mudou ou “nenhuma alteração”>

Critérios de aceite:
- <itens aprovados>

Pendências e riscos:
- <nenhuma ou lista objetiva>

Próximo ciclo autorizado pelo plano:
- <número e precondições>
~~~

O relato não deve esconder testes não executados sob “não foi possível validar”. Se não foi possível, o ciclo não está concluído.

---

# 18. PROMPT MESTRE PARA INICIAR A EXECUÇÃO NO CODEX

Copiar o texto abaixo junto com este documento:

> Leia integralmente o arquivo Plano_Mestre_Execucao_CTRH_v1.0 antes de tocar no repositório. Trate-o como contrato vinculante e não como lista isolada de tarefas. Execute inicialmente apenas o Ciclo 0 e o Ciclo 1, em branches e PRs separados. No Ciclo 0, crie AGENTS.md, docs/PRODUCT_CONTEXT.md e a cópia versionada do plano; a partir daí, releia esses arquivos e os ADRs aplicáveis no início de todo ciclo. Preencha o gate de consciência do produto antes de codificar e homologue o cenário real depois da implementação. Cumpra testes RED, gate integral, revisão de escopo e homologação descritos. Não altere produção, banco ou deployments antigos no Ciclo 0. No Ciclo 1, não apague deployments históricos; apenas elimine dados reais do novo bundle e bloqueie modo local em produção. Se a main atual divergir do baseline, faça a matriz de reconciliação e pare quando houver conflito material. Ao terminar cada ciclo, use exatamente o formato de relato da seção 17. Não avance sobre uma condição de parada.

Para execução integral posterior:

> Prossiga pelos ciclos na ordem do Plano_Mestre_Execucao_CTRH_v1.0. Um ciclo por PR. Antes de interpretar cada tarefa, leia AGENTS.md, docs/PRODUCT_CONTEXT.md, o ciclo completo e os ADRs aplicáveis. As decisões marcadas como DECISÃO FIXADA estão aprovadas. Isso não autoriza apagar deployments ou dados; respeite os gates destrutivos. Antes de cada ciclo, confirme precondições e registre pessoa, dor, cenário, resultado e regressões proibidas. Depois de implementar, valide o fluxo real e publique evidências técnicas e de produto. Aguarde apenas se o plano exigir gate humano ou se surgir condição de parada.

---

# 19. CHECKLIST FINAL DO AGENTE EXECUTOR

- [ ] Li o documento integralmente.
- [ ] Li AGENTS.md, docs/PRODUCT_CONTEXT.md e os ADRs aplicáveis.
- [ ] Registrei e homologuei o gate de consciência do produto em cada ciclo.
- [ ] Confirmei main, SHA e worktree.
- [ ] Não há dados reais no bundle.
- [ ] Semântica é única e testada.
- [ ] Responsabilidade usa UUID.
- [ ] Prazos distinguem os três estados.
- [ ] Próxima ação existe nos novos fluxos.
- [ ] Andamento é separado de status.
- [ ] Histórico registra autor e alterações.
- [ ] Exclusão é recuperável.
- [ ] Meu trabalho e alertas usam o mesmo motor.
- [ ] Busca permanece aprovada.
- [ ] Sete relatórios estão aprovados.
- [ ] Painel e Excel compartilham métricas.
- [ ] Preferências são isoladas por usuário.
- [ ] Recuperação de senha está configurada.
- [ ] RLS e RPCs foram testadas por papel.
- [ ] Desktop e mobile foram homologados.
- [ ] Backup e rollback foram comprovados.
- [ ] Migration de contrato ocorreu por último.
- [ ] Deployments antigos afetados foram tratados somente com autorização.
- [ ] Documentação corresponde ao ambiente final.

**Fim do plano mestre — versão 1.0.**

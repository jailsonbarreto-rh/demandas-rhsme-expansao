# PLANO REMANESCENTE DE EXECUÇÃO — CENTRAL DE DEMANDAS CTRH

## Evolução para central personalizada de trabalho, prazos, relatórios e análise gerencial

**Versão:** 2.0  
**Data de corte:** 23 de julho de 2026  
**Status:** APROVADO PARA EXECUÇÃO CONTROLADA  
**Produto:** Central de Demandas — CTRH / SME-RJ  
**Repositório:** `WilsonMPeixoto-2/demandas-rhsme-expansao`  
**Produção:** `https://demandas-rhsme-expansao.vercel.app/`  
**Banco:** Supabase — CTRH PROCESSOS  

> **Regra de autoridade:** este documento substitui o Plano Mestre v1.0 como roteiro cronológico. O v1.0 permanece preservado como registro histórico e fonte de decisões funcionais já fixadas.

---

# 1. AUTORIDADE, FINALIDADE E REGRA DE USO

Este plano consolida o estado efetivamente implantado no GitHub, Supabase e Vercel em 23 de julho de 2026 e define somente o trabalho que ainda falta para transformar a Central de Demandas em uma central diária de trabalho, acompanhamento, auditoria, relatórios e análise gerencial.

Nenhum agente deve reexecutar os Ciclos 0 a 4 do Plano Mestre v1.0 nem usar a numeração antiga para determinar a próxima etapa. A execução futura segue exclusivamente os Ciclos R0 a R12 deste documento.

## 1.1 Ordem obrigatória de leitura

1. `AGENTS.md`;
2. `docs/PRODUCT_CONTEXT.md`;
3. este Plano Remanescente v2.0, integralmente;
4. os ADRs aplicáveis em `docs/adr/`;
5. `docs/HANDOFF.md` e a documentação dos módulos afetados;
6. o Plano Mestre v1.0 apenas para consultar a origem de uma decisão já consolidada.

## 1.2 Precedência documental

| Ordem | Documento | Função |
|---:|---|---|
| 1 | Plano Remanescente v2.0 | Sequência, escopo, dependências e gates vigentes. |
| 2 | PRODUCT_CONTEXT e ADRs | Significado do produto e decisões funcionais. |
| 3 | AGENTS.md | Obrigações operacionais resumidas para agentes. |
| 4 | HANDOFF.md | Estado material mais recente e próximo ciclo autorizado. |
| 5 | Plano Mestre v1.0 | Registro histórico; não é mais checklist cronológico. |

## 1.3 Disciplina vinculante

- trabalhar sempre em branch própria;
- um ciclo publicável por branch e pull request;
- iniciar o ciclo seguinte somente após merge ou autorização expressa para cadeia dependente;
- confirmar `main`, SHA, migrations, ambiente e ausência de conflito antes de começar;
- registrar antes de implementar: pessoa, dor, cenário, ganho esperado e comportamento protegido;
- escrever ou atualizar testes de caracterização e testes RED antes de mudança de comportamento;
- implementar a menor solução completa do ciclo, sem refatorações oportunistas;
- validar o fluxo real do usuário, não apenas funções isoladas ou mocks;
- publicar Preview no mesmo SHA do PR e registrar evidência antes de merge;
- aplicar migrations somente pelos arquivos versionados e na ordem declarada;
- atualizar `docs/HANDOFF.md` ao fim de cada ciclo.

## 1.4 Gate técnico mínimo

```text
npm ci
npm audit --audit-level=high
npm audit signatures
npm run lint
npm run test:coverage
npm run build
npm run check:bundle
npm run test:e2e
```

O ciclo acrescenta gates específicos quando envolver banco, bundle público, Supabase E2E, acessibilidade, relatórios Excel, segurança, performance ou release. Nenhum teste pode ser removido, ignorado ou tornado permissivo para obter aprovação.

## 1.5 Proibições permanentes

- não tratar `Tramitado` como `Encerrado` ou providência imediata do CTRH;
- não classificar ausência de prazo como atraso;
- não identificar responsável por aproximação textual; a carteira pessoal usa UUID;
- não inventar prazo, responsável, justificativa, autoria ou evento histórico;
- não reintroduzir dados reais no bundle, fixtures, logs, screenshots ou artefatos públicos;
- não reabrir `UPDATE` ou `DELETE` direto nas tabelas operacionais;
- não recriar índice normalizado, semântica central, schema expandido ou RPCs v2 já existentes;
- não revogar RPCs legadas antes do Ciclo R12;
- não criar ranking de produtividade, competição individual, microserviços ou infraestrutura desproporcional;
- não substituir Supabase, ExcelJS, React Router, TanStack Table, React Hook Form ou Zod sem decisão formal;
- não apagar dados, histórico, backups ou deployments sem inventário e autorização específica.

---

# 2. RESULTADO FINAL ESPERADO

Ao final do plano, a Central de Demandas deve deixar de operar como cadastro pesquisável e funcionar como central diária do CTRH. Cada pessoa deve identificar rapidamente sua carteira, a próxima providência, riscos, esperas externas, cadastros incompletos e relatórios necessários, sem reconstruir controles paralelos.

| Eixo | Resultado final |
|---|---|
| Identidade operacional | Responsáveis internos por UUID, externos preservados e não atribuídos explícitos. |
| Ação diária | Página Meu Trabalho por papel e fila consolidada de prioridades. |
| Prazos | Definido, não informado e não aplicável, sem confundir vazio com atraso. |
| Continuidade | Próxima ação e data para toda nova demanda ou legado operacionalizado. |
| Auditoria | Andamento separado de status, autoria, antes/depois, exclusão lógica e restauração. |
| Consulta | Busca preservada com paginação e histórico sob demanda. |
| Relatórios | Sete modelos Excel coerentes com o recorte e a semântica da aplicação. |
| Gestão | Painel de estoque, fluxo, risco e cobertura sem inferência falsa de produtividade. |
| Personalização | Preferências e visões isoladas por usuário. |
| Acesso | Recuperação de senha e política de autenticação consistente. |
| Operação | E2E Supabase, observabilidade, release reproduzível, rollback e contrato final. |

---

# 3. RECONCILIAÇÃO DO PLANO MESTRE V1.0

Os Ciclos 0 a 4 foram executados em ordem e estão encerrados. Existem fundamentos antecipados dos Ciclos 5 a 7 e parte da contração originalmente prevista para o Ciclo 13, mas nenhum dos Ciclos 5 a 12 foi integralmente entregue ao usuário.

| Ciclo v1 | Estado real | Decisão no v2 |
|---:|---|---|
| 0 — Linha de base e decisões | Concluído | Não refazer. |
| 1 — Proteção do bundle | Concluído | Preservar e revalidar no R12. |
| 2 — Semântica e filtros | Concluído | Preservar; corrigir somente resíduos de UX. |
| 3 — Expansão do modelo | Concluído na fase aditiva | Validar constraints no R1/R12. |
| 4 — Mutações e auditoria | Concluído tecnicamente | Expor a experiência no R5. |
| 5 — Responsabilidade | Fundação parcial | Executar como R3. |
| 6 — Prazos e saneamento | Fundação parcial | Executar como R4. |
| 7 — Andamento e prontuário | Backend pronto; UI ausente | Executar como R5. |
| 8 — Meu Trabalho | Não implementado; antecessor limitado | Executar como R6. |
| 9 — Relatórios | Exportador predecessor existente | Executar como R7. |
| 10 — Painel gerencial | Dashboard predecessor existente | Executar como R8. |
| 11 — Preferências | Não implementado | Executar como R9. |
| 12 — Acesso e login | Identidade parcial; reset ausente | Executar como R10. |
| 13 — Contrato final | Parcialmente antecipado | Concluir somente no R12. |

## 3.1 Elementos que não devem ser recriados

- índice único normalizado do número da demanda;
- semântica central de status e filtros tipados;
- campos de responsável por UUID, situações de prazo, próxima ação, origem e exclusão lógica;
- RPCs `criar_sme_demanda_v2`, `editar_sme_demanda`, `registrar_andamento_sme_demanda`, `transicionar_status_sme_demanda`, `excluir_sme_demanda`, `restaurar_sme_demanda` e `listar_perfis_minimos`;
- bloqueio de `UPDATE` e `DELETE` diretos para `authenticated`;
- busca multi-termo, busca aproximada explicável, URLs compartilháveis, Excel atual, RLS, Realtime e responsividade existentes.

As RPCs v1 `criar_sme_demanda` e `atualizar_status_sme_demanda` permanecem temporariamente executáveis e só serão revogadas no R12.

---

# 4. LINHA DE BASE DE PRODUÇÃO — 23/07/2026

| Indicador | Resultado |
|---|---:|
| Demandas | 379 |
| Demandas visíveis / não excluídas | 379 |
| Demandas logicamente excluídas | 0 |
| Demandas não encerradas | 377 |
| Históricos | 385 |
| Perfis | 5 |
| Demandas de origem `sistema` | 0 |
| Demandas com `responsavel_id` | 0 |
| Demandas com responsável textual | 379 |
| Não encerradas sem próxima ação | 377 |
| Não encerradas sem data de acompanhamento | 377 |
| Prazo interno não informado | 369 |
| Prazo final não informado | 354 |
| Prazo marcado não se aplica | 0 |
| Eventos de criação | 379 |
| Eventos de mudança de status | 6 |
| Eventos de andamento, edição, reatribuição, exclusão ou restauração | 0 |
| Tabelas de preferências ou visões | 0 |
| Grupos duplicados após normalização | 0 |

Constraints pendentes de validação formal:

- `sme_demandas_limite1_consistencia_check`;
- `sme_demandas_limite2_consistencia_check`;
- `sme_demandas_exclusao_logica_check`;
- `sme_demandas_origem_check`;
- `sme_historico_tipo_evento_check`.

Achados pós-Supabase incorporados ao plano:

- carregamento integral de todas as demandas e de todo o histórico;
- recargas redundantes após RPC e eventos Realtime;
- ausência de concorrência otimista pelo `updated_at` esperado;
- E2E de navegador executado somente no modo local;
- proteção contra senhas comprometidas desabilitada;
- ausência de Error Boundary e observabilidade sanitizada;
- CI sem gatilho de `push` para `main`;
- publicação dependente de alternância temporária de `deploymentEnabled` no `vercel.json`.

---

# 5. SEQUÊNCIA REMANESCENTE

| Ordem | Ciclo | Produto independente | Dependência | Estado |
|---:|---|---|---|---|
| R0 | Rebaseline oficial | Plano v2, AGENTS e HANDOFF canônicos | nenhuma | concluído neste PR |
| R1 | Integridade e concorrência | contrato de dados validado e edição concorrente segura | R0 | pendente |
| R2 | Consulta escalável e E2E Supabase | paginação, histórico sob demanda e testes remotos | R1 | pendente |
| R3 | Responsabilidade por UUID | carteira pessoal confiável | R2 | pendente |
| R4 | Prazos e saneamento | qualidade de dados e próxima providência | R3 | pendente |
| R5 | Andamento e prontuário | linha do tempo, links e lixeira utilizáveis | R4 | pendente |
| R6 | Meu Trabalho e alertas | página inicial preventiva por papel | R5 | pendente |
| R7 | Central de Relatórios | sete modelos Excel | R4–R6 | pendente |
| R8 | Painel gerencial | estoque, fluxo, risco e cobertura | R5–R7 | pendente |
| R9 | Preferências e visões | personalização persistida | R3, R6, R8 | pendente |
| R10 | Recuperação e segurança de acesso | reset autônomo e login simplificado | R2 | pendente |
| R11 | Observabilidade e release | diagnóstico e publicação reproduzível | R2–R10 | pendente |
| R12 | Contrato e homologação final | contração, documentação e produção | todos | pendente |

A ordem é vinculante. R12 é a única etapa autorizada a revogar APIs legadas.

---

# 6. CICLOS REMANESCENTES DETALHADOS

## CICLO R0 — Rebaseline oficial e congelamento da linha de base

**Status:** concluído neste PR.

### Objetivo

Transformar a reconciliação em contrato executável e impedir que agentes futuros refaçam ciclos encerrados ou iniciem o antigo Ciclo 5.

### Entregas

- este Plano Remanescente v2.0;
- atualização de `AGENTS.md`;
- atualização de `docs/HANDOFF.md`;
- preservação do Plano Mestre v1.0 como histórico;
- registro da linha de base e do próximo ciclo R1.

### Critério de aceite

Um novo executor identifica sem recorrer ao histórico do chat: o que já existe, o que não deve ser refeito, o que está apenas preparado, o que ainda falta e a ordem exata dos ciclos.

### Rollback

Reverter somente o commit documental. Nenhum banco, dado, frontend ou deployment é alterado.

---

## CICLO R1 — Integridade, domínio de dados e concorrência otimista

### Objetivo

Concluir a robustez estrutural do banco antes de ampliar o volume de uso e a experiência da interface.

### Escopo obrigatório

1. consultar violações das cinco constraints `NOT VALID`;
2. executar `VALIDATE CONSTRAINT` somente quando a consulta retornar zero;
3. preservar e testar o índice normalizado existente;
4. alinhar limites máximos entre banco e Zod para número, assunto, responsável externo, setor, classificação, comentário, próxima ação, justificativas e link;
5. validar `link_origem` como vazio ou HTTPS permitido;
6. reconciliar valores reais de classificação antes de criar domínio no banco;
7. adicionar índices de FK efetivamente necessários, incluindo `deleted_by`;
8. implementar concorrência otimista: mutações recebem `updated_at` esperado, comparam sob bloqueio e rejeitam conflito sem alterar demanda ou histórico;
9. atualizar tipos gerados do Supabase;
10. executar replay integral das migrations e consultas de invariantes;
11. manter RPCs v1 e v2 disponíveis; não executar contração.

### Testes mínimos

- zero violações antes da validação;
- mesmas contagens antes/depois;
- zero órfãos e zero duplicidades normalizadas;
- limites exatos aceitos e valores acima recusados no cliente e banco;
- URL inválida recusada;
- duas edições sobre a mesma versão: a segunda recebe conflito e não sobrescreve;
- replay de migrations do zero aprovado.

### Critérios de aceite

Todas as constraints elegíveis ficam validadas, nenhum dado é truncado, o frontend atual permanece compatível e conflitos concorrentes deixam de ser silenciosos.

### Paradas

Violação de constraint, classificação não reconhecida, divergência de contagens, backup ilegível ou drift entre migrations e banco remoto.

### Rollback

Migration inversa versionada para grants, assinaturas e constraints; manter colunas e dados do schema expandido.

---

## CICLO R2 — Consulta escalável, histórico sob demanda e E2E Supabase

### Objetivo

Eliminar o carregamento integral e provar a aplicação contra Supabase real ou efêmero.

### Contratos-alvo

```ts
listDemandas(query): Promise<{ items: Demanda[]; total: number; page: number; pageSize: number }>;
getDemanda(id): Promise<Demanda | null>;
listHistorico(demandaId): Promise<ComentarioHistorico[]>;
listRecentHistory(limit): Promise<ComentarioHistorico[]>;
listTrash(query): Promise<{ items: Demanda[]; total: number }>;
```

### Escopo obrigatório

- paginação real no servidor e ordenação determinística;
- busca exata preservando múltiplos termos, número normalizado, assunto, responsável, setor, classificação, status e histórico;
- ranking aproximado apenas sobre conjunto limitado quando não houver resultado exato;
- histórico completo carregado apenas no detalhe ou relatório que o exija;
- consulta específica de últimas movimentações;
- exportação e métricas sobre todo o recorte, não só a página visual;
- coalescência de eventos Realtime;
- cancelamento ou descarte de respostas obsoletas;
- estados conectado, reconectando, desatualizado e erro de sincronização;
- E2E Supabase para administrador, editor, leitor e usuário inativo;
- testes de RLS, RPC, Realtime, erro de rede e retomada;
- base sintética de capacidade com 10.000 demandas e 50.000 eventos;
- CI protegido sem exposição de segredos.

### Critérios de aceite

Paridade integral da busca, paginação sem omissão/duplicidade, uma mutação sem recargas integrais redundantes, histórico de outra demanda não transferido sem necessidade e E2E remoto aprovado nos quatro estados de usuário.

### Paradas

Perda de comportamento da busca, total divergente, segredo em log, RLS permissiva ou ambiente efêmero não destrutível com segurança.

### Rollback

Reverter frontend e queries preservando o schema do R1. O teste remoto pode ser temporariamente desabilitado somente por incidente documentado, nunca mesclado sem evidência funcional equivalente.

---

## CICLO R3 — Responsabilidade por UUID e Minhas demandas

### Objetivo

Entregar carteira pessoal confiável sem perder responsáveis externos ou o legado textual.

### Escopo obrigatório

- componente `ResponsavelField` com opções interno, externo e não atribuído;
- perfil interno ativo por UUID e snapshot textual atualizado pela RPC;
- externo com UUID nulo e nome explícito;
- não atribuído com UUID nulo e texto vazio;
- evento de reatribuição com anterior e novo;
- escopo `equipe/meu`, filtro por UUID e filtro sem responsável;
- botão Minhas demandas e URL `scope=meu` ou `responsavel=<uuid>`;
- rótulos claros para interno, externo e não atribuído;
- script de preparação do mapa legado com dry-run, ambiguidades e hash;
- geração do CSV fora do Git;
- nenhuma aplicação do mapa neste ciclo.

### Testes mínimos

Homônimos com UUIDs distintos, troca de login, externo, não atribuído, leitor sem mutação, URL round-trip e mapa sem escolha automática em ambiguidade.

### Critérios de aceite

Cada pessoa vê somente sua carteira por UUID; externos e não atribuídos continuam localizáveis; nenhum texto histórico é perdido; nenhuma sugestão do legado é aplicada automaticamente.

### Paradas

Mapa ambíguo, perfil sugerido inativo ou qualquer uso de nome textual para formar a carteira pessoal.

### Rollback

Reverter a interface e manter `responsavel_id` nulo no legado. Não desfazer eventos de reatribuição válidos.

---

## CICLO R4 — Prazos, próxima ação e saneamento assistido

### Objetivo

Distinguir aplicabilidade de prazo, tornar a próxima providência visível e organizar a qualidade do legado sem inventar dados.

### Escopo obrigatório

- componente com `definido`, `nao_informado` e `nao_se_aplica`;
- justificativa útil para não se aplica;
- confirmação ao descartar data existente;
- rejeição de prazo interno posterior ao final quando ambos definidos;
- próxima ação e data obrigatórias em nova demanda não encerrada, andamento, transição não encerrada e primeira edição de legado incompleto;
- seção Próxima providência antes de Prazos no drawer;
- próxima ação e data na tabela desktop e mobile;
- painel de qualidade com responsável não vinculado, sem responsável, prazo interno/final não informado, sem próxima ação, sem data e somente evento inicial;
- cada item abre a demanda correspondente;
- scripts de preparação/aplicação com dry-run, hash, idempotência e RPC auditável;
- aplicação do mapa de responsáveis somente após aprovação expressa;
- marcador aditivo de operacionalização do legado;
- Excel atual distinguindo as três situações de prazo.

### Critérios de aceite

Nenhum vazio vira atraso; não se aplica conta como classificado; toda demanda nova cumpre o contrato; todo legado movimentado passa a cumpri-lo; o restante permanece visível na fila sem inferência.

### Paradas

Saneamento exige inventar prazo, responsável ou justificativa; arquivo aprovado diverge do hash; aplicação altera registro fora das decisões aprovadas.

### Rollback

Reverter UI e scripts, preservando decisões válidas e eventos auditáveis. Nunca apagar saneamento correto para restaurar estado antigo.

---

## CICLO R5 — Andamento, prontuário, links e lixeira

### Objetivo

Tornar utilizáveis todas as capacidades auditáveis já existentes no banco.

### Escopo obrigatório

- `ModalAndamento` com comentário, próxima ação, data e status somente leitura;
- andamento não altera status;
- modal de status não oferece o status atual;
- Sobrestado exige motivo e data de revisão;
- componente `HistoryEvent` exibindo tipo, data/hora, autor, status anterior/resultante, comentário, setor e alterações antes/depois;
- Autor não identificado para legado sem autoria;
- ordem das ações: Registrar andamento, Alterar status, Editar dados, Copiar link, Abrir origem, Fechar;
- copiar link preservando query e fallback selecionável;
- abrir sistema de origem somente quando houver URL válida;
- retorno pós-login à rota profunda;
- rota administrativa da lixeira;
- exclusão lógica e restauração com autor, data e motivo;
- conflito concorrente do R1 tratado na interface;
- preservação de filtros, rota e foco ao abrir/fechar modais.

### Critérios de aceite

Editor registra trabalho sem falsificar mudança de status; administrador exclui/restaura; leitor não vê mutações; histórico responde quem, quando, o quê e por quê; nenhuma exclusão física é usada.

### Paradas

Andamento altera status, leitor executa RPC, link contorna autenticação ou restauração perde histórico.

### Rollback

Reverter UI e manter RPCs, demanda e eventos. Não apagar eventos válidos.

---

## CICLO R6 — Meu Trabalho e motor preventivo de alertas

### Objetivo

Transformar a página inicial em fila diária personalizada e preventiva.

### Regras iniciais

```ts
urgentWindowDays: 3;
attentionWindowDays: 15;
actionableIdleDays: 7;
externalWaitingReviewDays: 15;
signatureIdleDays: 3;
```

### Escopo obrigatório

- sinais crítico, urgente, atenção, assinatura parada, providência parada, espera externa e cadastro incompleto;
- vários sinais da mesma demanda consolidados em uma linha;
- severidade principal e chips adicionais;
- ordenação por severidade, data mais antiga, tempo parado e número;
- editor: Em acompanhamento comigo, Com providência, Atrasadas e Próximos sete dias;
- administrador: equipe/minha carteira, Sem responsável, Sem próxima ação e link para qualidade;
- leitor: entrada voltada à consulta;
- fila de até dez itens prioritários e próximas ações cronológicas;
- todos os cartões abrem exatamente o recorte contado;
- substituição do componente legado `AtencaoImediata`;
- nenhuma linguagem de produtividade individual.

### Testes obrigatórios

Ano bissexto, virada de mês, hoje não vencido, bordas 3/4/15/16 dias, assinatura 2/3 dias, Encerrado sem alerta, não se aplica sem alerta de ausência, múltiplos sinais em uma linha, homônimo sem UUID fora de Meu e ordenação estável.

### Critérios de aceite

Editor identifica sua primeira providência em até dez segundos; administrador identifica riscos da equipe; cartão e destino possuem a mesma contagem; Tramitado não vira providência CTRH.

### Rollback

Reativar temporariamente o antecessor somente se o motor novo for retirado integralmente; não manter dois motores produzindo contagens divergentes.

---

## CICLO R7 — Central de Relatórios Excel

### Objetivo

Transformar o exportador atual em catálogo de sete relatórios sem reconstruir estilos e proteções já maduros.

### Modelos obrigatórios

1. Minha carteira;
2. Prazos e riscos;
3. Gerencial consolidado;
4. Por responsável;
5. Movimentações do período;
6. Demanda individual;
7. Mensal estoque e fluxo.

### Escopo obrigatório

- extrair estilos e construtores do exportador atual;
- catálogo de presets e validação de parâmetros;
- rota `/relatorios`;
- exportar todo o recorte independentemente da paginação;
- Minha carteira por UUID;
- linha do tempo no dossiê individual;
- metadados de modelo, período, filtros, usuário, versão, data e fonte;
- identidade mensal: estoque inicial + entradas + reaberturas - encerramentos = estoque final;
- neutralização de formula injection em todas as células textuais;
- datas como células de data em formato brasileiro;
- importação dinâmica do ExcelJS e preservação do orçamento do bundle;
- adaptador temporário do exportador existente para o preset consolidado.

### Critérios de aceite

Sete workbooks gerados e reabertos com ExcelJS; inspeção manual de Minha carteira, Prazos e riscos e Mensal; nenhum relatório usa somente a página visível; tela e Excel usam o mesmo recorte; volume nunca é apresentado como produtividade.

### Paradas

Workbook corrompido, aba divergente do catálogo, relatório omitindo páginas ou diferença entre recorte da tela e Excel.

### Rollback

Desabilitar somente o preset afetado e preservar o exportador consolidado estável.

---

## CICLO R8 — Painel gerencial, fluxo e cobertura

### Objetivo

Substituir a visão geral atual por informação gerencial confiável e compartilhada com o Excel.

### Escopo obrigatório

- módulo único de métricas operacionais consumido por painel e relatórios;
- estoque em acompanhamento, providência CTRH, espera externa, sobrestadas e encerradas;
- riscos: vencidas, hoje, próximos 3 e 15 dias e paradas;
- fluxo: estoque inicial, entradas, encerramentos, reaberturas e estoque final;
- distribuição da carteira por responsável com volume normal e em risco;
- cobertura de responsável, prazo, próxima ação, histórico e elegibilidade temporal;
- amostra insuficiente quando houver menos de dez casos elegíveis;
- numerador e denominador em texto acessível;
- todo indicador clicável e ligado ao recorte exato;
- remoção de “Setores mais Ativos” e de qualquer semântica de produtividade;
- nenhuma biblioteca nova de gráficos.

### Critérios de aceite

Painel e relatório equivalente não divergem; registros legados não sustentam média indevida; cobertura baixa apresenta advertência; cartões e listas possuem contagens idênticas.

### Paradas

Métrica não pode ser calculada conforme definição, painel e Excel divergem ou uma visualização induz interpretação de desempenho individual.

### Rollback

Reverter o painel e manter o módulo de métricas somente se suas funções puras permanecerem comprovadamente corretas e sem call sites divergentes.

---

## CICLO R9 — Preferências e visões salvas por login

### Objetivo

Persistir a configuração de cada usuário sem vazamento entre contas.

### Escopo obrigatório

- tabelas de preferências e visões com RLS por `auth.uid()`;
- página inicial, escopo, tamanho 10/25/50 e visão padrão;
- defaults: administrador Meu Trabalho/equipe, editor Meu Trabalho/meu, leitor Demandas/equipe;
- Salvar visão quando houver filtro ativo;
- aplicar visão substituindo filtros e atualizando URL;
- renomear, substituir e excluir com confirmação;
- máximo de vinte visões;
- nome único sem distinção de caixa;
- um default por usuário;
- chave futura desconhecida ignorada com aviso não bloqueante;
- estado limpo no logout;
- modo local namespaced pelo usuário sintético.

### Critérios de aceite

Usuário A não lê nem altera preferência de B por UI ou chamada direta; relogin restaura o ambiente; URL continua compartilhável; troca de conta não apresenta conteúdo da sessão anterior.

### Paradas

RLS permite acesso cruzado, preferência de um login pisca em outro ou versão incompatível quebra a aplicação.

### Rollback

Desabilitar a UI e manter as tabelas aditivas; não apagar preferências válidas em incidente de frontend.

---

## CICLO R10 — Recuperação de senha e segurança de autenticação

### Objetivo

Completar a autonomia de acesso e alinhar navegador, serviço e Supabase Auth.

### Escopo obrigatório

- solicitar reset com resposta neutra;
- rota `/redefinir-senha`;
- tratamento de `PASSWORD_RECOVERY`;
- atualização de senha e encerramento da sessão de recuperação;
- orientação para link expirado;
- redirects exatos de Production e Preview;
- homologação de envio real;
- simplificação da coluna institucional: marca e uma frase curta, sem os três blocos atuais;
- orientação persistente sobre aprovação administrativa;
- mesma política de senha no cliente, serviço e Supabase;
- ativação de proteção contra senhas comprometidas;
- confirmação da política de e-mail;
- SMTP institucional ou serviço autorizado antes da abertura ampla;
- prevenção de enumeração de contas.

### Critérios de aceite

Usuário redefine senha sem suporte técnico; conta inexistente não é revelada; link válido, expirado, usuário pendente e inativo possuem comportamento homologado; login continua acessível em desktop e mobile.

### Paradas

Ausência de permissão para redirects, SMTP, confirmação de e-mail ou política de senha; nunca inventar domínio ou e-mail de suporte.

### Rollback

Retirar os links de recuperação mantendo o login anterior; não deixar rota parcialmente funcional apontando para redirect inválido.

---

## CICLO R11 — Observabilidade, segurança do frontend e processo de release

### Objetivo

Tornar falhas diagnosticáveis e a publicação reproduzível.

### Escopo obrigatório

- Error Boundary global;
- captura de falhas não tratadas e rejeições assíncronas;
- telemetria sanitizada sem assunto, processo, comentário, e-mail completo ou conteúdo operacional;
- versão/release visível e estado do Realtime;
- ação de tentar novamente;
- Content-Security-Policy, `X-Content-Type-Options`, proteção contra framing, Referrer-Policy e Permissions-Policy;
- revisão de margem do bundle, fontes, Font Awesome, módulos administrativos e relatórios;
- CI também em `push` para `main`;
- release que publique o SHA homologado sem alternar `vercel.json`;
- registro de deployment e rollback;
- Preview vinculado ao PR;
- advisors de segurança e performance após migrations;
- correção dos índices de FK relevantes.

### Critérios de aceite

Erro React não resulta em tela vazia sem orientação; Production identifica o SHA; release não exige commit temporário de configuração; CSP permite apenas recursos legítimos; CI protege PR e main; rollback é executável.

### Paradas

Telemetria expõe dado operacional, CSP bloqueia Supabase ou UI legítima, release publica SHA diferente do homologado ou rollback depende de edição manual não versionada.

### Rollback

Reverter headers/observabilidade ou deployment pela automação documentada; preservar versão estável e não reabrir publicação por alternância de arquivo.

---

## CICLO R12 — Contrato final, homologação integral e produção

### Objetivo

Encerrar a transição somente após comprovar o produto completo.

### Escopo de contrato

- remover `LegacyCreateDemandaInput`, `update`, `updateStatus`, `delete` e fallbacks de schema já desnecessários;
- revogar execução de `criar_sme_demanda` e `atualizar_status_sme_demanda` sem dropar no mesmo release;
- validar constraints remanescentes;
- formalizar próxima ação: nova demanda e legado operacionalizado cumprem sempre; legado não revisado permanece na fila;
- atualizar tipos gerados e executar replay do banco do zero;
- criar migration de contrato e migration de rollback versionada.

### Homologação por papel

**Administrador:** aprovar perfil, alternar equipe/minha, sanear, excluir, consultar lixeira, restaurar, gerar relatório, consultar qualidade e salvar visão.

**Editor:** abrir Minha carteira, criar demanda, registrar andamento, alterar status, editar, reatribuir, gerar relatório pessoal e salvar visão.

**Leitor:** pesquisar, filtrar, abrir link direto, copiar link, consultar prontuário, exportar modelos permitidos e não executar mutação.

### Gates finais

- CI verde no SHA candidato;
- Preview do mesmo SHA;
- E2E local e Supabase;
- viewports 1440×900, 390×844 e 360×800;
- axe sem violações críticas ou sérias;
- sete relatórios válidos;
- alertas comparados a dataset conhecido;
- painel e Excel reconciliados;
- backup e restauração ensaiados;
- rollback documentado;
- Realtime em duas sessões;
- nenhum dado real no bundle;
- RLS e chamadas diretas testadas por papel;
- advisors revisados.

### Deployments antigos

Inventariar deployment, URL, SHA, estado e evidência; testar canários; preservar versões necessárias ao rollback; solicitar autorização específica antes de qualquer exclusão; remover somente alvos exatos autorizados.

### Critérios de aceite

Nenhuma API legada permite mutação fora da trilha; o contrato de próxima ação não possui exceção silenciosa; documentação corresponde ao ambiente real; Production serve o SHA homologado; deployments antigos só são removidos quando inventariados e autorizados.

### Paradas

Qualquer gate falha, backup/restauração não é comprovado, RLS/Auth/Realtime diverge entre Preview e Production ou uma ação destrutiva não possui autorização.

### Rollback

Em falha de frontend, reverter deployment mantendo schema e eventos. Em falha após contração, aplicar migration de rollback versionada que restaure grants/RPCs; nunca editar manualmente sem registro.

---

# 7. MATRIZ DE RASTREABILIDADE

## 7.1 Requisitos originais

| IDs | Requisitos | Cobertura v2 |
|---|---|---|
| R01–R02 | Bundle sem dados reais e modo local bloqueado | concluídos; R12 revalida |
| R03–R04 | Semântica única e Tramitado correto | concluídos; gate transversal |
| R05–R07 | UUID, externo, não atribuído e Minhas | R3 |
| R08–R09 | Situação de prazo e próxima ação | R4 e R12 |
| R10–R12 | Andamento, autoria e exclusão recuperável | R5 e R12 |
| R13–R16 | Alertas e personalização por papel | R6 |
| R17 | Busca preservada | R2 e gate transversal |
| R18 | Responsável e escopo | R3 |
| R19–R20 | Link compartilhável e origem | R1 e R5 |
| R21–R24 | Sete relatórios, mensal e não produtividade | R7 e R8 |
| R25 | Métricas com cobertura | R8 |
| R26–R27 | Visões, preferências e paginação | R2 e R9 |
| R28–R29 | Recuperação e login simplificado | R10 |
| R30 | Acessibilidade desktop/mobile | todos; R12 fecha |
| R31 | Expandir antes de contrair | R1–R11; contração no R12 |
| R32 | Backup e rollback | R1 e R12 |

## 7.2 Requisitos adicionais pós-Supabase

| ID | Requisito | Ciclo |
|---|---|---|
| N01 | Paginação real e histórico sob demanda | R2 |
| N02 | Busca escalável com paridade | R2 |
| N03 | Exportação independente da página | R2 e R7 |
| N04 | Coalescência de Realtime | R2 |
| N05 | Cancelamento de respostas obsoletas | R2 |
| N06 | Concorrência otimista | R1 e R5 |
| N07 | Limites e domínios no banco | R1 |
| N08 | Validação das constraints | R1 e R12 |
| N09 | E2E com Supabase | R2 e R12 |
| N10 | Lixeira visual | R5 |
| N11 | Proteção contra senhas comprometidas | R10 |
| N12 | Confirmação de e-mail e SMTP | R10 |
| N13 | Error Boundary e diagnóstico | R11 |
| N14 | Estado da sincronização | R2 e R11 |
| N15 | CSP e cabeçalhos | R11 |
| N16 | CI em main | R11 |
| N17 | Release sem alternância do vercel.json | R11 |
| N18 | Tipos Supabase sem drift | R1 e R12 |
| N19 | Inventário de deployments antigos | R12 |
| N20 | Remoção autorizada de versões expostas | R12 |

Todos os 32 requisitos originais e os 20 requisitos pós-Supabase possuem ciclo responsável.

---

# 8. MATRIZ GLOBAL DE TESTES FUNCIONAIS

| Caso | Preparação | Resultado esperado |
|---|---|---|
| Minha carteira | Dois perfis homônimos e UUIDs distintos | Login A mostra somente UUID A. |
| Prazo não aplicável | Sem data e justificativa válida | Não gera atraso; cobertura classificada. |
| Prazo não informado | Sem data | Aparece em qualidade, nunca como vencida. |
| Andamento | Demanda em acompanhamento | Status igual; novo evento andamento. |
| Transição | Mudar para Tramitado | Evento anterior/novo e data de acompanhamento. |
| Encerramento | Próxima ação preenchida | Próxima ação limpa; evento preservado. |
| Conflito | Duas edições sobre a mesma versão | Segunda recusada sem sobrescrever. |
| Exclusão | Administrador exclui | Some da lista e aparece na lixeira. |
| Restauração | Item na lixeira | Volta à lista e registra restauração. |
| Alerta múltiplo | Vencida, parada e sem responsável | Uma linha, severidade principal e chips. |
| Deep link | Deslogado abre `/demandas/1` | Após login retorna ao drawer 1. |
| Paginação | Mais de uma página | Sem duplicidade/omissão; total estável. |
| Exportação | Recorte com várias páginas | Workbook contém todo o recorte. |
| Relatório mensal | Dataset fechado | Identidade de estoque fecha. |
| Reset | Link válido e expirado | Sucesso ou orientação neutra. |

## 8.1 Papéis

| Operação | Administrador | Editor | Leitor |
|---|---:|---:|---:|
| Consultar, pesquisar e filtrar | sim | sim | sim |
| Exportar modelos permitidos | sim | sim | sim |
| Criar, editar, andamento e status | sim | sim | não |
| Excluir e restaurar | sim | não | não |
| Gerenciar perfis | sim | não | não |
| Qualidade de dados | sim | não | não |
| Preferências próprias | sim | sim | sim |

## 8.2 Viewports e acessibilidade

- desktop Chromium 1440×900 ou superior;
- mobile principal 390×844;
- mobile estreito 360×800;
- nenhum fluxo crítico com overflow horizontal da página;
- tabelas roláveis somente dentro de região rotulada e navegável;
- axe sem violações críticas ou sérias;
- foco, Escape, restauração de foco, reduced motion e contraste verificados.

---

# 9. DEFINIÇÃO GLOBAL DE PRONTO

Um ciclo está pronto somente quando:

- o agente leu AGENTS, PRODUCT_CONTEXT, Plano v2, ADRs e HANDOFF;
- o gate de produto foi registrado antes e depois;
- testes RED falharam pelo motivo esperado;
- testes específicos e gate integral passaram sem omissões;
- migrations foram aplicadas em ambiente seguro e reproduzidas do zero;
- UI foi validada nos três viewports e com acessibilidade;
- contagem de cartão corresponde ao destino filtrado;
- nenhum dado real entrou em código, fixture ou artefato;
- o diff não mistura outro ciclo;
- documentação e rollback foram atualizados;
- PR, Preview e SHA correspondem;
- o cenário real foi homologado e não induz controle paralelo;
- Production foi validada quando o ciclo autoriza publicação.

> Compilar, passar em um teste unitário ou executar uma migration não basta isoladamente. Correção técnica e correção de produto são gates independentes.

---

# 10. CONDIÇÕES DE PARADA OBRIGATÓRIA

O executor deve parar e preservar o estado quando:

1. repositório, main ou ambiente não puderem ser identificados com segurança;
2. houver alterações conflitantes nos mesmos arquivos;
3. main tiver evoluído de forma incompatível com o ciclo;
4. backup não puder ser obtido e lido antes de migration material;
5. contagens, hashes, órfãos ou duplicidades divergirem;
6. mapa de responsáveis ou saneamento exigir decisão ambígua;
7. busca nova não reproduzir os casos caracterizados;
8. paginação divergir do total ou exportação omitir páginas;
9. RLS permitir operação indevida;
10. Preview não corresponder ao SHA do PR;
11. CI, bundle, E2E ou acessibilidade falharem;
12. painel e Excel produzirem números diferentes;
13. Auth exigir domínio, e-mail ou redirect inventado;
14. ação exigir apagar dado, histórico ou deployment sem autorização;
15. métrica não puder ser calculada conforme a definição fixada.

A incompletude esperada do legado não é condição de parada, desde que a fila de qualidade a identifique, nenhuma inferência seja aplicada e a operação nova cumpra integralmente o contrato.

---

# 11. FORMATO OBRIGATÓRIO DE RELATO APÓS CADA CICLO

```text
Ciclo: Rn — nome
Branch:
Commit(s):
Pull request:
Preview e SHA:
Pessoa / dor / cenário:
Entregas realizadas:
Escopo excluído:
Arquivos e migrations:
Testes RED:
Gate técnico integral:
E2E / acessibilidade / viewports:
Impacto em dados e invariantes:
Homologação de produto:
Rollback:
Riscos remanescentes:
Production (quando aplicável):
Próximo ciclo autorizado:
```

---

# 12. HISTÓRICO DE ALTERAÇÕES

| Versão | Data | Alteração | Status |
|---:|---|---|---|
| 1.0 | 21/07/2026 | Plano Mestre inicial, Ciclos 0 a 13. | histórico |
| 2.0 | 23/07/2026 | Reconciliação do estado real, encerramento dos Ciclos 0–4 e criação dos Ciclos R0–R12. | aprovado |

> **PRÓXIMA AÇÃO AUTORIZADA:** após o merge documental deste rebaseline, iniciar exclusivamente o **CICLO R1 — Integridade, domínio de dados e concorrência otimista**.

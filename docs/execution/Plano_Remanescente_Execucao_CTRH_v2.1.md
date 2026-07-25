# PLANO REMANESCENTE DE EXECUÇÃO — CENTRAL DE DEMANDAS CTRH

## Reconciliação pós-R3 e retomada cronológica dos ciclos estruturantes

**Versão:** 2.1  
**Data de corte:** 25 de julho de 2026  
**Status:** REFERÊNCIA VIGENTE SOB GOVERNANÇA CICLO A CICLO  
**Produto:** Central de Demandas — CTRH / SME-RJ  
**Repositório:** `WilsonMPeixoto-2/demandas-rhsme-expansao`  
**Produção:** `https://demandas-rhsme-expansao.vercel.app/`  
**Banco:** Supabase — CTRH PROCESSOS

> Este documento substitui o Plano Remanescente v2.0 como roteiro de sequência, dependências e trabalho possível. O v2.0 e o Plano Mestre v1.0 permanecem históricos. Nenhum ciclo ou item deste plano constitui autorização automática de implementação.

---

# 1. AUTORIDADE E GOVERNANÇA

## 1.1 Ordem obrigatória de leitura

1. `AGENTS.md`;
2. `docs/execution/ADENDO_GOVERNANCA_POR_ETAPA_CTRH_v2.0.3.md`;
3. `docs/product/PROTOCOLO_HOMOLOGACAO_DECISOES_PRODUTO_CTRH_v1.2.md`;
4. `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md`;
5. `docs/product/POLITICA_SINCRONIZACAO_DOCUMENTAL_CTRH_v1.0.md`;
6. `docs/PRODUCT_CONTEXT.md`;
7. este Plano Remanescente v2.1;
8. ADRs e documentação técnica aplicável;
9. `docs/HANDOFF.md`;
10. documentos anteriores apenas como história da evolução.

## 1.2 Precedência

Em matéria de produto, prevalece a decisão expressa mais recente registrada. Em matéria de autorização, prevalecem o Adendo e o Protocolo vigentes. Este plano organiza o trabalho possível, mas não substitui a aprovação item a item.

Quando um documento histórico contiver regra diferente, a decisão posterior registrada prevalece. A divergência deve ser corrigida nos documentos vigentes antes de nova implementação relacionada.

## 1.3 Sincronização documental

Toda alteração de lógica, regra de negócio, permissão, obrigatoriedade, cálculo, dado, rota ou comportamento visível deve atualizar no mesmo PR:

- Registro de Decisões;
- Product Context;
- Plano Remanescente vigente;
- AGENTS, quando houver obrigação permanente;
- ADR e documentação técnica afetados;
- Handoff;
- documentos históricos que necessitem nota de superação.

A entrega não está pronta enquanto código, banco e documentação vigente descrevem regras diferentes.

## 1.4 Disciplina vinculante

- branch própria e um pacote publicável por PR;
- debate e decisão antes de implementação;
- testes de caracterização e RED antes de mudança de comportamento;
- menor solução completa, sem refatoração oportunista;
- Preview no mesmo SHA do PR;
- migrations exclusivamente versionadas;
- preservação de busca, Excel, acessibilidade, responsividade, RLS, Realtime e rotas;
- atualização documental e Handoff antes do merge;
- nenhum ciclo seguinte começa sem homologação ou autorização expressa.

---

# 2. REGRAS PERMANENTES DE PRODUTO E DADOS

- `Tramitado` permanece em acompanhamento, representa espera externa e não equivale a encerramento.
- Ausência de prazo não é atraso.
- `responsavel_id` é a identidade oficial do responsável.
- Novas demandas e futuras reatribuições usam usuário cadastrado por UUID ou permanecem sem responsável.
- Responsável externo e nome livre não são opções vigentes de cadastro ou reatribuição.
- Informação textual legada sem UUID pode ser preservada, sem virar opção futura.
- `Vanessa Migrado` permanece como exceção histórica conhecida sem UUID.
- `/demandas` é a carteira da equipe.
- `/minhas-demandas` é a carteira pessoal por UUID.
- `escopo=meu` é apenas compatibilidade legada e redireciona para `/minhas-demandas`.
- Andamento não altera status.
- Toda mutação operacional usa RPC nomeada e auditável.
- Exclusão é lógica; histórico não é apagado.
- Autoria não é inventada.
- Dados reais não entram no bundle, fixtures, logs, screenshots ou artefatos públicos.
- `UPDATE` e `DELETE` diretos não voltam às tabelas operacionais.
- Volume por pessoa não é produtividade.
- Documento histórico não autoriza regressão de regra posterior.

---

# 3. ESTADO ATUAL RECONCILIADO

## 3.1 Entregas concluídas

- Ciclos originais 0 a 4 concluídos.
- Bundle sem dados reais e modo local bloqueado em produção.
- Semântica central de status e filtros tipados.
- Schema expandido com próxima ação, situações de prazo, responsabilidade por UUID, origem, exclusão lógica e eventos estruturados.
- RPCs auditáveis de criação, edição, andamento, transição de status, exclusão e restauração.
- Responsáveis oficiais vinculados por UUID em 378 demandas.
- Uma informação histórica sem UUID preservada: `Vanessa Migrado`.
- Carteira da equipe em `/demandas`.
- Carteira pessoal em `/minhas-demandas`.
- Indicadores contextuais por carteira.
- Filtros e paginação visual refinados.
- Rotas profundas preservando carteira e filtros.

## 3.2 Fotografia de Production

| Indicador | Resultado |
|---|---:|
| Demandas | 379 |
| Demandas vinculadas por UUID | 378 |
| Informação histórica sem UUID | 1 |
| Históricos | 764 |
| Perfis | 13 |
| Divergências UUID–nome | 0 |
| Demandas com link de origem | 0 |
| Demandas não encerradas sem próxima ação | 376 |
| Demandas não encerradas sem data de acompanhamento | 376 |

Distribuição conhecida dos eventos:

| Tipo | Quantidade |
|---|---:|
| criação | 379 |
| reatribuição | 378 |
| mudança de status | 7 |
| andamento | 0 |
| edição | 0 |
| alteração de prazo | 0 |
| exclusão | 0 |
| restauração | 0 |

## 3.3 Pendências estruturantes anteriores ao R4 e R5

- cinco constraints permanecem `NOT VALID`;
- ausência de concorrência otimista baseada em versão esperada;
- carregamento integral de demandas e histórico;
- paginação somente visual no cliente;
- recargas integrais após mutação e Realtime;
- rota profunda ainda depende da coleção integral carregada;
- E2E de navegador ainda predominantemente local;
- semântica do campo `setor` ainda precisa de debate próprio;
- experiência completa de prazo e próxima ação ainda não foi entregue;
- documentação anterior ao R3 continha regras superadas e foi reconciliada nesta versão.

---

# 4. RECONCILIAÇÃO DO R3

## 4.1 Estado

O R3 foi executado antecipadamente por autorizações específicas, apesar de R1 e R2 permanecerem pendentes. Seus ganhos são válidos e não serão desfeitos. A sequência cronológica retoma agora os antecessores estruturantes R1 e R2 antes do debate integral do R4 e do R5.

## 4.2 Regra final de responsabilidade

- responsável oficial: usuário cadastrado, identificado por UUID;
- nome: snapshot derivado pelo servidor;
- sem responsável: UUID nulo e texto vazio;
- nome externo ou livre: proibido em novas demandas e futuras reatribuições;
- legado textual sem UUID: preservado, mas não editável livremente;
- carteira pessoal: somente igualdade de UUID;
- perfis podem ser selecionados conforme decisão R3-D02, independentemente do papel, sem alterar permissões de mutação.

## 4.3 Regra final de navegação

- `/demandas`: carteira completa da equipe;
- `/minhas-demandas`: carteira pessoal;
- ambas possuem filtros próprios e alternância explícita;
- limpar filtros nunca troca a carteira;
- indicadores usam a carteira delimitada pela rota;
- links profundos preservam a carteira de origem;
- URL antiga com `escopo=meu` é migrada para `/minhas-demandas`.

## 4.4 Itens do v2.0 formalmente superados

Não permanecem vigentes:

- componente com opção de responsável externo;
- nome livre com UUID nulo para novo cadastro;
- `scope=meu` como arquitetura principal da carteira pessoal;
- aplicação futura do mapa de responsáveis: o mapa aprovado já foi aplicado a 378 demandas;
- estado do R3 como pendente.

---

# 5. SEQUÊNCIA REMANESCENTE ATUAL

| Ordem de retomada | Ciclo | Produto independente | Estado | Dependência efetiva |
|---:|---|---|---|---|
| 1 | R1 | Integridade, domínio e concorrência | próximo debate | fundamentos atuais + R3 preservado |
| 2 | R2 | Consulta escalável e E2E Supabase | pendente | R1 |
| — | R3 | Responsabilidade e carteiras | implementado | preservar durante R1/R2 |
| 3 | R4 | Prazos, próxima ação e saneamento | pendente | R1, R2 e R3 |
| 4 | R5 | Andamento e prontuário | pendente | R4 |
| 5 | R6 | Meu Trabalho e alertas | pendente | R5 |
| 6 | R7 | Central de Relatórios | pendente | R4–R6 |
| 7 | R8 | Painel gerencial | pendente | R5–R7 |
| 8 | R9 | Preferências e visões | pendente | R3, R6 e R8 |
| 9 | R10 | Recuperação e segurança de acesso | pendente | R2 |
| 10 | R11 | Observabilidade e release | pendente | R2–R10 |
| 11 | R12 | Contrato e homologação final | pendente | todos |

A implementação do R5 permanece suspensa até R1, R2 e R4 serem debatidos, implementados e homologados.

---

# 6. CICLOS REMANESCENTES

## R1 — Integridade, domínio de dados e concorrência otimista

### Objetivo

Concluir a robustez estrutural antes de ampliar mutações e uso cotidiano.

### Escopo de referência

- consultar violações das cinco constraints `NOT VALID`;
- validar apenas constraints com zero violações;
- preservar índice normalizado do número;
- alinhar limites entre banco e Zod para campos atuais;
- não criar domínio de responsável externo;
- reconciliar classificações reais antes de restringir domínio;
- definir validação do link de origem antes de torná-lo utilizável;
- adicionar índices de FK necessários;
- implementar concorrência otimista com `updated_at` esperado;
- rejeitar conflito sem sobrescrever demanda ou histórico;
- definir experiência de conflito antes da implementação;
- atualizar tipos Supabase;
- replay integral das migrations;
- manter RPCs legadas até R12.

### Decisões ainda necessárias

- apresentação e recuperação do formulário em conflito concorrente;
- limites máximos com impacto de produto;
- regra de domínios permitidos para `link_origem`;
- semântica e eventual controle do campo `setor` quando relacionada ao domínio.

### Critérios mínimos

- mesmas contagens antes e depois;
- zero órfãos e duplicidades normalizadas;
- constraints elegíveis validadas;
- segunda edição concorrente recusada sem perda silenciosa;
- frontend atual compatível;
- documentação sincronizada.

## R2 — Consulta escalável, histórico sob demanda e E2E Supabase

### Objetivo

Eliminar dependência do carregamento integral e sustentar o crescimento do histórico antes do prontuário.

### Contratos-alvo de referência

```ts
listDemandas(query): Promise<{ items: Demanda[]; total: number; page: number; pageSize: number }>;
getDemanda(id): Promise<Demanda | null>;
listHistorico(demandaId): Promise<ComentarioHistorico[]>;
listRecentHistory(limit): Promise<ComentarioHistorico[]>;
listTrash(query): Promise<{ items: Demanda[]; total: number }>;
```

### Escopo de referência

- paginação real no servidor;
- ordenação determinística;
- busca exata com paridade funcional, inclusive histórico;
- ranking aproximado somente após ausência de resultado exato;
- detalhe por ID independente da página carregada;
- histórico completo apenas quando necessário;
- consulta específica de últimas movimentações;
- exportação e métricas sobre o recorte integral;
- coalescência de Realtime;
- descarte de respostas obsoletas;
- estados de conexão e sincronização;
- E2E Supabase por papel e estado de usuário;
- testes de RLS, RPC, Realtime, rede e retomada;
- base sintética de capacidade.

### Critérios mínimos

- busca preservada;
- paginação sem omissão ou duplicidade;
- rota profunda funcionando sem depender da lista atual;
- histórico de outras demandas não transferido sem necessidade;
- uma mutação sem recargas integrais redundantes;
- E2E remoto aprovado.

## R3 — Responsabilidade por UUID e carteiras

**Estado:** implementado e preservado.

R1 e R2 não podem degradar:

- vínculo oficial por UUID;
- 378 vínculos migrados;
- preservação de `Vanessa Migrado`;
- coerência UUID–nome no servidor;
- `/demandas` e `/minhas-demandas`;
- filtros e indicadores contextuais;
- carteira de origem no link profundo;
- impossibilidade de nome livre em novos registros.

## R4 — Prazos, próxima ação e saneamento assistido

### Objetivo

Tornar prazos e próxima providência compreensíveis e organizar o legado sem inferência.

### Escopo de referência

- prazo `definido`, `nao_informado` e `nao_se_aplica`;
- justificativa para não aplicabilidade;
- coerência entre prazo interno e final;
- próxima ação e data em demandas novas e movimentadas;
- saneamento do legado na primeira operação pertinente;
- próxima providência visível antes dos prazos no detalhe;
- apresentação adequada na carteira desktop e mobile;
- painel de qualidade para UUID ausente, sem responsável, prazos não informados, próxima ação ausente, data ausente e histórico insuficiente;
- Excel distinguindo situações de prazo;
- nenhum preenchimento automático de conteúdo ausente.

### Decisões ainda necessárias

- arquitetura da informação na tabela e no mobile;
- significado oficial do campo `setor`;
- qual operação é proprietária da próxima ação;
- regra de saneamento inicial pela edição;
- distinção futura entre “Minhas demandas” e “Meu Trabalho”.

## R5 — Andamento, prontuário, links e lixeira

### Objetivo

Tornar utilizáveis as capacidades auditáveis após R4.

### Escopo de referência

- registrar andamento sem mudar status;
- mudança de status sem oferecer o status atual;
- prontuário canônico com eventos tipados;
- autoria, data, comentário, status anterior/resultante e antes/depois;
- eventos legados e de migração tratados com transparência;
- preservação de rota, carteira, filtros e foco;
- copiar link;
- link de origem apenas após regra e dados do R1/R4;
- lixeira e restauração para administrador;
- tratamento de conflito concorrente do R1.

### Decisões ainda necessárias

- drawer, página completa ou modelo híbrido;
- remoção ou manutenção do modal histórico redundante;
- autoria histórica e perfis inativos;
- pesquisa nos novos campos do histórico;
- divisão entre prontuário, andamento e lixeira em um ou mais PRs;
- disponibilidade real e cadastramento do link de origem.

## R6 — Meu Trabalho e motor preventivo

- fila diária personalizada;
- sinais consolidados por demanda;
- severidade e chips adicionais;
- prioridades limitadas e próximas ações cronológicas;
- tratamento diferente por papel;
- substituição do componente legado `AtencaoImediata`;
- nenhuma linguagem de produtividade individual.

“Minhas demandas” é carteira completa. “Meu Trabalho” é agenda priorizada.

## R7 — Central de Relatórios

Sete modelos: Minha carteira, Prazos e riscos, Gerencial consolidado, Por responsável, Movimentações, Demanda individual e Mensal estoque/fluxo.

- recorte integral, não apenas página visível;
- estilos e proteções do exportador preservados;
- mesma semântica da tela;
- linha do tempo no dossiê;
- fórmula de estoque reconciliada;
- formula injection neutralizada.

## R8 — Painel gerencial

- módulo único de métricas compartilhado com Excel;
- estoque, fluxo, risco e cobertura;
- distribuição da carteira por responsável, nunca ranking;
- indicadores clicáveis para o recorte exato;
- remoção de “Setores mais Ativos” e de semântica de produtividade;
- limitações de cobertura explícitas.

## R9 — Preferências e visões

- isolamento por `auth.uid()`;
- página e carteira padrão;
- tamanho de página e visão salva;
- URL continua compartilhável;
- sem vazamento entre contas;
- máximo e nomes controlados.

## R10 — Recuperação e segurança de acesso

- reset de senha neutro;
- rota de redefinição;
- redirects exatos;
- política de senha coerente;
- proteção contra senhas comprometidas;
- login simplificado;
- nenhum domínio ou e-mail de suporte inventado.

## R11 — Observabilidade e release

- Error Boundary;
- telemetria sanitizada;
- versão e estado de sincronização;
- cabeçalhos de segurança;
- CI em `main`;
- release sem alternância temporária de `vercel.json`;
- Preview e Production vinculados ao SHA;
- rollback reproduzível.

## R12 — Contrato e homologação final

- remover contratos legados de cliente;
- revogar RPCs v1 somente após homologação integral;
- validar constraints remanescentes;
- replay do banco;
- homologação por papel;
- E2E local e Supabase;
- acessibilidade nos viewports definidos;
- relatórios, alertas, painel, backup, RLS, Auth e Realtime reconciliados;
- documentação correspondente ao ambiente real.

---

# 7. TESTES E COMPORTAMENTOS PROTEGIDOS

## 7.1 Gate mínimo

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

## 7.2 Casos transversais

- UUIDs distintos nunca formam a mesma carteira pessoal por nome.
- Demanda sem UUID não entra em nenhuma carteira pessoal.
- `/demandas` e `/minhas-demandas` preservam filtros e rotas profundas.
- Prazo vazio não gera atraso.
- Andamento mantém status.
- Encerramento limpa próxima ação e preserva evento.
- conflito concorrente não sobrescreve silenciosamente;
- exclusão aparece na lixeira e restauração preserva histórico;
- exportação abrange todo o recorte;
- leitor não executa mutação;
- nenhuma regra superada permanece como orientação vigente.

---

# 8. DEFINIÇÃO GLOBAL DE PRONTO

Um pacote está pronto somente quando:

- decisões foram debatidas e registradas;
- escopo autorizado foi respeitado;
- testes RED e gates aplicáveis passaram;
- migrations foram reproduzidas quando aplicável;
- fluxo real foi validado por papel e viewport;
- nenhuma regressão atingiu R3;
- nenhum dado real entrou em artefato público;
- Preview corresponde ao SHA;
- rollback está definido;
- Registro de Decisões, Product Context, plano vigente, AGENTS, documentação técnica e Handoff foram sincronizados conforme impacto;
- documentos históricos conflitantes estão claramente identificados;
- pesquisa por termos antigos não retorna orientação ambígua como vigente;
- cenário real foi homologado.

Correção técnica, correção de produto e coerência documental são gates independentes.

---

# 9. CONDIÇÕES DE PARADA

Parar quando:

1. houver regra sem decisão expressa;
2. documentos vigentes divergirem;
3. main ou ambiente não puderem ser identificados;
4. backup necessário não puder ser obtido;
5. contagens ou invariantes divergirem;
6. busca, paginação ou exportação perderem paridade;
7. RLS permitir operação indevida;
8. Preview não corresponder ao SHA;
9. CI, E2E, bundle ou acessibilidade falharem;
10. ação exigir dado, autoria, prazo ou responsável inventado;
11. mudança tentar restaurar responsável externo ou `scope=meu` como regra principal sem nova decisão;
12. implementação exigir antecipar R4 ou R5 antes dos predecessores;
13. documentação não puder ser reconciliada com o comportamento entregue.

---

# 10. HISTÓRICO

| Versão | Data | Alteração | Estado |
|---:|---|---|---|
| 1.0 | 21/07/2026 | Plano Mestre, Ciclos 0 a 13. | histórico |
| 2.0 | 23/07/2026 | Rebaseline e Ciclos R0 a R12. | histórico, substituído |
| 2.1 | 25/07/2026 | Reconciliação pós-R3, regras finais de responsabilidade e carteiras, retomada por R1/R2 e gate documental. | vigente |

> **PRÓXIMA ATIVIDADE APÓS ESTA CORREÇÃO DOCUMENTAL:** iniciar o debate pré-implementação do R1. Nenhuma implementação funcional de R1, R2, R4 ou R5 está automaticamente autorizada.

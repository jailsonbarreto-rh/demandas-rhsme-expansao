# Trilho B — Fundação de preservação e migração por lotes

**Data:** 6 de agosto de 2026  
**Status:** especificação técnica para revisão do responsável pelo produto  
**Repositório:** `WilsonMPeixoto-2/demandas-rhsme-expansao`  
**Base analisada:** `main` em `f60acc3fa7bc69761a9c46bce824935c450e1de6`  
**Supabase de referência:** `CTRH PROCESSOS` (`kdhekkzwcokfrpcrsllr`)  
**Efeito deste documento:** define arquitetura e limites; não autoriza carga real, aplicação de migration em Production, publicação na Vercel ou promoção de dados.

---

## 1. Objetivo

Criar a fundação técnica do Trilho B para receber integralmente o snapshot real do Firebase, preservar todos os documentos e eventos históricos e permitir normalização, correlação e promoção operacional em lotes pequenos, auditáveis e reversíveis.

O desenho separa duas responsabilidades:

1. **preservação histórica integral**, que deve aceitar o acervo como ele existe;
2. **operação atual do SITE CTRH**, que continua submetida às regras vigentes de status, responsável, prazo, próxima providência, classificação, permissões e auditoria.

A camada operacional `public.sme_demandas` não será transformada em depósito do payload bruto do Firebase.

---

## 2. Fatos verificados que condicionam o desenho

### 2.1 Acervo real disponível

O snapshot integral contém:

- 3.201 documentos de demanda;
- 9.288 eventos históricos;
- IDs originais do Firestore;
- datas técnicas de criação e atualização;
- variações históricas dos nomes dos campos;
- valores que não obedecem integralmente aos domínios atuais.

### 2.2 Estado atual do Supabase

A base operacional possui:

- 379 demandas;
- 764 eventos em `sme_historico`;
- 379 demandas marcadas como `origem = legado`;
- 369 demandas sem prazo interno;
- 354 demandas sem prazo final;
- 1 demanda sem `responsavel_id`;
- 0 demandas logicamente excluídas;
- 13 perfis ativos.

A base atual representa uma incorporação parcial e resumida do legado, não a reprodução integral do histórico do Firebase.

### 2.3 Restrições do modelo operacional

`public.sme_demandas` possui, entre outras regras:

- número único literal;
- número único após normalização;
- seis status operacionais;
- três tipos;
- responsável oficial opcional por UUID;
- estados controlados de prazo;
- uma representação operacional por número normalizado.

Essas regras são adequadas ao trabalho atual, mas não conseguem armazenar literalmente todos os documentos brutos do Firebase.

### 2.4 Limitações do importador tabular existente

O importador atual foi criado para CSV ou XLSX saneado. Ele:

- rejeita número fora do padrão;
- rejeita duplicidade;
- rejeita colisão com demanda existente;
- exige status, tipo e classificação reconhecidos;
- exige responsável textual preenchido;
- cria um único evento genérico de importação;
- não preserva o documento bruto;
- não preserva o ID original do Firestore;
- não importa os 9.288 eventos;
- não diferencia versões ou documentos repetidos do mesmo número.

O novo Trilho B reutilizará os princípios de hash, dry-run, idempotência, transação e reconciliação, mas não ampliará silenciosamente esse importador para um problema estruturalmente diferente.

---

## 3. Alternativas avaliadas

### Alternativa A — Inserir diretamente em `sme_demandas`

Cada documento do Firebase seria transformado e inserido imediatamente na tabela operacional.

**Vantagem:** menor quantidade inicial de estruturas.

**Problemas:**

- colisão com as 379 demandas atuais;
- impossibilidade de preservar duplicidades pelo número;
- perda ou coerção de status e classificações históricas;
- dificuldade de repetir a importação;
- risco de sobrescrever trabalho já realizado no sistema novo;
- inexistência de local seguro para guardar o payload original;
- dependência prematura de decisões ainda não tomadas para os casos especiais.

**Decisão:** rejeitada.

### Alternativa B — Arquivos fora do banco e promoção direta por lote

O snapshot permaneceria somente em arquivos privados, e cada lote seria transformado antes de ser enviado ao Supabase.

**Vantagem:** menor alteração de schema.

**Problemas:**

- rastreabilidade distribuída entre arquivos e banco;
- consultas e reconciliações mais difíceis;
- ausência de relacionamento persistente entre documento, evento, pendência e demanda operacional;
- maior risco de promover duas vezes o mesmo item;
- baixa observabilidade do progresso global.

**Decisão:** rejeitada como arquitetura principal. Os arquivos originais continuam preservados externamente, mas o banco receberá uma representação histórica privada e auditável.

### Alternativa C — Camada privada de preservação, análise e promoção

O snapshot integral é recebido em estruturas privadas append-only. Normalização, correlação e promoção são executadas em etapas distintas e vinculadas por hashes e IDs de origem.

**Vantagens:**

- preservação integral;
- repetição segura;
- isolamento entre fonte e operação;
- tratamento explícito de duplicidades e conflitos;
- lotes pequenos sem fragmentar a fonte original;
- reconciliação das 379 demandas sem apagar trabalho posterior;
- capacidade de auditar cada transformação.

**Custo:** maior quantidade de estruturas e testes iniciais.

**Decisão recomendada e aprovada conceitualmente:** Alternativa C.

---

## 4. Decomposição do programa

O Trilho B será executado como pacotes independentes. Cada pacote terá branch e PR próprios, aprovação, testes e documentação sincronizada.

### B0 — Especificação e autorização

Entrega:

- esta especificação;
- registro das decisões aprovadas;
- plano detalhado de implementação da fundação.

Sem código funcional, migration ou dados reais.

### B1 — Fundação privada de preservação

Entrega:

- schema aditivo;
- tabelas privadas;
- constraints;
- índices essenciais;
- funções auxiliares puras;
- testes de migration com dados sintéticos;
- contratos TypeScript administrativos, quando necessários aos testes.

Sem ingestão real.

### B2 — Validador e ingestão do snapshot

Entrega:

- leitor do JSON integral;
- verificação de manifesto e hash;
- divisão técnica em blocos;
- dry-run local;
- ingestão privada idempotente;
- recibos e relatório de reconciliação da fonte.

A primeira execução real dependerá de autorização separada.

### B3 — Normalização e inventário de pendências

Entrega:

- regras versionadas de normalização segura;
- classificação dos documentos;
- agrupamento de duplicidades;
- inventário de status, tipos, classificações, responsáveis, datas e identificadores;
- filas de pendência e conflito.

Sem promoção automática à carteira.

### B4 — Reconciliação das 379 demandas atuais

Entrega:

- associação entre documentos do Firebase e demandas já existentes;
- comparação campo a campo;
- preservação das alterações posteriores do SITE CTRH;
- identificação dos eventos históricos ainda ausentes;
- propostas de enriquecimento em dry-run.

### B5 — Piloto de promoção P0

Entrega:

- 25 grupos representativos;
- dry-run completo;
- promoção em ambiente controlado;
- homologação da interface e dos históricos;
- relatório antes/depois;
- decisão de continuidade.

### B6 — Promoção progressiva P1 a P7

Entrega:

- lotes pequenos classificados por risco;
- aprovação e aplicação lote a lote;
- reconciliação acumulada;
- encerramento somente após contabilização de 3.201 documentos e 9.288 eventos.

---

## 5. Escopo exato do primeiro pacote implementável: B1

O B1 cria somente a fundação de banco e testes sintéticos. Ele não recebe o arquivo real.

### 5.1 Schema

Usar o schema `private`, já existente e empregado pela trilha de importação atual.

Todas as novas tabelas:

- terão RLS habilitada;
- não terão policies para `anon` ou `authenticated`;
- terão `REVOKE ALL` para `public`, `anon` e `authenticated`;
- não serão consultadas diretamente pelo frontend;
- serão acessadas apenas por rotinas administrativas explicitamente autorizadas em pacotes posteriores.

### 5.2 Tabelas

#### `private.legacy_sources`

Uma linha por fonte integral recebida.

Campos:

- `id uuid primary key`;
- `source_system text not null`;
- `source_project text not null`;
- `source_collection text not null`;
- `extracted_at timestamptz not null`;
- `source_file_sha256 text not null unique`;
- `expected_document_count integer not null`;
- `expected_event_count integer not null`;
- `format_version integer not null`;
- `status text not null`;
- `created_at timestamptz not null default now()`.

Estados permitidos:

- `registered`;
- `ingesting`;
- `ingested`;
- `reconciled`;
- `rejected`.

Regras:

- hashes SHA-256 possuem 64 caracteres hexadecimais minúsculos;
- quantidades esperadas são positivas;
- uma fonte não pode ser marcada como `ingested` por atualização direta de cliente;
- nenhuma fonte concluída pode ser substituída por outro arquivo com o mesmo nome e conteúdo diferente.

#### `private.legacy_ingestion_batches`

Uma linha por bloco técnico de ingestão.

Campos:

- `id uuid primary key`;
- `source_id uuid not null references private.legacy_sources(id)`;
- `batch_number integer not null`;
- `first_document_ordinal integer not null`;
- `last_document_ordinal integer not null`;
- `expected_document_count integer not null`;
- `expected_event_count integer not null`;
- `payload_sha256 text not null`;
- `status text not null`;
- `attempt_count integer not null default 0`;
- `started_at timestamptz`;
- `completed_at timestamptz`;
- `failure_code text`;
- `created_at timestamptz not null default now()`.

Estados permitidos:

- `registered`;
- `processing`;
- `completed`;
- `failed`.

Restrições:

- `unique (source_id, batch_number)`;
- ordinais positivos e intervalos coerentes;
- lote concluído exige `completed_at`;
- lote com falha exige `failure_code`;
- o mesmo hash do lote pode ser reexecutado sem duplicar itens.

#### `private.legacy_documents`

Uma linha por documento original do Firestore.

Campos:

- `id bigint generated always as identity primary key`;
- `source_id uuid not null references private.legacy_sources(id)`;
- `ingestion_batch_id uuid not null references private.legacy_ingestion_batches(id)`;
- `source_document_id text not null`;
- `source_document_path text not null`;
- `source_ordinal integer not null`;
- `source_create_time timestamptz`;
- `source_update_time timestamptz`;
- `raw_payload jsonb not null`;
- `decoded_payload jsonb not null`;
- `raw_payload_sha256 text not null`;
- `processing_state text not null default 'received'`;
- `created_at timestamptz not null default now()`.

Estados permitidos:

- `received`;
- `normalized`;
- `fit`;
- `pending`;
- `conflicting`;
- `promoted`;
- `isolated`.

Restrições:

- `unique (source_id, source_document_id)`;
- `unique (source_id, source_ordinal)`;
- hash válido;
- payload bruto e payload decodificado nunca podem ser atualizados por rotina de normalização;
- estado inicial obrigatório `received`.

#### `private.legacy_events`

Uma linha por evento histórico do documento.

Campos:

- `id bigint generated always as identity primary key`;
- `legacy_document_id bigint not null references private.legacy_documents(id)`;
- `source_event_ordinal integer not null`;
- `source_status text`;
- `source_text text`;
- `source_user text`;
- `source_event_at timestamptz`;
- `raw_payload jsonb not null`;
- `event_sha256 text not null`;
- `processing_state text not null default 'received'`;
- `created_at timestamptz not null default now()`.

Restrições:

- `unique (legacy_document_id, source_event_ordinal)`;
- `unique (legacy_document_id, event_sha256)` somente quando o hash e a posição indicarem o mesmo evento canônico;
- comentário textual vazio é permitido;
- status, usuário ou data ausentes não eliminam o evento;
- nenhum evento é inserido automaticamente em `public.sme_historico` no B1 ou B2.

#### `private.legacy_issues`

Inventário append-only das ocorrências detectadas.

Campos:

- `id bigint generated always as identity primary key`;
- `source_id uuid not null references private.legacy_sources(id)`;
- `legacy_document_id bigint references private.legacy_documents(id)`;
- `legacy_event_id bigint references private.legacy_events(id)`;
- `issue_code text not null`;
- `severity text not null`;
- `field_name text`;
- `original_value jsonb`;
- `normalized_value jsonb`;
- `details jsonb not null default '{}'::jsonb`;
- `rule_version text not null`;
- `status text not null default 'open'`;
- `created_at timestamptz not null default now()`;
- `resolved_at timestamptz`.

Severidades:

- `info`;
- `warning`;
- `blocking`.

Estados:

- `open`;
- `accepted`;
- `resolved`;
- `superseded`.

A tabela registra ocorrências; não substitui nem corrige o payload original.

#### `private.legacy_demand_correlations`

Relacionamento entre documento legado e demanda operacional.

Campos:

- `id bigint generated always as identity primary key`;
- `legacy_document_id bigint not null references private.legacy_documents(id)`;
- `demanda_id bigint references public.sme_demandas(id)`;
- `correlation_type text not null`;
- `confidence text not null`;
- `evidence jsonb not null`;
- `status text not null`;
- `rule_version text not null`;
- `approved_by uuid`;
- `approved_at timestamptz`;
- `created_at timestamptz not null default now()`.

Tipos:

- `same_record`;
- `version_of`;
- `duplicate_candidate`;
- `history_only`;
- `unrelated`.

Confiança:

- `deterministic`;
- `reviewed`;
- `ambiguous`.

Estados:

- `proposed`;
- `approved`;
- `rejected`;
- `superseded`.

Nenhuma correlação `ambiguous` pode ser aprovada automaticamente.

#### `private.legacy_promotion_batches`

Ledger das promoções operacionais futuras.

Campos:

- `id uuid primary key`;
- `source_id uuid not null references private.legacy_sources(id)`;
- `promotion_code text not null unique`;
- `category text not null`;
- `expected_item_count integer not null`;
- `payload_sha256 text not null`;
- `ruleset_version text not null`;
- `status text not null`;
- `dry_run_receipt jsonb`;
- `applied_receipt jsonb`;
- `created_at timestamptz not null default now()`;
- `completed_at timestamptz`.

Estados:

- `prepared`;
- `dry_run_approved`;
- `applying`;
- `applied`;
- `failed`;
- `cancelled`.

#### `private.legacy_promotion_items`

Uma linha por documento ou grupo tratado em uma promoção.

Campos:

- `promotion_batch_id uuid not null references private.legacy_promotion_batches(id)`;
- `legacy_document_id bigint not null references private.legacy_documents(id)`;
- `demanda_id bigint references public.sme_demandas(id)`;
- `action text not null`;
- `record_sha256 text not null`;
- `status text not null`;
- `result jsonb`;
- `created_at timestamptz not null default now()`;
- `primary key (promotion_batch_id, legacy_document_id)`.

Ações futuras permitidas:

- `create_operational`;
- `enrich_existing`;
- `history_only`;
- `hold`.

O B1 cria a estrutura, mas não executa essas ações.

---

## 6. Integridade e imutabilidade

### 6.1 Identidade da fonte

A identidade primária de um documento legado é:

```text
source_id + source_document_id
```

O número da demanda não é usado como identidade da fonte, porque existem documentos repetidos e versões históricas.

### 6.2 Hashes

Serão preservados três níveis:

1. `source_file_sha256` — bytes exatos do arquivo integral;
2. `payload_sha256` — conteúdo canônico de cada bloco técnico;
3. `raw_payload_sha256` e `event_sha256` — documento e evento individuais.

O hash do arquivo integral sempre prevalece como prova de integralidade. Dividir o processamento em blocos não cria novas fontes independentes.

### 6.3 Append-only

Os campos de fonte das seguintes tabelas são imutáveis após inserção:

- `legacy_sources` após conclusão;
- `legacy_documents.raw_payload`;
- `legacy_documents.decoded_payload`;
- `legacy_documents.source_*`;
- `legacy_events.raw_payload`;
- `legacy_events.source_*`.

Normalizações, interpretações e decisões são registradas em tabelas próprias ou em novas linhas de ocorrências e correlação.

### 6.4 Idempotência

Reexecutar:

- a mesma fonte;
- o mesmo bloco;
- o mesmo documento;
- o mesmo evento;
- o mesmo lote de promoção;

deve retornar estado já conhecido ou atualizar somente o controle da tentativa, sem criar duplicidade.

---

## 7. Fluxo de dados

```text
arquivo integral externo e imutável
→ validação de bytes, manifesto e hash
→ registro de legacy_sources
→ preparação dos blocos técnicos
→ dry-run de contagens e hashes
→ ingestão privada de documentos e eventos
→ reconciliação integral da fonte
→ normalização versionada
→ inventário de pendências e duplicidades
→ correlação com sme_demandas
→ preparação do lote de promoção
→ dry-run operacional
→ aprovação expressa
→ aplicação atômica do lote
→ reconciliação pós-lote
```

A passagem de uma etapa para outra não altera o payload original.

---

## 8. Estratégia de lotes

### 8.1 Blocos técnicos de ingestão

O snapshot integral continua sendo uma única fonte. Para controle operacional, a ingestão será dividida em:

- 12 blocos de até 250 documentos;
- 1 bloco final de 201 documentos.

Os eventos acompanham sempre o documento correspondente. Um documento e seus eventos nunca são separados entre blocos.

O tamanho de 250 é valor inicial. Pode ser reduzido por falha ou limite comprovado, mas não ampliado antes de medição real de tempo, memória e payload.

### 8.2 Categorias de promoção

#### P0 — piloto representativo

25 grupos selecionados para provar o fluxo completo.

#### P1 — reconciliação das 379 demandas atuais

Quatro lotes de aproximadamente 100 demandas, sem reinserção automática.

#### P2 — correspondências diretas inéditas

Até 100 demandas por lote.

#### P3 — responsáveis pendentes ou ambíguos

50 a 100 demandas por lote.

#### P4 — domínios históricos

25 a 50 demandas por lote.

#### P5 — duplicidades e versões

10 a 25 grupos por lote. Todos os documentos do mesmo grupo permanecem juntos.

#### P6 — número ausente ou fora do padrão

Até 25 documentos por lote.

#### P7 — excluídos, arquivados e estados históricos especiais

25 a 50 documentos por lote.

Nenhuma categoria autoriza por si só a promoção. Cada lote precisa de manifesto, dry-run, aprovação e reconciliação.

---

## 9. Regras de normalização e correlação

O B1 não implementa regras de transformação. Ele prepara o armazenamento e os contratos para que o B3 faça isso de forma versionada.

Regras permanentes:

- valor original sempre preservado;
- normalização segura não substitui o original;
- aproximação por semelhança não cria vínculo automático;
- ausência de UUID não apaga o nome histórico;
- classificação desconhecida não vira `Outros` automaticamente;
- status antigo não vira `Encerrado` automaticamente;
- ausência de prazo não vira data inventada;
- par de prazos invertido não é corrigido silenciosamente;
- comentário vazio não elimina evento;
- duplicidade de número não implica descarte;
- alteração feita no sistema novo não é sobrescrita pela fotografia histórica.

Uma correlação automática futura somente poderá ser classificada como `deterministic` quando a regra utilizar evidência exata e não ambígua. Número normalizado isolado não basta quando houver mais de um documento de origem no grupo.

---

## 10. Eventos históricos

### 10.1 Preservação

Todos os 9.288 eventos entram em `private.legacy_events`, inclusive os que possuem texto vazio.

### 10.2 Promoção ao histórico operacional

Eventos brutos não serão inseridos diretamente em `public.sme_historico` quando:

- o status não pertencer ao domínio operacional;
- o autor for apenas texto histórico sem identidade comprovada;
- o evento for duplicado ou versão conflitante;
- a relação com a demanda operacional ainda estiver pendente.

A preservação privada é obrigatória. A apresentação ao usuário e eventual projeção para `sme_historico` serão desenhadas em pacote posterior, após o B3 e o B4 demonstrarem os formatos reais.

Os eventos técnicos já existentes no Supabase permanecem preservados. O processo não os apaga nem tenta fingir que vieram do Firebase.

---

## 11. Segurança e privacidade

- Nenhum dado real será commitado no Git.
- Nenhum payload real aparecerá em fixture, screenshot, log de CI, comentário de PR ou artefato público.
- Chave administrativa nunca será usada no frontend.
- Scripts administrativos usarão variáveis de ambiente e recusarão execução sem modo explícito.
- O default de qualquer importador será `dry-run`.
- O modo de aplicação exigirá recibo do dry-run correspondente ao mesmo hash.
- Tabelas privadas não terão acesso direto para usuários autenticados.
- Testes de migration usarão somente dados sintéticos.
- O projeto Supabase Production não será alterado no B0.
- A migration do B1 somente será aplicada em Production depois de PR, replay integral, testes por papel, revisão de grants, Advisors e autorização expressa separada.

---

## 12. Falhas e retomada

### 12.1 Falha antes da gravação

Hash, manifesto, formato ou contagem divergente impedem o registro do bloco.

### 12.2 Falha durante um bloco

Cada bloco técnico é transacional. Falha em qualquer documento ou evento cancela integralmente o bloco. Blocos anteriores concluídos permanecem válidos.

O lote recebe:

- `status = failed`;
- `failure_code` controlado;
- incremento de `attempt_count`.

Nenhum payload real é colocado na mensagem de erro.

### 12.3 Retomada

A reexecução identifica a fonte e o lote pelo hash. Itens já concluídos são reconciliados e não inseridos novamente.

### 12.4 Fonte incompleta

A fonte somente muda para `ingested` quando:

- 3.201 documentos estiverem contabilizados;
- 9.288 eventos estiverem contabilizados;
- todos os lotes estiverem concluídos;
- nenhum evento estiver órfão;
- nenhum documento estiver associado a mais de uma posição;
- o hash integral continuar igual ao manifesto.

Caso contrário, permanece `ingesting` ou é marcada `rejected`, sem promoção operacional.

---

## 13. Rollback e reversibilidade

### 13.1 B1

O B1 é aditivo. O rollback técnico remove apenas as estruturas novas quando estiver comprovado que nenhuma fonte real foi carregada.

### 13.2 B2

A ingestão privada não altera `public.sme_demandas` nem `public.sme_historico`. Um bloco falho é revertido pela própria transação.

Uma fonte real concluída não será apagada para corrigir interpretação. A correção ocorre por nova regra, nova ocorrência ou nova correlação.

### 13.3 Promoções futuras

Cada lote de promoção será atômico e armazenará a fotografia mínima necessária para reconciliação.

Depois de uso operacional, rollback destrutivo é proibido. Uma correção pós-aplicação será compensatória e preservará o lote, a fonte e os eventos de auditoria.

---

## 14. Testes do B1

O pacote B1 deverá provar, com dados sintéticos:

1. criação das tabelas, constraints e índices;
2. ausência de grants para `anon` e `authenticated`;
3. RLS habilitada em todas as tabelas novas;
4. rejeição de hash inválido;
5. rejeição de contagem não positiva;
6. rejeição de lote com intervalo incoerente;
7. idempotência da identidade da fonte;
8. idempotência do documento por ID do Firestore;
9. preservação de dois documentos com o mesmo número no payload;
10. preservação de evento com comentário vazio;
11. preservação de status histórico desconhecido;
12. rejeição de evento órfão;
13. imutabilidade do payload bruto;
14. impossibilidade de alterar fonte concluída;
15. ausência de qualquer escrita em `sme_demandas` e `sme_historico`;
16. replay integral de todas as migrations em ambiente efêmero;
17. reversão integral dos testes sintéticos;
18. geração de tipos compatível com o schema resultante.

O gate global do repositório permanece obrigatório.

---

## 15. Dependências e pacotes

### 15.1 Decisão para o B1

Nenhuma nova dependência é necessária.

A pilha atual já possui:

- Node.js 24;
- TypeScript 6;
- `@supabase/supabase-js`;
- Zod;
- Vitest;
- bibliotecas de CSV e Excel;
- `node:crypto`, `node:fs` e demais módulos nativos.

O B1 é predominantemente SQL e testes de migration.

### 15.2 Decisão para o B2

O snapshot com 3.201 documentos é pequeno o suficiente para validação controlada em memória usando módulos nativos e Zod. Uma biblioteca de streaming JSON não será instalada preventivamente.

Nova dependência somente será proposta se medição comprovar pelo menos um destes limites:

- arquivo superior a 50 MB;
- memória de processo desproporcional;
- tempo de parse que prejudique a repetição do dry-run;
- necessidade de JSON incremental que não possa ser implementada com segurança usando recursos nativos.

Qualquer instalação terá proposta separada com compatibilidade, segurança, bundle, manutenção e rollback. Dependência administrativa não deverá integrar o bundle público.

---

## 16. Estrutura prevista de arquivos

O plano detalhado do B1 deverá considerar:

- nova migration em `supabase/migrations/`;
- teste de migration em `supabase/migrations/migration.test.ts` ou arquivo dedicado seguindo o padrão atual;
- atualização dos tipos de banco em `src/lib/database.types.ts` somente se as estruturas privadas precisarem ser representadas por ferramenta administrativa;
- documentação do Trilho B;
- atualização do Registro de Decisões após aprovação;
- atualização de `docs/PRODUCT_CONTEXT.md`;
- atualização de `docs/HANDOFF.md`;
- atualização do Plano Integrado quando necessário para registrar o estado implementado;
- nenhum arquivo real em `data/`, `public/`, fixtures ou artefatos versionados.

A decomposição final de arquivos será fixada no plano de implementação, após revisão desta especificação.

---

## 17. Critérios de aceitação do B1

O B1 estará concluído quando:

- a migration for exclusivamente aditiva;
- nenhuma tabela operacional for modificada;
- nenhuma linha real for inserida;
- todas as estruturas privadas possuírem proteção adequada;
- os testes sintéticos cobrirem integridade, idempotência e imutabilidade;
- o replay integral das migrations passar;
- os gates do repositório passarem;
- documentação e decisões estiverem sincronizadas;
- o PR estiver aprovado;
- qualquer aplicação em Production tiver autorização separada;
- Vercel e frontend permanecerem inalterados.

---

## 18. Escopo excluído do B1

O B1 não inclui:

- leitura do snapshot real;
- commit de dados reais;
- importação em Production;
- correlação de responsáveis;
- normalização de status ou classificação;
- criação de demanda operacional;
- atualização das 379 demandas;
- importação de eventos para `sme_historico`;
- tela administrativa;
- alteração de RLS existente;
- modificação de RPC operacional;
- mudança em Vercel;
- pacote de streaming JSON;
- limpeza do importador tabular existente.

---

## 19. Gate de revisão

Após aprovação desta especificação:

1. registrar a autorização do B1 no Registro de Decisões;
2. atualizar os documentos vigentes afetados;
3. escrever o plano detalhado e executável do B1;
4. revisar o plano contra esta especificação;
5. executar o B1 em branch funcional própria, distinta desta branch documental;
6. abrir PR sem aplicar a migration em Production;
7. validar replay, grants, RLS, testes e documentação;
8. solicitar autorização separada para aplicação remota.

A aprovação do B1 não autoriza B2, carga real ou promoção operacional.

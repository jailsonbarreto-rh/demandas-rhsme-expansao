# Pré-flight B1 — contrato de recepção do legado

**Data:** 3 de setembro de 2026  
**Status:** análise técnica concluída; decisões B1 permanecem pendentes de aprovação expressa  
**Escopo:** somente diagnóstico, documentação e classificação do caminho legado existente. Nenhuma carga, migration, RLS, dado ou regra operacional foi alterada.

## 1. Objetivo

Preparar o debate B1 do Trilho B com base no código atual, distinguindo claramente:

- o fluxo histórico já existente;
- os princípios vigentes de preservação informacional;
- as recomendações do Plano Integrado v3.1;
- as decisões que ainda precisam ser aprovadas antes de B2.

Este documento não aprova B1-D01 a B1-D09 e não autoriza B2. O debate detalhado no formato GOV-003 está preparado em `docs/execution/B1_PACOTE_DECISOES_PARA_APROVACAO_2026-09-03.md`.

## 2. Estado atual do caminho legado

O repositório já contém:

- `scripts/migration/prepare-legacy-csv.mjs`;
- `scripts/migration/legacy-data.mjs`;
- `scripts/migration/dry-run-import.mjs`;
- `docs/MIGRACAO_LEGADO.md`;
- RPC `public.importar_sme_demandas_lote`;
- tabelas privadas `private.sme_importacoes` e `private.sme_importacao_itens`.

O fluxo histórico foi construído para receber uma carga já saneada, validar um payload canônico e, quando `p_apply=true`, inserir as demandas diretamente em `public.sme_demandas`.

Ele possui salvaguardas relevantes que devem ser reaproveitadas conceitualmente quando compatíveis:

- hashes SHA-256;
- fotografia do banco e do histórico antes do apply;
- actor administrativo;
- lock transacional;
- idempotência por lote;
- auditoria privada;
- dry-run separado do apply;
- conferência de quantidade;
- rejeição de colisões e campos inválidos.

## 3. Incompatibilidades materiais com B1

### 3.1 Inferência e valores artificiais

O normalizador atual:

- infere `tipo` pelo formato do número;
- usa `Outros` como classificação padrão;
- permite setor padrão;
- converte esses valores em payload apto quando as demais validações passam.

Isso conflita com GOV-009 e com a recomendação B1-D03 quando a transformação não for comprovável. O novo contrato não pode fazer uma ausência parecer um valor conhecido.

### 3.2 Linha com erro não integra o payload

Todas as linhas são contabilizadas e as ocorrências são preservadas no relatório, mas somente linhas sem erro entram em `payload.json`.

B1 recomenda uma camada de ingestão em que **a própria linha bruta permaneça registrada**, ainda que nunca seja promovida. Portanto, relatório externo + hash não equivalem ao estágio intermediário proposto.

### 3.3 Promoção direta

A RPC atual, no modo apply, executa `insert into public.sme_demandas` e cria histórico de importação. Não existe uma etapa persistente de recepção bruta independente da tabela operacional.

Isso torna a RPC inadequada como núcleo do B2 recomendado caso B1-D01 adote estágio intermediário.

### 3.4 Domínios obrigatórios no contrato antigo

A RPC exige previamente:

- `tipo` em catálogo fechado;
- `status` em catálogo fechado;
- `classificacao` em catálogo fechado;
- responsável textual preenchido;
- setor preenchido;
- número em formato aceito.

Esse contrato é apropriado para um lote já saneado, mas não para preservar uma fonte cuja semântica ainda não caiba no modelo atual.

### 3.5 Identidade e duplicidade

O normalizador atual bloqueia número duplicado dentro do lote e a RPC bloqueia colisões com a base. Isso é útil como proteção, mas B1-D06 exige classificação explícita entre cópia idêntica, complementar, conflitante, atualização legítima e duplicidade ambígua. O comportamento atual apenas rejeita; não preserva a comparação como objeto administrável.

## 4. Decisões B1 a deliberar

| ID | Tema | Estado atual | Recomendação vigente do plano | Impacto se aprovada |
|---|---|---|---|---|
| B1-D01 | arquitetura de entrada | lote saneado → RPC → tabela operacional | estágio intermediário privado | cria a fundação do B2 |
| B1-D02 | identidade mínima | vários campos obrigatórios para payload | preservar toda linha; promover somente número identificável e não ambíguo | separa recepção de promoção |
| B1-D03 | domínios desconhecidos | inferência/default ou bloqueio | preservar original; não inventar; manter em ingestão quando material | elimina `Outros` como certeza artificial |
| B1-D04 | aliases | não há catálogo persistente B1 | catálogo persistente e auditável | reconciliação segura de responsáveis |
| B1-D05 | granularidade do apply | lote integral atômico | sublotes canônicos aprovados | poucas pendências não bloqueiam todo o acervo |
| B1-D06 | processo já existente | colisão bloqueada | comparar e classificar; nunca último arquivo vence | permite carga mista auditável |
| B1-D07 | linhas não promovidas | relatório local | área administrativa + relatório | pendências permanecem visíveis |
| B1-D08 | histórico legado | snapshot atual e evento técnico de importação | importar somente fatos comprováveis | evita reconstrução fictícia |
| B1-D09 | reversão | transação antes do commit; sem modelo B1 pós-commit | compensação e isolamento lógico | evita deleção física massiva |

## 5. Recomendação técnica consolidada

A análise do código reforça a recomendação do Plano Integrado:

1. adotar uma camada privada de ingestão;
2. preservar fonte, arquivo e linha de forma imutável;
3. separar `raw`, `normalized`, ocorrência e decisão de promoção;
4. não reutilizar a RPC antiga como mecanismo principal de entrada;
5. reaproveitar dela somente ideias comprovadamente úteis: hashes, idempotência, locks, fotografias e trilha de auditoria;
6. manter o fluxo antigo disponível apenas como evidência histórica até decisão sobre sua neutralização;
7. não processar os 3.201 registros reais em Production durante B1 ou B2;
8. usar dados sintéticos e adversariais nos testes.

## 6. fast-check

`fast-check@4.9.0` já está instalado. Ele é adequado para B2, depois das decisões B1, para provar propriedades como:

- nenhuma linha recebida desaparece;
- normalização é determinística;
- reprocessamento mantém identidade;
- valores brutos não são alterados;
- entradas arbitrárias não provocam truncamento;
- ausência não vira automaticamente valor normalizado;
- duas linhas distintas não colapsam silenciosamente na mesma identidade.

Não deve ser usado agora para cristalizar o comportamento do importador antigo.

## 7. pgTAP

B1, por si só, é uma etapa de decisão e contrato. Não há vantagem em introduzir pgTAP antes de existir schema B2 a testar.

A avaliação fica, portanto:

- **não instalar/adotar em B1**;
- reavaliar em B2-A/B2-D quando surgirem tabelas privadas, constraints, funções de dry-run/apply, grants e invariantes de idempotência;
- manter os testes SQL locais atuais como baseline até então.

## 8. Itens explicitamente não executados

- nenhuma carga real;
- nenhum dry-run contra Production;
- nenhuma chamada `p_apply=true`;
- nenhuma migration nova;
- nenhuma alteração da RPC existente;
- nenhuma retirada dos scripts históricos;
- nenhuma decisão B1 registrada como aprovada;
- nenhuma alteração de RLS ou grants;
- nenhuma alteração de Vercel ou Supabase remoto.

## 9. Gate para começar B2

B2 somente pode começar depois da aprovação expressa das decisões B1 aplicáveis, especialmente B1-D01 a B1-D07 e B1-D09. B1-D08 depende também das informações efetivamente fornecidas pela futura extração.

Até lá, o caminho histórico não deve ser tratado como procedimento autorizado para a próxima carga real.

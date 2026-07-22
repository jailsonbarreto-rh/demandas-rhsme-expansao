# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **2026-07-22 — execução do Plano Mestre v1.0, Ciclo 3 em homologação**

## Estado da execução

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| `main` remota | `fc37ba5` — merge do Ciclo 2 |
| Branch atual | `feat/expandir-modelo-central-trabalho-ciclo-3` |
| PR | `#40` — rascunho, aberto e mesclável |
| SHA candidato | `377e5eb68397552cc328581c500f601e2b4c3470` antes desta atualização documental |
| Produção | `https://demandas-rhsme-expansao.vercel.app/` — Ciclo 2 |
| Preview do Ciclo 3 | deployment `dpl_FsVJFe4kejv2otobEEmbFScpqHaq`, `READY` |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, ativo e saudável |
| Migration do Ciclo 3 em produção | **não aplicada** |
| Plano versionado | SHA-256 `C78B6F7FE840BBFC6B32F401D27B609681C1881CB146B25E72E8905F36AA0B87` |

O Ciclo 3 está implementado no código e passou pelo gate técnico e pelo Preview. Ele ainda não pode ser declarado concluído, promovido nem mesclado porque o Plano Mestre exige executar a migration em banco isolado e confirmar backup restaurável antes da aplicação em produção.

## Ciclo 3 — expansão aditiva do modelo de dados

### Problema e resultado de produto

O modelo anterior não representava responsabilidade por identidade, próxima ação, situação explícita dos prazos, origem, exclusão lógica ou eventos auditáveis. Essa lacuna impedia construir com segurança “Minhas demandas”, saneamento, andamento separado de status e prontuário completo.

A expansão preparada:

- acrescenta os campos necessários sem remover o contrato existente;
- converte linhas novas e antigas para um domínio completo;
- não inventa data, UUID, autoria, responsável ou status anterior;
- permite publicar o frontend antes da migration porque o repositório recua apenas diante de ausência inequívoca do schema novo;
- mantém as mutações v1 operacionais até o Ciclo 4;
- filtra registros logicamente excluídos quando o schema expandido estiver disponível.

### Migration versionada

Arquivo:

```text
supabase/migrations/20260722090000_central_trabalho_expand.sql
```

Campos adicionados a `sme_demandas`:

- `responsavel_id`;
- `proxima_acao` e `proxima_acao_em`;
- `limite1_situacao` e `limite1_justificativa`;
- `limite2_situacao` e `limite2_justificativa`;
- `link_origem` e `origem`;
- `deleted_at`, `deleted_by` e `deletion_reason`.

Campos adicionados a `sme_historico`:

- `tipo_evento`;
- `status_anterior`;
- `alteracoes`.

Regras do backfill:

- registros existentes recebem `origem = legado`;
- data existente gera `definido`; ausência gera `nao_informado`;
- primeiro histórico conhecido de cada demanda recebe `criacao`;
- eventos posteriores recebem `mudanca_status`;
- `status_anterior` e autoria não são inferidos.

Checks `NOT VALID`:

- `sme_demandas_limite1_consistencia_check`;
- `sme_demandas_limite2_consistencia_check`;
- `sme_demandas_origem_check`;
- `sme_demandas_exclusao_logica_check`;
- `sme_historico_tipo_evento_check`.

Índices:

- `sme_demandas_responsavel_abertas_idx`;
- `sme_demandas_proxima_acao_idx`;
- `sme_demandas_status_visivel_idx`;
- `sme_historico_demanda_data_idx`.

A migration não contém `DROP TABLE`, `TRUNCATE`, `DELETE`, remoção de funções ou revogação das RPCs existentes. Gatilhos temporários preenchem somente os campos necessários para manter as mutações v1 compatíveis até o Ciclo 4.

### Frontend e compatibilidade

- `src/types.ts` contém o domínio expandido e o input temporário `LegacyCreateDemandaInput`;
- `src/lib/database.types.ts` representa o schema expandido;
- `src/services/dataMappers.ts` aplica defaults seguros para linhas legadas;
- `src/services/supabaseDemandasRepository.ts` tenta a leitura expandida, aplica `deleted_at is null` e recua para o select legado somente diante de coluna ausente/cache de schema;
- `src/services/localDemandasRepository.ts` normaliza dados antigos do `localStorage`;
- `src/data/demoDemandas.ts` contém somente oito registros sintéticos completos;
- `src/test/expandedFixtures.ts` centraliza fixtures do contrato novo;
- nenhuma tela passou a exigir os novos campos durante mutações.

### Evidência TDD

1. O PR foi aberto em rascunho com somente testes.
2. O primeiro RED revelou os contratos ausentes.
3. Um erro do próprio teste de caminho foi corrigido antes da implementação.
4. O RED validado registrou **17 falhas funcionais em 204 testes**, sem erro de importação ou sintaxe.
5. Depois da implementação, os 204 testes passaram.
6. O build TypeScript identificou fixtures antigas incompletas; elas foram migradas por fábrica única.
7. Gate integral e navegador passaram no SHA candidato.

### Gate técnico

| Evidência | Resultado |
|---|---|
| `npm ci` | PASS |
| `npm audit --audit-level=high` | PASS |
| `npm audit signatures` | PASS |
| `npm run lint` | PASS |
| `npm run test:coverage` | PASS, 204 testes |
| `npm run build` | PASS |
| orçamento do bundle | PASS |
| scanner do bundle público | PASS |
| Playwright desktop/mobile | PASS |
| Preview Vercel | `READY` |
| aplicação SQL em banco isolado | **pendente** |
| backup restaurável da produção | **não confirmado neste ambiente** |
| smoke autenticado | pendente por ausência de senha de teste |

### Preview

- deployment: `dpl_FsVJFe4kejv2otobEEmbFScpqHaq`;
- branch: `feat/expandir-modelo-central-trabalho-ciclo-3`;
- commit do Preview: `377e5eb68397552cc328581c500f601e2b4c3470`;
- estado: `READY`;
- HTTP 200 no shell Vite;
- nenhum alias de Production foi alterado;
- `vercel.json` mantém `* = false` e permite apenas a branch exata do Ciclo 3.

O Preview usa o schema antigo de produção. A aplicação inicia pelo contrato expandido e deve recuar para o legado. Essa compatibilidade é coberta por teste de integração. A leitura autenticada real não foi executada porque a senha da conta de teste não está disponível neste ambiente.

### Linha de base antes da migration

Consultas agregadas e somente leitura em 22/07/2026:

| Dimensão | Valor |
|---|---:|
| Demandas | 379 |
| Históricos | 385 |
| Perfis | 5 |
| Números duplicados | 0 |
| Históricos órfãos | 0 |
| Demandas com exatamente um evento | 376 |
| Status `Tramitado` | 262 |
| Responsáveis textuais distintos | 16 |
| Vencidas aparentes | 23 |
| Sem prazo final | 354 |
| Sem prazo interno | 369 |

Esses valores devem permanecer iguais depois da expansão, exceto pelas novas distribuições de situação de prazo:

- `limite1_situacao`: `definido` quando `limite1` existe; caso contrário `nao_informado`;
- `limite2_situacao`: `definido` quando `limite2` existe; caso contrário `nao_informado`.

### Condições de parada atuais

O Ciclo 3 está bloqueado antes de merge e produção por:

1. ambiente SQL isolado ainda não criado;
2. branch Supabase cotada em **US$ 0,01344 por hora**, dependente de autorização expressa;
3. backup restaurável da produção não confirmado pelo conector disponível;
4. conta de teste sem senha acessível para smoke autenticado.

Não aplicar a migration em produção para “testar”. Não executar DDL temporário no banco real, nem mesmo com `ROLLBACK`, como substituto da homologação prevista.

### Ordem restante do Ciclo 3

1. obter autorização para a branch Supabase ou disponibilizar ambiente PostgreSQL local equivalente;
2. executar todas as migrations no ambiente isolado;
3. repetir aplicação em base limpa e, quando possível, em cópia segura da linha de base;
4. executar invariantes, testes das RPCs v1, RLS e leitura nova;
5. confirmar backup restaurável da produção;
6. aplicar a migration integral e versionada;
7. repetir invariantes em produção;
8. homologar o frontend contra o schema expandido;
9. atualizar este handoff e o PR;
10. somente então promover o PR, mesclar e publicar Production.

### Rollback

A expansão é aditiva. Em falha do frontend:

- manter as colunas novas;
- reverter para o deployment do Ciclo 2;
- não apagar colunas, históricos ou eventos;
- corrigir migration/RPC por nova migration versionada.

## Ciclo 2 — semântica única e filtros tipados

- PR `#39`, merge `fc37ba5`;
- `src/domain/workSemantics.ts` é a fonte para acompanhamento, providência CTRH e encerramento;
- filtros e URL usam contratos tipados;
- links legados são normalizados;
- o card “Demandas Ativas” foi renomeado para “Em acompanhamento”;
- busca, recentes, período, Excel e acessibilidade foram preservados;
- 189 testes e 18 cenários Playwright aprovados;
- Production serve o artefato validado do Ciclo 2.

## Ciclo 1 — retirada de dados reais do bundle público

- PR `#37`, merge `048a5de`;
- acervo administrativo movido para `scripts/bootstrap/initial-demandas.json`;
- modo local usa somente oito demandas sintéticas;
- modo local é recusado quando `PROD=true`;
- `check-public-bundle` verifica os 50 identificadores administrativos;
- nenhum deployment histórico foi apagado;
- 52 deployments servíveis anteriores à correção permanecem inventariados para o Ciclo 13, que exige autorização destrutiva específica.

## Ciclo 0 — linha de base e decisões

- PR `#36`, merge `71794f6`;
- `AGENTS.md`, `docs/PRODUCT_CONTEXT.md`, Plano Mestre, especificação e três ADRs versionados;
- decisões de status, prazos, próxima ação, responsabilidade, histórico e exclusão lógica fixadas;
- linha de base remota registrada sem divergência;
- nenhuma alteração funcional ou de dados.

## Próximo ciclo autorizado

**Nenhum ciclo seguinte está autorizado enquanto o Ciclo 3 permanecer aberto.**

Depois da homologação SQL, aplicação segura, merge e validação de Production do Ciclo 3, o próximo ciclo será:

**Ciclo 4 — Mutações transacionais, autoria e exclusão lógica.**

Ele deverá criar RPCs v2 auditáveis, preservar transações, autoria por `auth.uid()`, impedir exclusão física e manter compatibilidade até a migration de contrato do Ciclo 13.

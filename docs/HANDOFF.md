# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **2026-07-22 — Ciclo 3 concluído em banco, GitHub e Production**

## Estado final

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| PR do Ciclo 3 | `#40` — mesclado |
| Merge | `d219ee73092337e28c95ccd4985f6f5502360963` |
| Commit operacional de Production | `ec3646316eb25f3d1e6760760f9d6e1b7012d0d1` |
| Commit atual da `main` | `31a763c23e6904f85baa0b7d16b0252c02b7f7aa` antes deste fechamento documental |
| Production | `https://demandas-rhsme-expansao.vercel.app/` |
| Deployment do Ciclo 3 | `dpl_EhWSfdubeVoouFbgNQA446UNVXAV` — `READY` |
| Bloqueio automático | restaurado |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, saudável |
| Migration | aplicada, homologada e alinhada ao histórico remoto |
| Próximo ciclo | Ciclo 4 autorizado |

O domínio principal responde HTTP 200 e serve o frontend do Ciclo 3. O banco contém o schema expandido e preserva 379 demandas, 385 históricos e 5 perfis.

## Ciclo 3 — entrega

### Modelo de demandas

Foram acrescentados:

- `responsavel_id`;
- `proxima_acao` e `proxima_acao_em`;
- situação e justificativa dos dois prazos;
- `link_origem` e `origem`;
- `deleted_at`, `deleted_by` e `deletion_reason`.

### Modelo de histórico

Foram acrescentados:

- `tipo_evento`;
- `status_anterior`;
- `alteracoes` em JSON.

### Regras aplicadas ao legado

- 379 registros anteriores classificados como `legado`;
- data existente classificada como `definido`;
- ausência de data classificada como `nao_informado`;
- primeiro histórico de cada demanda classificado como `criacao`;
- seis eventos posteriores classificados como `mudanca_status`;
- nenhuma autoria, responsabilidade por UUID, justificativa ou status anterior inventado.

### Migration versionada

```text
supabase/migrations/20260722101325_20260722090000_central_trabalho_expand.sql
```

O prefixo corresponde à versão registrada pelo Supabase remoto. A migration é aditiva e não remove colunas, funções, grants ou RPCs.

## Decisão sem custo adicional

O responsável pelo produto recusou a branch Supabase paga de US$ 0,01344 por hora.

A decisão foi registrada no `ADR-004` e substituída por Supabase efêmero no GitHub Actions. O gate:

1. aplicou as migrations anteriores;
2. inseriu fixture sintética legada;
3. aplicou o Ciclo 3;
4. validou snapshots, backfill, constraints, índices e RPCs v1;
5. reaplicou a cadeia completa do zero;
6. destruiu o ambiente.

Nenhum dado real, credencial remota ou recurso pago foi usado.

## Salvaguarda do plano gratuito

Antes da expansão, a migration criou:

```text
private.cycle3_backup_sme_demandas_20260722
private.cycle3_backup_sme_historico_20260722
private.cycle3_backup_perfis_usuarios_20260722
private.cycle3_backup_manifest_20260722
```

O manifesto preserva 379 demandas, 385 históricos e 5 perfis. `anon` e `authenticated` não possuem acesso.

Esses snapshots reduzem o risco específico da migration, mas não substituem backup externo contra perda total do projeto. Remover somente por migration posterior após estabilidade confirmada.

## Evidências finais

### Aplicação

- instalação pelo lockfile: PASS;
- auditoria e assinaturas: PASS;
- lint: PASS;
- 204 testes: PASS;
- build e orçamento: PASS;
- scanner do bundle: PASS;
- Playwright desktop/mobile: PASS.

### Banco efêmero

- aplicação sobre dados legados: PASS;
- snapshots e manifesto: PASS;
- backfill: PASS;
- constraints e índices: PASS;
- RPCs v1: PASS;
- replay completo do zero: PASS;
- destruição do ambiente: PASS.

### Produção

| Invariante | Resultado |
|---|---:|
| Demandas | 379 |
| Históricos | 385 |
| Perfis | 5 |
| Duplicidades | 0 |
| Históricos órfãos | 0 |
| Origens `legado` | 379 |
| Prazo interno definido / não informado | 10 / 369 |
| Prazo final definido / não informado | 25 / 354 |
| Eventos criação / posteriores | 379 / 6 |
| Status anteriores inferidos | 0 |
| Exclusões lógicas | 0 |
| Checks `NOT VALID` | 5 |
| Índices do Ciclo 3 | 4 |

As RPCs v1 foram testadas em transação revertida. Nenhum registro de teste permaneceu no banco.

## Compatibilidade e rollback

- o frontend lê o schema expandido;
- registros logicamente excluídos ficam fora da carteira;
- mappers fornecem defaults para linhas antigas;
- as RPCs v1 permanecem operacionais até o Ciclo 4;
- busca, filtros, Excel, Realtime, rotas e papéis foram preservados.

Em incidente:

- manter schema e snapshots;
- reverter para o deployment estável anterior;
- não apagar dados, colunas ou histórico;
- corrigir o banco somente por nova migration versionada.

## Próximo ciclo autorizado

**Ciclo 4 — Mutações transacionais, autoria e exclusão lógica.**

Objetivo: criar RPCs v2 auditáveis, registrar autoria por `auth.uid()`, impedir exclusão física e manter compatibilidade durante a transição.

## Histórico resumido

- **Ciclo 0:** contexto, decisões e linha de base;
- **Ciclo 1:** retirada dos dados reais do bundle público;
- **Ciclo 2:** semântica única e filtros tipados;
- **Ciclo 3:** expansão aditiva, homologação sem custo, aplicação segura e publicação em Production.

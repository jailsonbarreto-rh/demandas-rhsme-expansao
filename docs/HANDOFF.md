# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **2026-07-22 — Ciclo 3 aplicado ao banco; PR e frontend em fechamento**

## Estado atual

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| `main` remota | `fc37ba5` — Ciclo 2 |
| Branch | `feat/expandir-modelo-central-trabalho-ciclo-3` |
| PR | `#40` — aberto, rascunho e mesclável |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, saudável |
| Migration do Ciclo 3 | **aplicada e validada em produção** |
| Frontend de Production | ainda serve o Ciclo 2 até o merge e promoção final |
| Plano versionado | SHA-256 `C78B6F7FE840BBFC6B32F401D27B609681C1881CB146B25E72E8905F36AA0B87` |

O banco já possui o contrato expandido. A aplicação antiga continua funcionando porque a mudança foi aditiva e preservou as RPCs v1. O trabalho restante do Ciclo 3 é concluir a última CI do nome alinhado da migration, mesclar o PR e promover o Preview validado para Production.

## Ciclo 3 — o que foi entregue

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

### Regras de migração

- os 379 registros anteriores foram classificados como `legado`;
- data já existente virou situação `definido`;
- ausência de data virou `nao_informado`;
- o primeiro histórico conhecido de cada demanda foi classificado como `criacao`;
- os seis eventos posteriores foram classificados como `mudanca_status`;
- nenhuma autoria, responsabilidade por UUID, justificativa ou status anterior foi inventado.

### Arquivo versionado

```text
supabase/migrations/20260722101325_20260722090000_central_trabalho_expand.sql
```

O prefixo `20260722101325` corresponde à versão registrada pelo Supabase remoto. A parte restante preserva o identificador funcional originalmente definido no Plano Mestre.

## Decisão sem custo adicional

O responsável pelo produto recusou a branch Supabase paga de US$ 0,01344 por hora.

A decisão foi registrada no `ADR-004` e substituída por:

1. Supabase efêmero no GitHub Actions;
2. fixture sintética representando dados legados;
3. aplicação real da migration nesse banco descartável;
4. testes de backfill, constraints, índices e RPCs v1;
5. reaplicação da cadeia completa do zero;
6. destruição automática do ambiente.

O gate foi aprovado integralmente e não utilizou dados reais, credenciais remotas nem recurso pago.

## Salvaguarda do plano gratuito

Como o projeto utiliza o plano gratuito, sem backup automático acessível, a migration criou antes da expansão:

```text
private.cycle3_backup_sme_demandas_20260722
private.cycle3_backup_sme_historico_20260722
private.cycle3_backup_perfis_usuarios_20260722
private.cycle3_backup_manifest_20260722
```

Contagens preservadas no manifesto:

- 379 demandas;
- 385 históricos;
- 5 perfis.

`anon` e `authenticated` não possuem acesso aos snapshots. Eles são uma salvaguarda limitada ao risco desta migration, não um backup externo contra perda total do projeto. Devem ser removidos somente por migration posterior após estabilidade confirmada.

## Validações concluídas

### CI da aplicação

- instalação pelo lockfile: PASS;
- auditoria de vulnerabilidades: PASS;
- assinaturas e proveniência: PASS;
- lint: PASS;
- 204 testes: PASS;
- build: PASS;
- orçamento e scanner do bundle: PASS;
- Playwright desktop/mobile: PASS.

### Banco efêmero

- base anterior criada: PASS;
- fixture legada inserida: PASS;
- migration aplicada sobre dados existentes: PASS;
- snapshots e manifesto: PASS;
- backfill: PASS;
- constraints e índices: PASS;
- RPCs v1: PASS;
- cadeia completa reaplicada do zero: PASS;
- ambiente destruído: PASS.

### Produção após migration

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

As RPCs v1 foram testadas em transação revertida. Nenhum registro de teste permaneceu no banco e as contagens continuaram 379/385/5.

## Compatibilidade do frontend

- o repositório lê o schema expandido;
- registros logicamente excluídos ficam fora da carteira operacional;
- mappers fornecem defaults seguros para linhas antigas;
- o fallback legado só é usado quando faltam colunas, não para esconder erros de RLS, rede ou autenticação;
- as telas e mutações atuais continuam usando as RPCs v1 até o Ciclo 4;
- busca, filtros, Excel, Realtime, rotas e papéis foram preservados.

## Rollback

Em incidente de frontend:

- manter as colunas e snapshots;
- reverter para o deployment estável do Ciclo 2;
- não apagar dados ou histórico;
- corrigir o banco somente por nova migration versionada.

A migration é aditiva e o frontend do Ciclo 2 já foi confirmado compatível com o schema expandido.

## Passos restantes do Ciclo 3

1. concluir CI após o alinhamento final do nome da migration;
2. confirmar o Preview do mesmo SHA como `READY`;
3. atualizar o PR nº 40 e promovê-lo para revisão;
4. mesclar o PR;
5. promover o artefato validado para Production sem rebuild, quando possível;
6. restaurar o bloqueio de deployments automáticos;
7. confirmar domínio, carregamento e invariantes finais;
8. somente então iniciar o Ciclo 4.

## Próximo ciclo

Depois do fechamento de Production do Ciclo 3:

**Ciclo 4 — Mutações transacionais, autoria e exclusão lógica.**

O ciclo deverá criar RPCs v2 auditáveis, registrar autoria por `auth.uid()`, impedir exclusão física e manter compatibilidade durante a transição.

## Histórico resumido

- **Ciclo 0:** contexto, decisões e linha de base;
- **Ciclo 1:** retirada dos dados reais do bundle público;
- **Ciclo 2:** semântica única e filtros tipados;
- **Ciclo 3:** expansão aditiva do modelo, homologação sem custo e aplicação segura ao Supabase.

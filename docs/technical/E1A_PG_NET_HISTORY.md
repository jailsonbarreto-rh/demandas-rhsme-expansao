# E1A — Paridade histórica das migrations temporárias de `pg_net`

**Projeto:** `CTRH PROCESSOS` (`kdhekkzwcokfrpcrsllr`)  
**Verificação read-only:** 27 de julho de 2026  
**Impacto remoto:** nenhum

## Evidência remota

A tabela `supabase_migrations.schema_migrations` registra, nesta ordem:

| Versão | Nome | Statement registrado |
|---|---|---|
| `20260723231805` | `enable_pg_net_for_r3_user_provisioning` | `create extension if not exists pg_net with schema extensions;` |
| `20260723232308` | `remove_pg_net_after_r3_user_provisioning` | `drop extension if exists pg_net;` |

Os arquivos homônimos foram reconstruídos em `supabase/migrations/` com os statements exatos. Eles representam fatos históricos já aplicados; não constituem novas alterações de banco.

## Invariantes

- a habilitação precede a remoção;
- o último statement da sequência referente a `pg_net` é a remoção;
- `pg_net` não permanece instalado no projeto remoto;
- os arquivos não devem ser reaplicados em Production;
- nenhuma tabela, função, grant ou dado operacional foi modificado pelo E1A.

## Validação automatizada

`src/migrations/pgNetHistory.test.ts` exige:

1. presença dos dois arquivos homônimos;
2. igualdade exata dos statements;
3. ausência de qualquer outra migration local contendo `pg_net`;
4. encerramento da sequência com `drop extension if exists pg_net;`.

## Rollback

Se a reconstrução documental estiver incorreta, reverta somente os dois arquivos SQL, o teste e esta documentação. Não altere `supabase_migrations.schema_migrations` e não execute DDL remoto para desfazer o E1A.

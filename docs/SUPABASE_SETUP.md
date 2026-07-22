# Supabase e operação multiusuário

O projeto Supabase da Central de Demandas é o **CTRH PROCESSOS**, ref `kdhekkzwcokfrpcrsllr`, na região `sa-east-1`.

A aplicação mantém dois modos:

- `supabase`: persistência compartilhada, autenticação real, RLS e Realtime;
- `local`: desenvolvimento e testes com oito demandas sintéticas; recusado quando `PROD=true`.

## 1. Schema e migrations

A cadeia atualmente aplicada é:

```text
supabase/migrations/20260707000000_sme_demandas.sql
supabase/migrations/20260713211616_revoke_anon_operational_rpcs.sql
supabase/migrations/20260713211703_add_foreign_key_indexes.sql
supabase/migrations/20260717002408_batch_import_audit_20260716.sql
supabase/migrations/20260717003552_batch_import_allow_legacy_classifications.sql
supabase/migrations/20260722101325_20260722090000_central_trabalho_expand.sql
```

O último arquivo preserva no nome a identificação funcional original do Ciclo 3 e usa, como prefixo, a versão efetivamente registrada pelo Supabase remoto.

Para um projeto novo:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

As migrations iniciais criam as tabelas `perfis_usuarios`, `sme_demandas` e `sme_historico`, habilitam RLS e Realtime, instalam as RPCs transacionais e revogam a execução anônima das funções privilegiadas.

## 2. Ciclo 3 — expansão aditiva

A migration do Ciclo 3 foi aplicada em produção em 22/07/2026 e é exclusivamente aditiva. Ela acrescentou:

- vínculo opcional de responsável por UUID;
- próxima ação e data de acompanhamento;
- situação e justificativa dos dois prazos;
- link e origem do registro;
- campos de exclusão lógica;
- tipo de evento, status anterior e alterações estruturadas no histórico;
- checks `NOT VALID`, índices operacionais e gatilhos temporários de compatibilidade com as RPCs v1.

Ela não removeu colunas, funções, grants ou RPCs. Os 379 registros existentes foram classificados como `legado`. Uma data foi classificada como `definido` somente quando já existia; a ausência foi classificada como `nao_informado`. Nenhuma autoria, responsabilidade por UUID, justificativa ou status anterior foi inventado.

### 2.1 Salvaguarda do plano gratuito

A organização utiliza o plano gratuito, sem backup automático acessível. Antes de alterar o contrato público, a própria migration criou snapshots privados de:

```text
private.cycle3_backup_sme_demandas_20260722
private.cycle3_backup_sme_historico_20260722
private.cycle3_backup_perfis_usuarios_20260722
private.cycle3_backup_manifest_20260722
```

Os papéis `anon` e `authenticated` não possuem acesso a essas tabelas. O manifesto preservou as contagens anteriores: 379 demandas, 385 históricos e 5 perfis.

Esses snapshots são uma salvaguarda limitada ao risco desta migration. Não substituem backup externo contra perda integral do projeto. Devem ser removidos apenas por migration posterior, depois da estabilidade confirmada.

### 2.2 Homologação sem custo adicional

A migration é testada no GitHub Actions por:

```text
.github/workflows/supabase-local-migrations.yml
supabase/tests/cycle3_legacy_fixture.sql
supabase/tests/cycle3_invariants.sql
```

O gate inicia um Supabase efêmero, aplica as cinco migrations anteriores, insere dados sintéticos legados, aplica o Ciclo 3, valida snapshots, backfill, constraints, índices e RPCs v1, recria a base do zero e destrói o ambiente ao final.

Nenhum dado real, credencial remota ou branch paga é usado.

## 3. Estado validado após a aplicação

As verificações de produção confirmaram:

| Dimensão | Resultado |
|---|---:|
| Demandas | 379 |
| Históricos | 385 |
| Perfis | 5 |
| Números duplicados | 0 |
| Históricos órfãos | 0 |
| Registros classificados como `legado` | 379 |
| Prazo interno definido | 10 |
| Prazo interno não informado | 369 |
| Prazo final definido | 25 |
| Prazo final não informado | 354 |
| Eventos de criação | 379 |
| Eventos posteriores | 6 |
| Status anterior inferido | 0 |
| Registros excluídos logicamente | 0 |
| Índices do Ciclo 3 | 4 |
| Checks `NOT VALID` | 5 |

As RPCs v1 de criação e mudança de status foram testadas dentro de uma transação revertida. O teste confirmou o novo contrato e deixou zero registros de teste na produção.

## 4. Dados e usuários iniciais

O acervo administrativo original de 50 demandas permanece em `scripts/bootstrap/initial-demandas.json`. Esse arquivo é consumido apenas pelo comando administrativo `npm run bootstrap:supabase`, está fora de `src` e não integra o bundle público.

O bootstrap valida o JSON com schema estrito, é idempotente por número e consegue reparar histórico ausente. Ele não é a fonte autoritativa do estado atual do banco.

No navegador, o modo local usa exclusivamente `src/data/demoDemandas.ts`, com oito registros sintéticos identificados por `DEMO-`.

Perfis configurados:

| E-mail | Nível | Status |
|---|---|---|
| `wilson.mpeixoto@rioeduca.net` | administrador | ativo |
| `jailsonbsilva@rioeduca.net` | administrador | ativo |
| `teste@rioeduca.net` | editor | ativo |
| `ernane.jann@rioeduca.net` | leitor | pendente |

Senhas, chaves secretas e credenciais administrativas não devem ser registradas no Git nem expostas ao Vite.

## 5. Integração Vercel

A integração Supabase–Vercel sincroniza as variáveis públicas:

```dotenv
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
```

Também podem existir os equivalentes `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

O `vite.config.ts` expõe ao bundle somente credenciais públicas. Chaves secretas, URLs PostgreSQL e senhas permanecem indisponíveis no navegador.

Configuração explícita opcional:

```dotenv
VITE_APP_MODE=supabase
VITE_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

Configuração parcial produz erro controlado. Em produção, `VITE_APP_MODE=local` também é recusado.

## 6. Compatibilidade da aplicação

O repositório remoto tenta o contrato expandido e mantém um fallback legado somente para ausência inequívoca de coluna ou cache de schema. Esse fallback não mascara falhas de RLS, autenticação ou rede.

Com o schema expandido ativo:

- `sme_demandas` é lida com os campos novos e `deleted_at is null`;
- linhas antigas recebem defaults seguros no mapper;
- as mutações continuam temporariamente nas RPCs v1;
- os gatilhos classificam somente situação de prazo e tipo de evento necessários à compatibilidade;
- o Ciclo 4 substituirá as mutações v1 por contratos auditáveis v2.

## 7. Autorizações preservadas

Continuam homologados:

1. administrador consulta e gerencia perfis, edita e exclui demandas;
2. editor cria e edita por fluxos autorizados, mas não exclui;
3. leitor ativo apenas consulta;
4. perfil pendente não acessa dados operacionais;
5. inserções diretas em demandas e histórico são recusadas;
6. alteração direta de `status` é recusada;
7. criação e mudança de status funcionam pelas RPCs transacionais;
8. a RPC de bootstrap é exclusiva da `service_role`;
9. `anon` não executa RPCs operacionais;
10. o último administrador ativo não pode ser rebaixado nem removido;
11. Realtime permanece habilitado para demandas e histórico.

## 8. Verificação e recuperação

Depois de cada alteração consolidada:

```bash
npm ci
npm run check:full
```

No deployment Vercel, confirmar:

- login com conta real;
- carregamento do acervo remoto;
- atualização via Realtime;
- ações conforme o papel;
- persistência após sair, atualizar e entrar novamente.

O gate inclui scanner contra dados administrativos no bundle público e Playwright em desktop e mobile.

Em falha de frontend após uma migration aditiva:

- manter as colunas novas;
- reverter para o último deployment estável;
- não apagar colunas, históricos ou snapshots durante incidente;
- corrigir o banco somente por nova migration versionada.

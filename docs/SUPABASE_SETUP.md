# Supabase e operação multiusuário

O projeto Supabase de homologação/produção da Central de Demandas é o **CTRH PROCESSOS**, ref `kdhekkzwcokfrpcrsllr`, na região `sa-east-1`.

A aplicação mantém dois modos com limites explícitos:

- `supabase`: persistência compartilhada, autenticação real, RLS e atualização Realtime;
- `local`: ambiente de desenvolvimento/teste com oito demandas sintéticas; é recusado quando `PROD=true`.

## 1. Schema e migrations

O repositório contém:

```text
supabase/migrations/20260707000000_sme_demandas.sql
supabase/migrations/20260713211616_revoke_anon_operational_rpcs.sql
supabase/migrations/20260713211703_add_foreign_key_indexes.sql
supabase/migrations/20260717002408_batch_import_audit_20260716.sql
supabase/migrations/20260717003552_batch_import_allow_legacy_classifications.sql
supabase/migrations/20260722090000_central_trabalho_expand.sql
```

Para um projeto novo:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

As migrations iniciais criam as tabelas `perfis_usuarios`, `sme_demandas` e `sme_historico`, habilitam RLS e Realtime, instalam as RPCs atômicas e revogam explicitamente a execução anônima das funções privilegiadas.

A migration `20260722090000_central_trabalho_expand.sql`, referente ao Ciclo 3 do Plano Mestre, é **somente aditiva**. Ela acrescenta:

- vínculo opcional de responsável por UUID;
- próxima ação e data de acompanhamento;
- situação e justificativa dos dois prazos;
- link e origem do registro;
- campos de exclusão lógica;
- tipo, status anterior e alterações estruturadas no histórico;
- checks `NOT VALID`, índices operacionais e gatilhos temporários de compatibilidade com as RPCs v1.

Ela não remove colunas, funções, grants ou RPCs existentes. Os registros atuais são classificados como `legado`; a presença de uma data é a única informação usada para preencher `definido`, e nenhuma autoria, status anterior, responsável ou prazo é inventado.

### 1.1 Ordem segura do Ciclo 3

A expansão deve respeitar esta ordem:

1. registrar a linha de base e confirmar o backup restaurável;
2. testar a migration em banco isolado ou homologação;
3. validar contagens, duplicidades e relações;
4. homologar o frontend compatível em Preview;
5. aplicar a migration versionada com um único executor;
6. repetir invariantes e smoke de leitura;
7. publicar o frontend somente depois de o schema expandido estar íntegro.

Não aplicar trechos avulsos no SQL Editor. A migration integral deve permanecer sincronizada com `supabase_migrations.schema_migrations`.

Consultas mínimas após a aplicação:

```sql
select count(*) from public.sme_demandas;
select count(*) from public.sme_historico;
select numero, count(*)
from public.sme_demandas
group by numero
having count(*) > 1;
select h.id
from public.sme_historico h
left join public.sme_demandas d on d.id = h.demanda_id
where d.id is null;
select limite1_situacao, count(*)
from public.sme_demandas
group by limite1_situacao;
select limite2_situacao, count(*)
from public.sme_demandas
group by limite2_situacao;
```

## 2. Dados e usuários iniciais

O acervo administrativo original de 50 demandas permanece em `scripts/bootstrap/initial-demandas.json`. Esse arquivo é consumido apenas pelo comando administrativo `npm run bootstrap:supabase`, está fora de `src` e não integra o grafo Vite nem o bundle público.

O bootstrap valida o JSON com schema estrito antes de qualquer acesso remoto, é idempotente por número e é capaz de reparar histórico ausente. Ele não é a fonte autoritativa do estado atual do banco. Na leitura agregada e somente leitura de 22/07/2026, antes da aplicação do Ciclo 3, o projeto remoto continha:

- 379 demandas;
- 385 históricos;
- 5 perfis;
- nenhum número duplicado;
- nenhum histórico órfão.

No navegador, o modo local usa exclusivamente `src/data/demoDemandas.ts`, com oito registros identificados pelo prefixo `DEMO-` e usuários de demonstração. As fixtures sintéticas já usam o contrato expandido e normalizam dados antigos do `localStorage` sem recorrer ao acervo real.

Perfis configurados:

| E-mail | Nível | Status |
|---|---|---|
| `wilson.mpeixoto@rioeduca.net` | administrador | ativo |
| `jailsonbsilva@rioeduca.net` | administrador | ativo |
| `teste@rioeduca.net` | editor | ativo |
| `ernane.jann@rioeduca.net` | leitor | pendente |

Senhas, chaves secretas e credenciais administrativas não devem ser registradas no Git ou em variáveis expostas ao Vite.

## 3. Integração Vercel

A integração oficial Supabase–Vercel sincroniza automaticamente as variáveis públicas:

```dotenv
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
```

Ela também pode fornecer os equivalentes `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

O `vite.config.ts` expõe ao bundle somente essas credenciais públicas. Variáveis como `SUPABASE_SECRET_KEY`, URLs PostgreSQL e senhas permanecem indisponíveis no navegador.

Quando uma dupla completa de variáveis públicas estiver presente, a aplicação inicia automaticamente no modo Supabase. Também é possível usar configuração explícita:

```dotenv
VITE_APP_MODE=supabase
VITE_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

Configuração parcial produz erro controlado e nunca faz fallback silencioso.
Em produção, `VITE_APP_MODE=local` também produz erro controlado, mesmo que variáveis Supabase estejam presentes.

## 4. Compatibilidade durante a expansão

Enquanto a migration do Ciclo 3 ainda não estiver disponível no banco, o repositório remoto tenta o contrato expandido e recua apenas diante de erro inequívoco de coluna ausente ou cache de schema. O fallback usa o mesmo contrato legado já homologado.

Depois da expansão:

- `sme_demandas` é lida com os campos novos e `deleted_at is null`;
- linhas antigas recebem defaults seguros no mapper;
- as mutações continuam usando temporariamente as RPCs v1;
- os gatilhos da migration derivam apenas situação de prazo e tipo de evento necessários à compatibilidade;
- o Ciclo 4 substituirá essas mutações pelos contratos auditáveis v2.

Esse mecanismo não deve mascarar erros comuns de RLS, autenticação ou rede: somente ausência do schema expandido autoriza o fallback.

## 5. Critérios já homologados no banco

Foram validados:

1. administrador consulta e gerencia perfis, edita e exclui demandas;
2. editor cria e edita por fluxos autorizados, mas não exclui;
3. leitor ativo apenas consulta;
4. perfil pendente não acessa dados operacionais;
5. inserções diretas em demandas e histórico são recusadas;
6. alteração direta de `status` é recusada;
7. criação e mudança de status funcionam somente pelas RPCs transacionais;
8. a RPC de bootstrap é exclusiva da `service_role`;
9. a role `anon` não executa RPCs operacionais;
10. o último administrador ativo não pode ser rebaixado nem removido;
11. Realtime está habilitado para demandas e histórico.

A migration do Ciclo 3 não altera essas autorizações nem revoga APIs. Os novos campos ainda não constituem requisito de mutação funcional neste ciclo.

## 6. Verificação do deployment

Depois de cada alteração consolidada:

```bash
npm ci
npm run check:full
```

No deployment Vercel, confirme:

- login com conta real do Supabase Auth;
- carregamento do acervo remoto esperado;
- atualização em outra sessão ou aba via Realtime;
- diferenças de ações entre administrador, editor e leitor;
- persistência após sair, atualizar a página e entrar novamente.

O gate inclui `npm run check:public-bundle`, que compara todos os números do acervo administrativo com todos os arquivos gerados em `dist/assets`. A verificação falha sem imprimir o identificador encontrado.

Para o Ciclo 3, o smoke deve ser executado duas vezes quando houver ambiente seguro disponível:

1. frontend novo contra schema antigo, comprovando o fallback;
2. frontend novo contra schema expandido, comprovando os campos novos e o filtro de exclusão lógica.

## 7. Backup e recuperação

Antes de migration material em produção, confirmar no Dashboard um backup restaurável ou produzir dump lógico fora do repositório e do bundle. Registrar data, horário, integridade e local seguro do arquivo sem imprimir dados operacionais nos logs.

O modo local não é mecanismo de rollback de produção. Como a expansão do Ciclo 3 é aditiva, o rollback operacional preferencial é manter as colunas e reverter o frontend para o deployment anterior. Não apagar colunas durante incidente.

Em caso de falha na integração, mantenha o banco intacto, corrija a configuração pública e republique o último commit conhecido como estável no modo Supabase:

```dotenv
VITE_APP_MODE=supabase
```

Se `VITE_APP_MODE=local` estiver configurado na Vercel, remova a sobrescrita antes do novo deployment. O modo local continua disponível apenas no servidor de desenvolvimento e nos testes automatizados.

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
```

Para um projeto novo:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

As migrations criam as tabelas `perfis_usuarios`, `sme_demandas` e `sme_historico`, habilitam RLS e Realtime, instalam as RPCs atômicas e revogam explicitamente a execução anônima das funções privilegiadas.

## 2. Dados e usuários iniciais

O acervo administrativo original de 50 demandas permanece em `scripts/bootstrap/initial-demandas.json`. Esse arquivo é consumido apenas pelo comando administrativo `npm run bootstrap:supabase`, está fora de `src` e não integra o grafo Vite nem o bundle público.

O bootstrap valida o JSON com schema estrito antes de qualquer acesso remoto, é idempotente por número e é capaz de reparar histórico ausente. Ele não é a fonte autoritativa do estado atual do banco. Na leitura agregada e somente leitura de 21/07/2026, o projeto remoto continha:

- 379 demandas;
- 385 históricos;
- 5 perfis.

No navegador, o modo local usa exclusivamente `src/data/demoDemandas.ts`, com oito registros identificados pelo prefixo `DEMO-` e usuários de demonstração.

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

## 4. Critérios já homologados no banco

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

## 5. Verificação do deployment

Depois de cada alteração consolidada:

```bash
npm ci
npm run check:full
```

No deployment Vercel, confirme:

- login com conta real do Supabase Auth;
- carregamento do acervo remoto esperado (379 demandas na linha de base de 21/07/2026);
- atualização em outra sessão ou aba via Realtime;
- diferenças de ações entre administrador, editor e leitor;
- persistência após sair, atualizar a página e entrar novamente.

O gate inclui `npm run check:public-bundle`, que compara todos os números do acervo administrativo com todos os arquivos gerados em `dist/assets`. A verificação falha sem imprimir o identificador encontrado.

## 6. Recuperação de produção

O modo local não é mecanismo de rollback de produção. Em caso de falha na integração, mantenha o banco intacto, corrija a configuração pública e republique o último commit conhecido como estável no modo Supabase:

```dotenv
VITE_APP_MODE=supabase
```

Se `VITE_APP_MODE=local` estiver configurado na Vercel, remova a sobrescrita antes do novo deployment. O modo local continua disponível apenas no servidor de desenvolvimento e nos testes automatizados.

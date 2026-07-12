# Ativação futura do Supabase

Este procedimento deve ser executado somente depois da criação do projeto Supabase. Até lá, mantenha `VITE_APP_MODE=local`; o site atual continuará usando o armazenamento do navegador.

## 1. Criar o projeto

No painel do Supabase, crie um projeto novo e selecione a região **South America (São Paulo) — `sa-east-1`**. Guarde a senha do banco em um gerenciador de senhas.

Em **Authentication > URL Configuration**, cadastre primeiro a URL de Preview da Vercel e, após a validação, a URL de produção. Em **Authentication > Providers > Email**, mantenha o acesso por e-mail e senha habilitado.

## 2. Ligar o repositório e aplicar a migração

Com a CLI do Supabase autenticada:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

O comando aplica `supabase/migrations/20260707000000_sme_demandas.sql`, que cria tabelas, perfis, políticas RLS, RPCs e permissões explícitas. Não copie uma chave secreta para arquivos `VITE_*`.

## 3. Preparar usuários e dados iniciais

Copie `.env.bootstrap.example` para `.env.bootstrap` e preencha somente no computador autorizado:

```dotenv
SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=SUA_CHAVE_SECRETA
BOOTSTRAP_PASSWORD=SENHA_TEMPORARIA_COMBINADA
```

O arquivo `.env.bootstrap` é ignorado pelo Git. Execute:

```bash
npm run bootstrap:supabase
```

O processo é idempotente: prepara os dois administradores, mantém o perfil de teste como editor e importa somente as demandas ainda inexistentes. A senha temporária poderá ser alterada depois pelo Supabase Auth.

## 4. Verificar segurança e dados

No painel, abra **Database > Advisors** e **Security Advisor**. Corrija qualquer alerta antes de ativar a aplicação. No SQL Editor, valide:

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('perfis_usuarios', 'sme_demandas', 'sme_historico');

select email, nivel, status
from public.perfis_usuarios
order by email;

select count(*) as demandas from public.sme_demandas;
select count(*) as historicos from public.sme_historico;
```

As três tabelas devem apresentar RLS ativo; os três perfis iniciais devem estar ativos; a primeira carga deve conter 50 demandas e 50 históricos.

## 5. Ativar primeiro em Preview

No projeto da Vercel, configure apenas no ambiente **Preview**:

```dotenv
VITE_APP_MODE=supabase
VITE_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

Faça um novo deploy de Preview e valide:

1. login dos dois administradores e do perfil de teste;
2. criação, edição, status, histórico e exclusão de uma demanda de teste;
3. aprovação e desativação de perfil pela Administração;
4. atualização Realtime em duas abas;
5. bloqueio de perfil pendente, leitor e e-mail fora de `@rioeduca.net`.

## 6. Ativar Production

Somente após a validação de Preview, replique as três variáveis públicas para **Production** e faça novo deploy. Nunca configure `SUPABASE_SECRET_KEY` ou `BOOTSTRAP_PASSWORD` na aplicação Vercel.

## Rollback imediato

Se surgir qualquer problema, defina na Vercel:

```dotenv
VITE_APP_MODE=local
```

Faça novo deploy. A interface voltará ao armazenamento local sem mudança de layout e o acesso local continuará disponível.

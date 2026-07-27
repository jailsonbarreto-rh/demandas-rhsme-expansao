# Supabase e operação multiusuário

**Atualizado em:** 27 de julho de 2026  
**Estado:** vigente após R3, E0, E1 e reconciliação histórica E1A.

O projeto Supabase da Central de Demandas é o **CTRH PROCESSOS**, ref `kdhekkzwcokfrpcrsllr`, região `sa-east-1`.

A aplicação possui dois modos:

- `supabase`: persistência compartilhada, autenticação real, RLS e Realtime;
- `local`: desenvolvimento e testes somente com dados sintéticos; recusado quando `PROD=true`.

## 1. Fonte de verdade

Supabase é a fonte de verdade dos dados operacionais de Production. Regras de produto não devem ser inferidas apenas do schema ou de migrations históricas.

Consulte, nesta ordem, `AGENTS.md`, o Registro de Decisões, `PRODUCT_CONTEXT.md`, os Planos v3.1/v1.2 e `HANDOFF.md`.

Toda mudança de schema, RPC, RLS, Auth ou Realtime deve usar migration versionada e cumprir a Política de Sincronização Documental v1.1.

## 2. Cadeia de migrations

Os arquivos estão em `supabase/migrations/` e são aplicados pela ordem dos prefixos. Os marcos principais são:

1. perfis, demandas, histórico, RLS, Realtime e RPCs iniciais;
2. revogação de execução anônima e índices;
3. importação auditável do legado;
4. expansão aditiva do modelo;
5. RPCs auditáveis de criação, edição, andamento, status, exclusão e restauração;
6. proteção contra escritas diretas;
7. responsáveis oficiais por UUID no R3.

### 2.1 E1A — paridade histórica de `pg_net`

O histórico remoto registra:

```text
20260723231805_enable_pg_net_for_r3_user_provisioning
20260723232308_remove_pg_net_after_r3_user_provisioning
```

Os arquivos homônimos agora existem no Git com os statements remotos exatos:

```sql
create extension if not exists pg_net with schema extensions;
```

```sql
drop extension if exists pg_net;
```

Esses arquivos representam fatos já aplicados. **Não devem ser reaplicados manualmente em Production.** O estado final esperado e verificado é `pg_net` ausente.

O teste `src/migrations/pgNetHistory.test.ts` exige presença, conteúdo exato, ordem e remoção final. A evidência read-only está em `docs/technical/E1A_PG_NET_HISTORY.md`.

Antes de qualquer migration nova:

```bash
npx supabase link --project-ref kdhekkzwcokfrpcrsllr
npx supabase migration list
npx supabase db push --dry-run
```

O dry-run não pode propor novamente versões já registradas remotamente.

## 3. Modelo operacional atual

`public.sme_demandas` contém identificação, classificação, responsável por UUID, prazos semânticos, próxima ação, data de acompanhamento, status, setor, origem, autoria e exclusão lógica.

`public.sme_historico` contém tipo de evento, estados anterior e resultante, comentário, alterações estruturadas, autoria e data.

Tipos oficiais de evento:

```text
criacao
andamento
mudanca_status
edicao
reatribuicao
alteracao_prazo
exclusao
restauracao
```

## 4. Responsabilidade após o R3

- `responsavel_id` é a identidade oficial;
- o nome é derivado do perfil no servidor;
- novas atribuições usam usuário cadastrado ou ausência explícita;
- nome livre e responsável externo não são opções atuais;
- texto legado sem UUID pode ser preservado sem formar carteira pessoal;
- `Vanessa Migrado` permanece como exceção histórica conhecida;
- `/minhas-demandas` usa igualdade de UUID.

## 5. RPCs operacionais

O frontend utiliza ou possui contratos para:

- `criar_sme_demanda_v2`;
- `editar_sme_demanda`;
- `registrar_andamento_sme_demanda`;
- `transicionar_status_sme_demanda`;
- `excluir_sme_demanda`;
- `restaurar_sme_demanda`;
- `listar_perfis_minimos`.

As mutações obtêm autoria por `auth.uid()`, validam papel no banco e gravam demanda e histórico na mesma transação.

## 6. RLS e segurança

- usuário ativo consulta dados operacionais;
- administrador e editor executam mutações autorizadas;
- somente administrador exclui e restaura;
- leitor não executa mutações;
- perfil pendente ou inativo não acessa dados operacionais;
- `anon` não consulta tabelas nem executa RPCs;
- o cliente não substitui a segurança do banco;
- dados reais, segredos e `service_role` não entram no bundle, fixtures públicas ou logs.

## 7. Fotografia operacional conhecida

Na fotografia read-only de 26/07/2026 havia 379 demandas, 378 vínculos oficiais por UUID, uma informação textual legada sem UUID, 764 históricos e 13 perfis. Essas quantidades não são constantes da aplicação e devem ser consultadas novamente antes de operações materiais.

## 8. Pendências posteriores

Permanecem nos pacotes próprios do Plano Executivo:

- E2: retirada de dados reais da árvore corrente;
- E4: RLS da lixeira e autoria administrativa;
- R1: constraints, contratos, domínios e concorrência;
- R2: paginação, consulta e histórico sob demanda;
- R4 e R5: prazos, próxima providência, andamento e prontuário.

Nenhum desses itens é autorizado pelo E1A.

## 9. Vercel

Variáveis públicas aceitas:

```dotenv
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
```

Production nunca aceita modo local. Configuração parcial deve produzir erro controlado.

## 10. Verificação

Para alteração consolidada:

```bash
npm ci
npm run check:docs
npm run check:full
```

Para migrations materiais, execute também replay integral em ambiente seguro, `migration list`, `db push --dry-run`, invariantes de dados, testes de papéis, RLS, grants, Realtime e atualização dos tipos gerados.

O E1A é exceção apenas no sentido de que não executa DDL: ele reconstrói arquivos históricos já registrados e valida que nenhuma alteração remota foi realizada.

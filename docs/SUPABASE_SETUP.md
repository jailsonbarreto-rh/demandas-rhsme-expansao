# Supabase e operação multiusuário

**Atualizado em:** 1º de agosto de 2026
**Estado:** vigente após R4, R5-1 e a publicação da conclusão funcional inicial.

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
7. responsáveis oficiais por UUID no R3;
8. visibilidade da lixeira e preservação da autoria administrativa no E4 (`20260729133230_security_deleted_visibility_and_actor`).

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
- `/minhas-demandas` usa igualdade de UUID;
- a atribuição não cria posse exclusiva da demanda;
- permissões de mutação derivam do papel e do estado do perfil, não de `responsavel_id`;
- ações registram o usuário executor e não mudam o responsável, salvo reatribuição explícita.

## 5. RPCs operacionais

O frontend utiliza ou possui contratos para:

- `criar_sme_demanda_r4`;
- `editar_sme_demanda_r4`;
- `registrar_andamento_sme_demanda_r4`;
- `transicionar_status_sme_demanda_r4`;
- `excluir_sme_demanda`;
- `listar_perfis_minimos`.

As RPCs obsoletas `criar_sme_demanda` e `atualizar_status_sme_demanda` permanecem definidas apenas para rastreabilidade do schema, sem `EXECUTE` para `public`, `anon`, `authenticated` ou `service_role`, conforme migration `20260729180927_r1_retire_legacy_operational_rpcs.sql`. O frontend não expõe tipos, adaptadores nem chamadas para esses contratos.

As mutações autenticadas obtêm autoria por `auth.uid()`, validam papel no banco e gravam demanda e histórico na mesma transação. Administrador ou editor ativo pode executar a ação permitida em demanda atribuída a outra pessoa; `updated_by` e `sme_historico.created_by` registram o executor, enquanto `responsavel_id` permanece inalterado. Rotinas administrativas sem sessão pessoal somente podem preservar ator explicitamente informado depois de validá-lo.

## 6. RLS e segurança

- usuário ativo consulta demandas ativas e seus históricos;
- somente administrador ativo consulta demandas logicamente excluídas e seus históricos;
- administrador e editor executam mutações autorizadas em qualquer demanda ativa, independentemente do responsável cadastrado;
- somente administrador exclui; nenhum papel da API executa restauração;
- leitor não executa mutações;
- perfil pendente ou inativo não acessa dados operacionais;
- `anon` não consulta tabelas nem executa RPCs;
- o cliente não substitui a segurança do banco;
- dados reais, segredos e `service_role` não entram no bundle, fixtures públicas ou logs.

## 7. Fotografia operacional conhecida

Na verificação pós-E4 de 29/07/2026 havia 379 demandas, nenhuma logicamente excluída, 378 vínculos oficiais por UUID, uma informação textual legada sem UUID, 764 históricos e 13 perfis ativos. Permaneceram 378 `sme_demandas.updated_by` nulos e 378 `sme_historico.created_by` nulos, sem backfill ou autoria inferida. Essas quantidades não são constantes da aplicação e devem ser consultadas novamente antes de operações materiais.

## 8. Conclusão funcional inicial e pendências posteriores

O R5 Essencial reutiliza `registrar_andamento_sme_demanda_r4` e `transicionar_status_sme_demanda_r4`. A auditoria confirmou que andamento preserva o status e que a transição de `Encerrado` para outro status já é aceita com comentário, próxima providência, data e justificativa temporal quando necessária. O pacote não exige nova tabela, coluna, regra RLS ou alteração de dados.

A recuperação de senha usa exclusivamente `auth.resetPasswordForEmail`, o evento `PASSWORD_RECOVERY` e `auth.updateUser`; não exige migration SQL. Em 1º de agosto de 2026, o destino exato `https://demandas-rhsme-expansao.vercel.app/redefinir-senha` foi adicionado e confirmado na configuração de redirects permitidos do Supabase Auth. Fora do desenvolvimento local, o frontend sempre envia esse destino canônico e recusa host externo, HTTP, query string ou fragmento. A interface não consulta a existência da conta e encerra a sessão temporária após a troca.

Na mesma verificação, a política do provedor de e-mail foi alinhada à validação da aplicação: mínimo de oito caracteres e exigência de ao menos uma letra minúscula, uma maiúscula e um dígito. `Prevent use of leaked passwords` permanece desativado porque o projeto está no plano Free e o recurso é restrito ao plano Pro ou superior; não houve alteração de plano. Essa limitação conhecida não reduz as validações fortes aplicadas no cliente e no Supabase Auth.

A mesma auditoria identificou que os nomes anteriores ao R4 ainda possuíam corpos próprios e `EXECUTE` para `authenticated` e `service_role`, permitindo contornar a justificativa de data passada por chamada direta. A migration `20260801044712_r5_essential_harden_pre_r4_progress_status.sql`, já registrada em Production na versão `20260801044712`, os transforma em wrappers das funções R4 e restringe a execução a `authenticated`. Isso preserva compatibilidade sem manter duas implementações das regras.

Permanecem nos pacotes próprios do Plano Executivo:

- E2: retirada de dados reais da árvore corrente, adiada para o pacote final de segurança;
- A1-Core: R1-0 e R1-3 implementados no PR #99; concorrência R1-5 não foi entregue e permanece evolução condicionada;
- R1-1 e R1-4 autônomo: adiados conforme GOV-012;
- R5 avançado: página completa, snapshots, categorias históricas e refinamentos de consulta, todos como evolução condicionada e sem autorização atual;
- R2 e concorrência otimista completa: evolução condicionada a volume, desempenho ou conflito comprovado.

E4, A1-Core, R4 e R5-1 estão concluídos. A conclusão funcional inicial de V1-E-A01 foi implementada nos limites registrados e segue pelos gates de homologação e release; sua conclusão não pré-autoriza outro pacote.

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

O E4 foi aplicado pela migration canônica `20260729133230`, passou por replay integral, invariantes por papel, verificação de grants, Advisors, contagens e logs de API. Não alterou dados existentes, responsáveis, frontend ou Vercel.

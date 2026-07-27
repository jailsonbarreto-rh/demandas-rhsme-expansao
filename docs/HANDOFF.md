# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **27 de julho de 2026 — Pacote E1A**

<!-- IMPLEMENTATION_AUTHORIZATION: none -->

## Estado material

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| Production | `https://demandas-rhsme-expansao.vercel.app/` |
| Deployment efetivo | `dpl_DMrubRz2sDRtN5ZmmjKByDD94kDn` — `READY` |
| SHA efetivo de Production | `c59f8be936b7071cb3f60d147e26e408f60ee6f3` — PR #59 |
| Bloqueio automático de deploy | restaurado pelo PR #60 |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, região `sa-east-1` |
| Última migration remota | `20260724011303_r3_responsaveis_oficiais` |
| Estratégia geral | `docs/execution/Plano_Integrado_Reformulado_CTRH_v3.1.md` |
| Roteiro do Trilho A | `docs/execution/Plano_Executivo_Operacao_Atual_CTRH_v1.2.md` |
| Implementação autorizada após este pacote | nenhuma |
| Próxima atividade prevista no plano | E2, dependente de autorização expressa |

## Pacotes concluídos

- **E0:** cadeia documental v3.1/v1.2 consolidada e gate documental instituído no PR #58.
- **E1:** Production alinhada ao estado funcional da `main`, incluindo o PR #53, pelo PR #59; o bloqueio de deploy foi restaurado pelo PR #60.
- **E1A:** os dois fatos históricos temporários de `pg_net` foram representados no Git por arquivos homônimos e statements idênticos aos registrados remotamente.

O conteúdo do E1A integra o PR #61. Sua presença na `main` registra a conclusão do pacote. Nenhum SQL do E1A foi executado novamente no Supabase.

## Resultado do E1A

Arquivos reconstruídos:

```text
supabase/migrations/20260723231805_enable_pg_net_for_r3_user_provisioning.sql
supabase/migrations/20260723232308_remove_pg_net_after_r3_user_provisioning.sql
```

Statements remotos preservados:

```sql
create extension if not exists pg_net with schema extensions;
```

```sql
drop extension if exists pg_net;
```

Invariantes:

- a habilitação temporária precede a remoção;
- `pg_net` está ausente no estado remoto final;
- nenhuma migration foi reaplicada;
- nenhuma tabela, função, política, grant ou dado de Production foi alterado;
- nenhum Preview ou deployment foi criado pelo E1A;
- a aplicação e o R3 permaneceram inalterados.

A evidência técnica está em `docs/technical/E1A_PG_NET_HISTORY.md` e o gate automatizado em `src/migrations/pgNetHistory.test.ts`.

## Estado funcional preservado

- `responsavel_id` continua sendo a identidade oficial do responsável.
- `/demandas` continua sendo a carteira da equipe.
- `/minhas-demandas` continua sendo a carteira pessoal por UUID.
- Indicadores e filtros continuam contextuais à carteira aberta.
- A paginação padrão de 50 registros e a opção de 100 estão em Production.
- Nenhum dado operacional foi modificado neste pacote.

## Pendências posteriores do plano

- **E2:** remover dados operacionais reais da árvore corrente do Git, sem reescrever histórico nesta etapa.
- **E3:** corrigir semânticas objetivas já previstas.
- **E4:** RLS da lixeira e autoria administrativa.
- **R1:** integridade, contratos e concorrência.
- **R2:** consultas escaláveis e histórico sob demanda.
- **R4:** prazos e próxima providência.
- **R5:** andamento, prontuário e recuperação administrativa.

Nenhuma dessas etapas está autorizada automaticamente pela conclusão do E1A.

## Regra de continuidade

1. nenhuma decisão `OP-Dxx` pode ser inferida dos planos;
2. o responsável pelo produto autoriza expressamente o próximo pacote;
3. cada pacote permanece isolado em branch e PR próprios;
4. alterações de banco futuras devem partir da cadeia de migrations agora reconciliada;
5. nenhum deployment decorre automaticamente do E1A.

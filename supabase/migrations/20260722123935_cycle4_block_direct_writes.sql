-- Ciclo 4 — toda mutação operacional deve passar por uma RPC auditável.

revoke update (
  numero,
  tipo,
  assunto,
  responsavel,
  limite1,
  limite2,
  setor,
  classificacao
) on table public.sme_demandas from authenticated;

revoke delete on table public.sme_demandas from authenticated;

drop policy if exists "editores atualizam demandas"
on public.sme_demandas;

drop policy if exists "administradores ativos excluem demandas"
on public.sme_demandas;

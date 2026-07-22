-- Ciclo 4 — toda remoção operacional deve passar pela RPC de exclusão lógica.

revoke delete on table public.sme_demandas from authenticated;

drop policy if exists "administradores ativos excluem demandas"
on public.sme_demandas;

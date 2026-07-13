create index sme_demandas_created_by_idx
  on public.sme_demandas (created_by);

create index sme_demandas_updated_by_idx
  on public.sme_demandas (updated_by);

create index sme_historico_created_by_idx
  on public.sme_historico (created_by);

create index sme_historico_demanda_id_idx
  on public.sme_historico (demanda_id);

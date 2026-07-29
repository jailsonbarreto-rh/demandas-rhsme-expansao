-- A1-Core / R1-3
-- Retira somente a execução operacional das RPCs obsoletas.
-- Os símbolos permanecem definidos para rastreabilidade; nenhuma permissão privilegiada nova é criada.

revoke all on function public.criar_sme_demanda(
  text, text, text, text, date, date, text, text, text
) from public, anon, authenticated, service_role;

revoke all on function public.atualizar_status_sme_demanda(
  bigint, text, text
) from public, anon, authenticated, service_role;

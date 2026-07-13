revoke all on function public.criar_sme_demanda(
  text, text, text, text, date, date, text, text, text
) from public, anon, authenticated;

revoke all on function public.atualizar_status_sme_demanda(
  bigint, text, text
) from public, anon, authenticated;

grant execute on function public.criar_sme_demanda(
  text, text, text, text, date, date, text, text, text
) to authenticated;

grant execute on function public.atualizar_status_sme_demanda(
  bigint, text, text
) to authenticated;

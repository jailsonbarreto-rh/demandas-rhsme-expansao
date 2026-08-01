-- R5 Essencial — os nomes anteriores ao R4 permanecem como wrappers de
-- compatibilidade, sem manter uma segunda implementação das regras operacionais.
-- A justificativa vazia faz a fronteira R4 rejeitar datas passadas, fechando o
-- contorno que existia nas funções de julho de 2026.

create or replace function public.registrar_andamento_sme_demanda(
  p_demanda_id bigint,
  p_comentario text,
  p_proxima_acao text,
  p_proxima_acao_em date
)
returns public.sme_demandas
language sql
security definer
set search_path = ''
as $$
  select public.registrar_andamento_sme_demanda_r4(
    p_demanda_id,
    p_comentario,
    p_proxima_acao,
    p_proxima_acao_em,
    ''
  );
$$;

create or replace function public.transicionar_status_sme_demanda(
  p_demanda_id bigint,
  p_novo_status text,
  p_comentario text,
  p_proxima_acao text,
  p_proxima_acao_em date
)
returns public.sme_demandas
language sql
security definer
set search_path = ''
as $$
  select public.transicionar_status_sme_demanda_r4(
    p_demanda_id,
    p_novo_status,
    p_comentario,
    p_proxima_acao,
    p_proxima_acao_em,
    ''
  );
$$;

revoke all on function public.registrar_andamento_sme_demanda(bigint, text, text, date)
from public, anon, authenticated, service_role;
grant execute on function public.registrar_andamento_sme_demanda(bigint, text, text, date)
to authenticated;

revoke all on function public.transicionar_status_sme_demanda(bigint, text, text, text, date)
from public, anon, authenticated, service_role;
grant execute on function public.transicionar_status_sme_demanda(bigint, text, text, text, date)
to authenticated;

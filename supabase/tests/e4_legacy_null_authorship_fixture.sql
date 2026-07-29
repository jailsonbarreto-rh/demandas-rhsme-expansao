\set ON_ERROR_STOP on

-- Fixture sintética que representa autoria legada desconhecida antes do E4.
-- O pacote deve preservar esses nulos, nunca inferir ou inventar um ator.
update public.sme_demandas
set updated_by = null
where numero = 'LEGADO-C3-002';

update public.sme_historico
set created_by = null
where demanda_id = (
  select id from public.sme_demandas where numero = 'LEGADO-C3-002'
)
  and comentario = 'Criação legada';

do $$
begin
  if not exists (
    select 1 from public.sme_demandas
    where numero = 'LEGADO-C3-002' and updated_by is null
  ) then
    raise exception 'E4 fixture: demanda legada sem autoria não foi preparada.';
  end if;

  if not exists (
    select 1
    from public.sme_historico h
    join public.sme_demandas d on d.id = h.demanda_id
    where d.numero = 'LEGADO-C3-002'
      and h.comentario = 'Criação legada'
      and h.created_by is null
  ) then
    raise exception 'E4 fixture: histórico legado sem autoria não foi preparado.';
  end if;
end;
$$;

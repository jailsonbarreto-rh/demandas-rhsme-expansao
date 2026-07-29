-- Executar após 20260724011303_r3_responsaveis_oficiais.sql.

do $$
declare
  v_total bigint;
  v_linked bigint;
  v_vanessa bigint;
  v_unlinked_named bigint;
  v_mismatches bigint;
begin
  select count(*) into v_total
  from public.sme_demandas;

  select count(*) into v_linked
  from public.sme_demandas
  where responsavel_id is not null;

  select count(*) into v_vanessa
  from public.sme_demandas
  where responsavel = 'Vanessa Migrado'
    and responsavel_id is null;

  select count(*) into v_unlinked_named
  from public.sme_demandas
  where responsavel_id is null
    and btrim(coalesce(responsavel, '')) <> ''
    and responsavel <> 'Vanessa Migrado';

  select count(*) into v_mismatches
  from public.sme_demandas d
  join public.perfis_usuarios p on p.id = d.responsavel_id
  where d.responsavel is distinct from btrim(p.nome);

  if v_total <> 379 then
    raise exception 'R3: total esperado de 379 demandas; encontrado %.', v_total;
  end if;
  if v_linked <> 378 then
    raise exception 'R3: total esperado de 378 demandas vinculadas; encontrado %.', v_linked;
  end if;
  if v_vanessa <> 1 then
    raise exception 'R3: Vanessa Migrado deveria permanecer como única exceção; encontrado %.', v_vanessa;
  end if;
  if v_unlinked_named <> 0 then
    raise exception 'R3: existem % responsáveis textuais não vinculados além de Vanessa.', v_unlinked_named;
  end if;
  if v_mismatches <> 0 then
    raise exception 'R3: existem % divergências entre UUID e nome oficial.', v_mismatches;
  end if;
end;
$$;

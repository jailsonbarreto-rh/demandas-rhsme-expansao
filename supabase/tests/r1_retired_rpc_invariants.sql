\set ON_ERROR_STOP on

create or replace function pg_temp.assert_true(condition boolean, message text)
returns void
language plpgsql
as $$
begin
  if condition is not true then
    raise exception 'A1-Core: %', message;
  end if;
end;
$$;

select pg_temp.assert_true(
  to_regprocedure(
    'public.criar_sme_demanda(text,text,text,text,date,date,text,text,text)'
  ) is not null,
  'o símbolo criar_sme_demanda deixou de existir'
);
select pg_temp.assert_true(
  to_regprocedure(
    'public.atualizar_status_sme_demanda(bigint,text,text)'
  ) is not null,
  'o símbolo atualizar_status_sme_demanda deixou de existir'
);

select pg_temp.assert_true(
  not has_function_privilege(
    'anon',
    'public.criar_sme_demanda(text,text,text,text,date,date,text,text,text)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'authenticated',
    'public.criar_sme_demanda(text,text,text,text,date,date,text,text,text)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'service_role',
    'public.criar_sme_demanda(text,text,text,text,date,date,text,text,text)',
    'EXECUTE'
  ),
  'criar_sme_demanda permanece executável por papel exposto'
);

select pg_temp.assert_true(
  not has_function_privilege(
    'anon',
    'public.atualizar_status_sme_demanda(bigint,text,text)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'authenticated',
    'public.atualizar_status_sme_demanda(bigint,text,text)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'service_role',
    'public.atualizar_status_sme_demanda(bigint,text,text)',
    'EXECUTE'
  ),
  'atualizar_status_sme_demanda permanece executável por papel exposto'
);

create temporary table a1_retirement_counts (
  demandas bigint not null,
  historico bigint not null
) on commit preserve rows;

insert into a1_retirement_counts (demandas, historico)
select
  (select count(*) from public.sme_demandas),
  (select count(*) from public.sme_historico);

begin;
set local role authenticated;
do $$
declare
  v_create_denied boolean := false;
  v_status_denied boolean := false;
begin
  begin
    perform public.criar_sme_demanda(
      'A1-NEGADA', 'Processo', 'Tentativa por contrato obsoleto', '',
      null, null, 'Aguardando Andamento', 'CTRH', 'Diversos'
    );
  exception when insufficient_privilege then
    v_create_denied := true;
  end;

  begin
    perform public.atualizar_status_sme_demanda(
      1, 'Tramitado', 'Tentativa por contrato obsoleto'
    );
  exception when insufficient_privilege then
    v_status_denied := true;
  end;

  if not v_create_denied or not v_status_denied then
    raise exception 'A1-Core: uma RPC obsoleta aceitou execução autenticada';
  end if;
end;
$$;
rollback;

select pg_temp.assert_true(
  (select count(*) from public.sme_demandas)
    = (select demandas from a1_retirement_counts)
  and (select count(*) from public.sme_historico)
    = (select historico from a1_retirement_counts),
  'a tentativa negada alterou demandas ou histórico'
);

select pg_temp.assert_true(
  has_function_privilege(
    'authenticated',
    'public.criar_sme_demanda_v2(text,text,text,uuid,text,date,text,text,date,text,text,text,date,text,text,text,text)',
    'EXECUTE'
  )
  and has_function_privilege(
    'authenticated',
    'public.editar_sme_demanda(bigint,text,uuid,text,date,text,text,date,text,text,text,text,text,text,date,text)',
    'EXECUTE'
  )
  and has_function_privilege(
    'authenticated',
    'public.registrar_andamento_sme_demanda(bigint,text,text,date)',
    'EXECUTE'
  )
  and has_function_privilege(
    'authenticated',
    'public.transicionar_status_sme_demanda(bigint,text,text,text,date)',
    'EXECUTE'
  ),
  'uma RPC auditável moderna perdeu execução durante a retirada do legado'
);

select 'A1-Core homologado: RPCs obsoletas inertes e contratos modernos preservados' as resultado;

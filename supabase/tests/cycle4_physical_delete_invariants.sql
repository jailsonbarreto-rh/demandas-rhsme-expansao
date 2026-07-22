\set ON_ERROR_STOP on

create or replace function pg_temp.assert_true(condition boolean, message text)
returns void
language plpgsql
as $$
begin
  if condition is not true then
    raise exception 'Ciclo 4: %', message;
  end if;
end;
$$;

select pg_temp.assert_true(
  not has_table_privilege('authenticated', 'public.sme_demandas', 'delete'),
  'o papel authenticated ainda possui privilégio DELETE sobre demandas'
);

select pg_temp.assert_true(
  not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'sme_demandas'
      and cmd = 'DELETE'
  ),
  'a política de exclusão física ainda existe'
);

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

do $$
declare
  v_denied boolean := false;
begin
  begin
    delete from public.sme_demandas
    where numero = 'C4-AUDIT-001';
  exception when insufficient_privilege then
    v_denied := true;
  end;

  if not v_denied then
    raise exception 'Ciclo 4: administrador conseguiu executar DELETE físico';
  end if;
end;
$$;
rollback;

select pg_temp.assert_true(
  exists (select 1 from public.sme_demandas where numero = 'C4-AUDIT-001'),
  'o teste de segurança removeu a demanda auditável'
);

select 'Exclusão física bloqueada; somente a RPC lógica permanece disponível' as resultado;

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
    from unnest(array[
      'numero',
      'tipo',
      'assunto',
      'responsavel',
      'limite1',
      'limite2',
      'setor',
      'classificacao'
    ]) as column_name
    where has_column_privilege(
      'authenticated',
      'public.sme_demandas',
      column_name,
      'update'
    )
  ),
  'o papel authenticated ainda possui UPDATE direto sobre colunas operacionais'
);

select pg_temp.assert_true(
  not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'sme_demandas'
      and cmd in ('UPDATE', 'DELETE')
  ),
  'ainda existe política de UPDATE ou DELETE direto em demandas'
);

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

do $$
declare
  v_update_denied boolean := false;
  v_delete_denied boolean := false;
begin
  begin
    update public.sme_demandas
    set assunto = assunto
    where numero = 'C4-AUDIT-001';
  exception when insufficient_privilege then
    v_update_denied := true;
  end;

  begin
    delete from public.sme_demandas
    where numero = 'C4-AUDIT-001';
  exception when insufficient_privilege then
    v_delete_denied := true;
  end;

  if not v_update_denied then
    raise exception 'Ciclo 4: administrador conseguiu executar UPDATE direto';
  end if;
  if not v_delete_denied then
    raise exception 'Ciclo 4: administrador conseguiu executar DELETE físico';
  end if;
end;
$$;
rollback;

select pg_temp.assert_true(
  exists (
    select 1
    from public.sme_demandas
    where numero = 'C4-AUDIT-001'
      and assunto = 'Segunda edição sequencial'
  ),
  'o teste de segurança alterou ou removeu a demanda auditável'
);

select 'UPDATE e DELETE diretos bloqueados; somente RPCs auditáveis permanecem disponíveis' as resultado;

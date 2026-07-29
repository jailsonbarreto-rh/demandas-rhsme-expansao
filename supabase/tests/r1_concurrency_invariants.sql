\set ON_ERROR_STOP on

create or replace function pg_temp.assert_true(condition boolean, message text)
returns void
language plpgsql
as $$
begin
  if condition is not true then
    raise exception 'R1-5A: %', message;
  end if;
end;
$$;

create or replace function pg_temp.set_actor(p_user_id uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claim.sub', p_user_id::text, true);
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', p_user_id, 'role', 'authenticated')::text,
    true
  );
end;
$$;

select pg_temp.assert_true(
  to_regprocedure(
    'public.editar_sme_demanda_v2(bigint,text,uuid,text,date,text,text,date,text,text,text,text,text,text,date,text,timestamptz)'
  ) is not null,
  'editar_sme_demanda_v2 não existe'
);
select pg_temp.assert_true(
  to_regprocedure(
    'public.registrar_andamento_sme_demanda_v2(bigint,text,text,date,timestamptz)'
  ) is not null,
  'registrar_andamento_sme_demanda_v2 não existe'
);
select pg_temp.assert_true(
  to_regprocedure(
    'public.transicionar_status_sme_demanda_v2(bigint,text,text,text,date,timestamptz)'
  ) is not null,
  'transicionar_status_sme_demanda_v2 não existe'
);
select pg_temp.assert_true(
  to_regprocedure('public.excluir_sme_demanda_v2(bigint,text,timestamptz)') is not null,
  'excluir_sme_demanda_v2 não existe'
);
select pg_temp.assert_true(
  to_regprocedure('public.restaurar_sme_demanda_v2(bigint,text,timestamptz)') is not null,
  'restaurar_sme_demanda_v2 não existe'
);
select pg_temp.assert_true(
  to_regprocedure(
    'private.assert_sme_demanda_version(timestamptz,timestamptz)'
  ) is not null,
  'helper privado de versão não existe'
);

select pg_temp.assert_true(
  (
    select bool_and(
      lower(pg_get_functiondef(p.oid)) like '%for update%'
      and lower(pg_get_functiondef(p.oid)) like '%assert_sme_demanda_version%'
    )
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'editar_sme_demanda_v2',
        'registrar_andamento_sme_demanda_v2',
        'transicionar_status_sme_demanda_v2',
        'excluir_sme_demanda_v2',
        'restaurar_sme_demanda_v2'
      )
  ),
  'toda RPC v2 deve bloquear a linha e comparar a versão'
);

select pg_temp.assert_true(
  (
    select count(*) = 5
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'editar_sme_demanda_v2',
        'registrar_andamento_sme_demanda_v2',
        'transicionar_status_sme_demanda_v2',
        'excluir_sme_demanda_v2',
        'restaurar_sme_demanda_v2'
      )
      and has_function_privilege('authenticated', p.oid, 'EXECUTE')
      and not has_function_privilege('anon', p.oid, 'EXECUTE')
      and not has_function_privilege('service_role', p.oid, 'EXECUTE')
  ),
  'grants das cinco RPCs v2 não correspondem ao contrato'
);

select pg_temp.assert_true(
  not has_function_privilege(
    'authenticated',
    'private.assert_sme_demanda_version(timestamptz,timestamptz)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'service_role',
    'private.assert_sme_demanda_version(timestamptz,timestamptz)',
    'EXECUTE'
  ),
  'helper privado de versão ficou executável por papel exposto'
);

select pg_temp.assert_true(
  has_function_privilege(
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
  )
  and has_function_privilege(
    'authenticated',
    'public.excluir_sme_demanda(bigint,text)',
    'EXECUTE'
  )
  and has_function_privilege(
    'authenticated',
    'public.restaurar_sme_demanda(bigint,text)',
    'EXECUTE'
  ),
  'uma assinatura moderna antiga foi retirada antes do rollout'
);

create temporary table r1_concurrency_baseline (
  demanda_id bigint not null,
  stale_updated_at timestamptz not null,
  responsavel_id uuid,
  historico_antes bigint not null
) on commit preserve rows;

insert into r1_concurrency_baseline (
  demanda_id,
  stale_updated_at,
  responsavel_id,
  historico_antes
)
select
  d.id,
  d.updated_at,
  d.responsavel_id,
  (select count(*) from public.sme_historico h where h.demanda_id = d.id)
from public.sme_demandas d
where d.numero = 'C4-AUDIT-001';

select pg_temp.assert_true(
  (select count(*) = 1 from r1_concurrency_baseline),
  'fixture C4-AUDIT-001 ausente'
);

select pg_sleep(0.02);

begin;
set local role authenticated;
select pg_temp.set_actor('22222222-2222-2222-2222-222222222222');
select public.registrar_andamento_sme_demanda_v2(
  (select demanda_id from r1_concurrency_baseline),
  'Primeiro andamento versionado aceito.',
  'Conferir retorno versionado', date '2026-09-20',
  (select stale_updated_at from r1_concurrency_baseline)
);
commit;

select pg_temp.assert_true(
  (
    select d.updated_at is distinct from b.stale_updated_at
    from public.sme_demandas d
    join r1_concurrency_baseline b on b.demanda_id = d.id
  ),
  'mutação versionada válida não avançou updated_at'
);
select pg_temp.assert_true(
  (
    select count(*) = b.historico_antes + 1
    from public.sme_historico h
    cross join r1_concurrency_baseline b
    where h.demanda_id = b.demanda_id
    group by b.historico_antes
  ),
  'mutação versionada válida não criou exatamente um evento'
);

create temporary table r1_conflict_state as
select
  to_jsonb(d) as demanda,
  (select count(*) from public.sme_historico h where h.demanda_id = d.id) as historico
from public.sme_demandas d
join r1_concurrency_baseline b on b.demanda_id = d.id;

begin;
set local role authenticated;
select pg_temp.set_actor('22222222-2222-2222-2222-222222222222');
do $$
declare
  v_id bigint := (select demanda_id from r1_concurrency_baseline);
  v_stale timestamptz := (select stale_updated_at from r1_concurrency_baseline);
  v_current public.sme_demandas := (
    select d from public.sme_demandas d where d.id = v_id
  );
  v_conflicts integer := 0;
begin
  begin
    perform public.editar_sme_demanda_v2(
      v_id,
      'Edição concorrente que não deve persistir',
      v_current.responsavel_id,
      v_current.responsavel,
      v_current.limite1,
      v_current.limite1_situacao,
      v_current.limite1_justificativa,
      v_current.limite2,
      v_current.limite2_situacao,
      v_current.limite2_justificativa,
      v_current.setor,
      v_current.classificacao,
      v_current.link_origem,
      v_current.proxima_acao,
      v_current.proxima_acao_em,
      'Justificativa concorrente válida',
      v_stale
    );
  exception when sqlstate 'PT409' then
    if sqlerrm <> 'CTRH_VERSION_CONFLICT' then raise; end if;
    v_conflicts := v_conflicts + 1;
  end;

  begin
    perform public.registrar_andamento_sme_demanda_v2(
      v_id,
      'Andamento concorrente que não deve persistir.',
      'Providência concorrente inválida', date '2026-09-21',
      v_stale
    );
  exception when sqlstate 'PT409' then
    if sqlerrm <> 'CTRH_VERSION_CONFLICT' then raise; end if;
    v_conflicts := v_conflicts + 1;
  end;

  begin
    perform public.transicionar_status_sme_demanda_v2(
      v_id,
      case when v_current.status = 'Tramitado' then 'Ajustar' else 'Tramitado' end,
      'Status concorrente que não deve persistir.',
      'Providência concorrente inválida', date '2026-09-22',
      v_stale
    );
  exception when sqlstate 'PT409' then
    if sqlerrm <> 'CTRH_VERSION_CONFLICT' then raise; end if;
    v_conflicts := v_conflicts + 1;
  end;

  if v_conflicts <> 3 then
    raise exception 'R1-5A: mutações editoriais não produziram três conflitos estáveis';
  end if;
end;
$$;
rollback;

begin;
set local role authenticated;
select pg_temp.set_actor('11111111-1111-1111-1111-111111111111');
do $$
declare
  v_id bigint := (select demanda_id from r1_concurrency_baseline);
  v_stale timestamptz := (select stale_updated_at from r1_concurrency_baseline);
  v_conflicts integer := 0;
begin
  begin
    perform public.excluir_sme_demanda_v2(
      v_id,
      'Exclusão concorrente que não deve persistir',
      v_stale
    );
  exception when sqlstate 'PT409' then
    if sqlerrm <> 'CTRH_VERSION_CONFLICT' then raise; end if;
    v_conflicts := v_conflicts + 1;
  end;

  begin
    perform public.restaurar_sme_demanda_v2(
      v_id,
      'Restauração concorrente que não deve persistir',
      v_stale
    );
  exception when sqlstate 'PT409' then
    if sqlerrm <> 'CTRH_VERSION_CONFLICT' then raise; end if;
    v_conflicts := v_conflicts + 1;
  end;

  if v_conflicts <> 2 then
    raise exception 'R1-5A: mutações administrativas não produziram dois conflitos estáveis';
  end if;
end;
$$;
rollback;

select pg_temp.assert_true(
  (
    select to_jsonb(d) = s.demanda
      and (select count(*) from public.sme_historico h where h.demanda_id = d.id)
        = s.historico
    from public.sme_demandas d
    join r1_concurrency_baseline b on b.demanda_id = d.id
    cross join r1_conflict_state s
  ),
  'conflito alterou a demanda ou criou histórico'
);

begin;
set local role authenticated;
select pg_temp.set_actor('22222222-2222-2222-2222-222222222222');
select public.editar_sme_demanda_v2(
  d.id,
  'Edição versionada aceita',
  d.responsavel_id,
  d.responsavel,
  d.limite1,
  d.limite1_situacao,
  d.limite1_justificativa,
  d.limite2,
  d.limite2_situacao,
  d.limite2_justificativa,
  d.setor,
  d.classificacao,
  d.link_origem,
  d.proxima_acao,
  d.proxima_acao_em,
  'Edição versionada aceita com justificativa',
  d.updated_at
)
from public.sme_demandas d
join r1_concurrency_baseline b on b.demanda_id = d.id;
commit;

begin;
set local role authenticated;
select pg_temp.set_actor('22222222-2222-2222-2222-222222222222');
select public.transicionar_status_sme_demanda_v2(
  d.id,
  case when d.status = 'Tramitado' then 'Ajustar' else 'Tramitado' end,
  'Transição versionada aceita.',
  'Acompanhar transição versionada', date '2026-09-23',
  d.updated_at
)
from public.sme_demandas d
join r1_concurrency_baseline b on b.demanda_id = d.id;
commit;

begin;
set local role authenticated;
select pg_temp.set_actor('11111111-1111-1111-1111-111111111111');
select public.excluir_sme_demanda_v2(
  d.id,
  'Exclusão versionada aceita para teste',
  d.updated_at
)
from public.sme_demandas d
join r1_concurrency_baseline b on b.demanda_id = d.id;
commit;

begin;
set local role authenticated;
select pg_temp.set_actor('11111111-1111-1111-1111-111111111111');
select public.restaurar_sme_demanda_v2(
  d.id,
  'Restauração versionada aceita para teste',
  d.updated_at
)
from public.sme_demandas d
join r1_concurrency_baseline b on b.demanda_id = d.id;
commit;

select pg_temp.assert_true(
  (
    select count(*) = b.historico_antes + 5
    from public.sme_historico h
    cross join r1_concurrency_baseline b
    where h.demanda_id = b.demanda_id
    group by b.historico_antes
  ),
  'as cinco mutações v2 válidas não criaram exatamente cinco eventos'
);
select pg_temp.assert_true(
  (
    select d.deleted_at is null
      and d.responsavel_id is not distinct from b.responsavel_id
    from public.sme_demandas d
    join r1_concurrency_baseline b on b.demanda_id = d.id
  ),
  'rollout v2 alterou responsável ou deixou a demanda excluída'
);

select 'R1-5A homologado: cinco mutações versionadas e conflitos sem efeitos' as resultado;

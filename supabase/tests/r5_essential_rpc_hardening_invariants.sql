\set ON_ERROR_STOP on

create or replace function pg_temp.assert_true(condition boolean, message text)
returns void
language plpgsql
as $$
begin
  if condition is not true then
    raise exception 'R5 Essencial: %', message;
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
  has_function_privilege(
    'authenticated',
    'public.registrar_andamento_sme_demanda(bigint,text,text,date)',
    'EXECUTE'
  )
  and has_function_privilege(
    'authenticated',
    'public.transicionar_status_sme_demanda(bigint,text,text,text,date)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'service_role',
    'public.registrar_andamento_sme_demanda(bigint,text,text,date)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'service_role',
    'public.transicionar_status_sme_demanda(bigint,text,text,text,date)',
    'EXECUTE'
  ),
  'grants dos wrappers não correspondem à fronteira R4'
);

begin;
set local role authenticated;
select pg_temp.set_actor('22222222-2222-2222-2222-222222222222');

select public.criar_sme_demanda_r4(
  'R5-E-RPC-001', 'Processo', 'Teste sintético dos wrappers do R5 Essencial', null,
  date '2099-08-10', 'definido', null, 'nao_se_aplica',
  'Realizar análise inicial', date '2099-08-11', '',
  'Aguardando Andamento', 'CTRH', 'Diversos', ''
);

do $$
declare
  v_denied boolean := false;
begin
  begin
    perform public.registrar_andamento_sme_demanda(
      (select id from public.sme_demandas where numero = 'R5-E-RPC-001'),
      'Tentativa sem justificativa temporal.',
      'Rever documentação recebida', date '2000-01-01'
    );
  exception when others then
    if sqlerrm like 'A justificativa da data%' then v_denied := true; else raise; end if;
  end;
  if not v_denied then raise exception 'R5 Essencial: andamento legado aceitou data passada'; end if;
end;
$$;

select public.registrar_andamento_sme_demanda(
  (select id from public.sme_demandas where numero = 'R5-E-RPC-001'),
  'Análise inicial concluída.',
  'Rever documentação recebida', date '2099-08-12'
);

do $$
declare
  v_denied boolean := false;
begin
  begin
    perform public.transicionar_status_sme_demanda(
      (select id from public.sme_demandas where numero = 'R5-E-RPC-001'),
      'Tramitado', 'Tentativa sem justificativa temporal.',
      'Verificar retorno do setor', date '2000-01-01'
    );
  exception when others then
    if sqlerrm like 'A justificativa da data%' then v_denied := true; else raise; end if;
  end;
  if not v_denied then raise exception 'R5 Essencial: transição legada aceitou data passada'; end if;
end;
$$;

select pg_temp.assert_true(
  (select status = 'Aguardando Andamento'
   from public.sme_demandas where numero = 'R5-E-RPC-001'),
  'tentativa recusada alterou o status'
);

select public.transicionar_status_sme_demanda(
  (select id from public.sme_demandas where numero = 'R5-E-RPC-001'),
  'Tramitado', 'Encaminhamento realizado.',
  'Verificar retorno do setor', date '2099-08-13'
);

select public.transicionar_status_sme_demanda_r4(
  (select id from public.sme_demandas where numero = 'R5-E-RPC-001'),
  'Encerrado', 'Demanda concluída.', '', null, ''
);

select public.transicionar_status_sme_demanda(
  (select id from public.sme_demandas where numero = 'R5-E-RPC-001'),
  'Ajustar', 'Reabertura necessária após novo retorno.',
  'Analisar o novo retorno recebido', date '2099-08-14'
);

select pg_temp.assert_true(
  exists (
    select 1 from public.sme_demandas
    where numero = 'R5-E-RPC-001'
      and status = 'Ajustar'
      and proxima_acao = 'Analisar o novo retorno recebido'
      and proxima_acao_em = date '2099-08-14'
  ),
  'reabertura pelo wrapper não preservou a regra R4'
);

select pg_temp.assert_true(
  (
    select array_agg(h.tipo_evento order by h.created_at, h.id)
    from public.sme_historico h
    join public.sme_demandas d on d.id = h.demanda_id
    where d.numero = 'R5-E-RPC-001'
  ) = array['criacao','andamento','mudanca_status','mudanca_status','mudanca_status']::text[],
  'wrappers não produziram a trilha auditável esperada'
);

rollback;

select 'R5 Essencial homologado: wrappers antigos seguem regras R4 e reabertura auditável' as resultado;

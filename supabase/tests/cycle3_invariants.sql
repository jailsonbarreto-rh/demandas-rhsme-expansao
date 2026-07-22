\set ON_ERROR_STOP on

create or replace function pg_temp.assert_true(condition boolean, message text)
returns void
language plpgsql
as $$
begin
  if condition is not true then
    raise exception 'Ciclo 3: %', message;
  end if;
end;
$$;

select pg_temp.assert_true(
  (select count(*) = 2 from public.sme_demandas where numero like 'LEGADO-C3-%'),
  'a migration alterou a quantidade de demandas legadas'
);

select pg_temp.assert_true(
  (select count(*) = 3 from public.sme_historico h
    join public.sme_demandas d on d.id = h.demanda_id
    where d.numero like 'LEGADO-C3-%'),
  'a migration alterou a quantidade de históricos legados'
);

select pg_temp.assert_true(
  not exists (
    select 1 from public.sme_demandas
    where numero like 'LEGADO-C3-%' and origem <> 'legado'
  ),
  'registro legado não foi classificado como legado'
);

select pg_temp.assert_true(
  exists (
    select 1 from public.sme_demandas
    where numero = 'LEGADO-C3-001'
      and limite1_situacao = 'definido'
      and limite1_justificativa is null
      and limite2_situacao = 'nao_informado'
      and limite2_justificativa is null
  ),
  'situação dos prazos da demanda LEGADO-C3-001 está incorreta'
);

select pg_temp.assert_true(
  exists (
    select 1 from public.sme_demandas
    where numero = 'LEGADO-C3-002'
      and limite1_situacao = 'nao_informado'
      and limite2_situacao = 'definido'
  ),
  'situação dos prazos da demanda LEGADO-C3-002 está incorreta'
);

select pg_temp.assert_true(
  not exists (
    select 1 from public.sme_historico h
    join public.sme_demandas d on d.id = h.demanda_id
    where d.numero like 'LEGADO-C3-%' and h.status_anterior is not null
  ),
  'a migration inventou status anterior no histórico legado'
);

select pg_temp.assert_true(
  (
    select array_agg(h.tipo_evento order by h.created_at, h.id)
    from public.sme_historico h
    join public.sme_demandas d on d.id = h.demanda_id
    where d.numero = 'LEGADO-C3-001'
  ) = array['criacao','mudanca_status']::text[],
  'classificação cronológica dos eventos legados está incorreta'
);

select pg_temp.assert_true(
  not exists (
    select 1
    from pg_constraint
    where conname in (
      'sme_demandas_limite1_consistencia_check',
      'sme_demandas_limite2_consistencia_check',
      'sme_demandas_origem_check',
      'sme_demandas_exclusao_logica_check',
      'sme_historico_tipo_evento_check'
    ) and convalidated
  ),
  'algum check do Ciclo 3 deixou de ser criado como NOT VALID'
);

select pg_temp.assert_true(
  (
    select count(*) = 4
    from pg_indexes
    where schemaname = 'public'
      and indexname in (
        'sme_demandas_responsavel_abertas_idx',
        'sme_demandas_proxima_acao_idx',
        'sme_demandas_status_visivel_idx',
        'sme_historico_demanda_data_idx'
      )
  ),
  'nem todos os índices operacionais foram criados'
);

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select public.criar_sme_demanda(
  'NOVO-C3-001',
  'Processo',
  'Criação pela RPC v1 após expansão',
  'Responsável textual novo',
  date '2026-09-01',
  null,
  'Aguardando Andamento',
  'CTRH',
  'Diversos'
);

select public.atualizar_status_sme_demanda(
  (select id from public.sme_demandas where numero = 'NOVO-C3-001'),
  'Tramitado',
  'Movimentação pela RPC v1 após expansão'
);
commit;

select pg_temp.assert_true(
  exists (
    select 1 from public.sme_demandas
    where numero = 'NOVO-C3-001'
      and origem = 'sistema'
      and limite1_situacao = 'definido'
      and limite2_situacao = 'nao_informado'
      and status = 'Tramitado'
      and created_by = '11111111-1111-1111-1111-111111111111'
  ),
  'RPC v1 não permaneceu compatível com a demanda expandida'
);

select pg_temp.assert_true(
  (
    select array_agg(h.tipo_evento order by h.created_at, h.id)
    from public.sme_historico h
    join public.sme_demandas d on d.id = h.demanda_id
    where d.numero = 'NOVO-C3-001'
  ) = array['criacao','mudanca_status']::text[],
  'gatilho de compatibilidade não classificou os eventos das RPCs v1'
);

select pg_temp.assert_true(
  not exists (
    select 1 from public.sme_historico h
    left join public.sme_demandas d on d.id = h.demanda_id
    where d.id is null
  ),
  'há histórico órfão após a homologação local'
);

select 'Ciclo 3 homologado em banco efêmero local' as resultado;

\set ON_ERROR_STOP on

create or replace function pg_temp.assert_true(condition boolean, message text)
returns void
language plpgsql
as $$
begin
  if condition is not true then
    raise exception 'R4: %', message;
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

insert into public.sme_demandas (
  numero, tipo, assunto, responsavel, responsavel_id,
  limite1, limite1_situacao, limite2, limite2_situacao,
  proxima_acao, proxima_acao_em, status, setor, classificacao, origem
) values (
  'R4-LEGACY-001', 'Processo', 'Demanda legada sintética', '', null,
  null, 'nao_informado', null, 'nao_informado',
  null, null, 'Aguardando Andamento', 'CTRH', 'Diversos', 'legado'
);

begin;
set local role authenticated;
select pg_temp.set_actor('22222222-2222-2222-2222-222222222222');

select public.editar_sme_demanda_r4(
  (select id from public.sme_demandas where numero = 'R4-LEGACY-001'),
  'Demanda legada sintética revisada', null,
  null, 'nao_informado', null, 'nao_informado',
  'CTRH', 'Diversos', '', 'Correção cadastral do assunto legado'
);

select pg_temp.assert_true(
  exists (
    select 1 from public.sme_demandas
    where numero = 'R4-LEGACY-001'
      and limite1 is null and limite1_situacao = 'nao_informado'
      and limite2 is null and limite2_situacao = 'nao_informado'
      and proxima_acao is null and proxima_acao_em is null
  ),
  'edição cadastral inventou ou exigiu dados ausentes no legado'
);

select public.editar_sme_demanda_r4(
  (select id from public.sme_demandas where numero = 'R4-LEGACY-001'),
  'Demanda legada sintética revisada', null,
  date '2099-01-05', 'definido', null, 'nao_se_aplica',
  'CTRH', 'Diversos', '', ''
);

select pg_temp.assert_true(
  exists (
    select 1 from public.sme_historico h
    join public.sme_demandas d on d.id = h.demanda_id
    where d.numero = 'R4-LEGACY-001'
      and h.tipo_evento = 'alteracao_prazo'
      and h.comentario = 'Prazo ausente no legado preenchido pela primeira vez.'
      and h.alteracoes @> '[{"field":"limite1_situacao","before":"nao_informado","after":"definido"}]'::jsonb
  ),
  'primeira adequação do prazo não ficou auditável'
);

do $$
declare
  v_denied boolean := false;
begin
  begin
    perform public.editar_sme_demanda_r4(
      (select id from public.sme_demandas where numero = 'R4-LEGACY-001'),
      'Demanda legada sintética revisada', null,
      date '2099-01-06', 'definido', null, 'nao_se_aplica',
      'CTRH', 'Diversos', '', ''
    );
  exception when others then
    if sqlerrm like 'A justificativa da alteração%' then v_denied := true; else raise; end if;
  end;
  if not v_denied then raise exception 'R4: alteração posterior de prazo ocorreu sem justificativa'; end if;
end;
$$;

select public.editar_sme_demanda_r4(
  (select id from public.sme_demandas where numero = 'R4-LEGACY-001'),
  'Demanda legada sintética revisada', null,
  date '2099-01-06', 'definido', null, 'nao_se_aplica',
  'CTRH', 'Diversos', '', 'Reprogramação aprovada após nova análise'
);

do $$
declare
  v_denied boolean := false;
begin
  begin
    perform public.transicionar_status_sme_demanda_r4(
      (select id from public.sme_demandas where numero = 'R4-LEGACY-001'),
      'Tramitado', 'Encaminhamento realizado.', '', null, ''
    );
  exception when others then
    if sqlerrm like 'A próxima providência%' then v_denied := true; else raise; end if;
  end;
  if not v_denied then raise exception 'R4: movimento legado ocorreu sem próxima providência'; end if;
end;
$$;

select public.transicionar_status_sme_demanda_r4(
  (select id from public.sme_demandas where numero = 'R4-LEGACY-001'),
  'Tramitado', 'Encaminhamento realizado.',
  'Verificar retorno do setor competente', date '2099-02-01', ''
);

do $$
declare
  v_denied boolean := false;
begin
  begin
    perform public.criar_sme_demanda_r4(
      'R4-NEW-INVALID', 'Processo', 'Cadastro incompleto', null,
      null, 'nao_informado', null, 'nao_informado',
      'Analisar documentos recebidos', date '2099-02-01', '',
      'Aguardando Andamento', 'CTRH', 'Diversos', ''
    );
  exception when others then
    if sqlerrm like 'Prazo interno%' then v_denied := true; else raise; end if;
  end;
  if not v_denied then raise exception 'R4: nova demanda sem prazo interno foi aceita'; end if;
end;
$$;

select public.criar_sme_demanda_r4(
  'R4-NEW-001', 'Processo', 'Cadastro válido do R4', null,
  date '2099-01-03', 'definido', null, 'nao_se_aplica',
  'Analisar documentos recebidos', date '2099-02-01', '',
  'Aguardando Andamento', 'CTRH', 'Diversos', ''
);

select pg_temp.assert_true(
  exists (
    select 1 from public.sme_demandas
    where numero = 'R4-NEW-001'
      and limite1_situacao = 'definido'
      and limite2_situacao = 'nao_se_aplica'
      and limite2_justificativa is null
  ),
  'Não se aplica exigiu ou gravou justificativa inicial indevida'
);

do $$
declare
  v_denied boolean := false;
begin
  begin
    perform public.registrar_andamento_sme_demanda_r4(
      (select id from public.sme_demandas where numero = 'R4-NEW-001'),
      'Análise realizada.', 'Solicitar complementação documental',
      date '2000-01-01', ''
    );
  exception when others then
    if sqlerrm like 'A justificativa da data%' then v_denied := true; else raise; end if;
  end;
  if not v_denied then raise exception 'R4: próxima providência vencida foi salva sem justificativa'; end if;
end;
$$;

select public.registrar_andamento_sme_demanda_r4(
  (select id from public.sme_demandas where numero = 'R4-NEW-001'),
  'Análise realizada.', 'Solicitar complementação documental',
  date '2000-01-01',
  'Registro tardio após indisponibilidade temporária'
);

select pg_temp.assert_true(
  exists (
    select 1 from public.sme_historico h
    join public.sme_demandas d on d.id = h.demanda_id
    where d.numero = 'R4-NEW-001'
      and h.tipo_evento = 'andamento'
      and h.comentario like '%Justificativa da data vencida:%'
      and h.created_by = '22222222-2222-2222-2222-222222222222'
  ),
  'justificativa da providência vencida não integrou o histórico'
);

select public.transicionar_status_sme_demanda_r4(
  (select id from public.sme_demandas where numero = 'R4-NEW-001'),
  'Encerrado', 'Demanda concluída.', '', null, ''
);

select pg_temp.assert_true(
  exists (
    select 1 from public.sme_demandas
    where numero = 'R4-NEW-001'
      and status = 'Encerrado'
      and proxima_acao is null
      and proxima_acao_em is null
  ),
  'encerramento não limpou a próxima providência'
);

rollback;

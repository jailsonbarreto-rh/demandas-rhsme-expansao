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

-- Leitor ativo pode consultar o diretório mínimo, mas não executar mutações.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);
select set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);

select pg_temp.assert_true(
  (select count(*) >= 3 from public.listar_perfis_minimos()),
  'diretório mínimo não retornou os perfis ativos esperados'
);

do $$
declare
  v_denied boolean := false;
begin
  begin
    perform public.criar_sme_demanda_v2(
      'C4-LEITOR-NEGADO', 'Processo', 'Tentativa do leitor', null, '',
      null, 'nao_informado', '', null, 'nao_informado', '',
      'Revisar tentativa', date '2026-09-01', 'Aguardando Andamento',
      'CTRH', 'Diversos', ''
    );
  exception when others then
    if sqlerrm like 'Acesso negado:%' then
      v_denied := true;
    else
      raise;
    end if;
  end;
  if not v_denied then
    raise exception 'Ciclo 4: leitor conseguiu criar demanda';
  end if;
end;
$$;
rollback;

-- Editor cria, edita, registra andamento e transiciona.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);

select public.criar_sme_demanda_v2(
  'C4-AUDIT-001', 'Processo', 'Demanda auditável do Ciclo 4', null, 'Equipe externa',
  date '2026-09-10', 'definido', '', null, 'nao_informado', '',
  'Conferir documentação recebida', date '2026-08-15',
  'Aguardando Andamento', 'CTRH', 'Diversos', 'https://example.invalid/processo'
);

select public.editar_sme_demanda(
  (select id from public.sme_demandas where numero = 'C4-AUDIT-001'),
  'Demanda auditável revisada', null, 'Equipe externa',
  date '2026-09-10', 'definido', '', null, 'nao_informado', '',
  'CTRH', 'Diversos', 'https://example.invalid/processo',
  'Conferir documentação atualizada', date '2026-08-16',
  'Ajuste de assunto e próxima providência'
);

select public.registrar_andamento_sme_demanda(
  (select id from public.sme_demandas where numero = 'C4-AUDIT-001'),
  'Documentação conferida e devolvida para complementação.',
  'Verificar retorno da complementação', date '2026-08-20'
);

select public.transicionar_status_sme_demanda(
  (select id from public.sme_demandas where numero = 'C4-AUDIT-001'),
  'Encerrado', 'Demanda concluída após conferência.', '', null
);
commit;

select pg_temp.assert_true(
  exists (
    select 1 from public.sme_demandas
    where numero = 'C4-AUDIT-001'
      and status = 'Encerrado'
      and proxima_acao is null
      and proxima_acao_em is null
      and created_by = '22222222-2222-2222-2222-222222222222'
      and updated_by = '22222222-2222-2222-2222-222222222222'
  ),
  'criação/transição do editor não preservou autoria ou limpeza do encerramento'
);

select pg_temp.assert_true(
  (
    select array_agg(tipo_evento order by created_at, id)
    from public.sme_historico h
    join public.sme_demandas d on d.id = h.demanda_id
    where d.numero = 'C4-AUDIT-001'
  ) = array['criacao','edicao','andamento','mudanca_status']::text[],
  'sequência de eventos da mutação auditável está incorreta'
);

select pg_temp.assert_true(
  not exists (
    select 1 from public.sme_historico h
    join public.sme_demandas d on d.id = h.demanda_id
    where d.numero = 'C4-AUDIT-001'
      and (h.created_by is null or jsonb_typeof(h.alteracoes) <> 'array')
  ),
  'evento novo ficou sem autor ou sem JSON de alterações'
);

-- Editor não pode excluir nem restaurar.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);

do $$
declare
  v_denied boolean := false;
begin
  begin
    perform public.excluir_sme_demanda(
      (select id from public.sme_demandas where numero = 'C4-AUDIT-001'),
      'Tentativa de exclusão pelo editor'
    );
  exception when others then
    if sqlerrm like 'Acesso negado:%' then v_denied := true; else raise; end if;
  end;
  if not v_denied then raise exception 'Ciclo 4: editor conseguiu excluir demanda'; end if;
end;
$$;
rollback;

-- Administrador exclui logicamente e restaura, mantendo demanda e histórico.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select public.excluir_sme_demanda(
  (select id from public.sme_demandas where numero = 'C4-AUDIT-001'),
  'Registro duplicado identificado na conferência'
);

select pg_temp.assert_true(
  exists (
    select 1 from public.sme_demandas
    where numero = 'C4-AUDIT-001'
      and deleted_at is not null
      and deleted_by = '11111111-1111-1111-1111-111111111111'
  ),
  'exclusão lógica não registrou metadados administrativos'
);

select public.restaurar_sme_demanda(
  (select id from public.sme_demandas where numero = 'C4-AUDIT-001'),
  'Duplicidade descartada após nova conferência'
);
commit;

select pg_temp.assert_true(
  exists (
    select 1 from public.sme_demandas
    where numero = 'C4-AUDIT-001'
      and deleted_at is null and deleted_by is null and deletion_reason is null
  ),
  'restauração não limpou os metadados de exclusão'
);

select pg_temp.assert_true(
  (
    select count(*) = 6
    from public.sme_historico h
    join public.sme_demandas d on d.id = h.demanda_id
    where d.numero = 'C4-AUDIT-001'
  ),
  'exclusão ou restauração apagou ou duplicou a trilha'
);

-- Reabre para testar rollback de auditoria e concorrência sequencial.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select public.transicionar_status_sme_demanda(
  (select id from public.sme_demandas where numero = 'C4-AUDIT-001'),
  'Ajustar', 'Reabertura para complementar a documentação.',
  'Complementar documentação pendente', date '2026-08-25'
);
commit;

create or replace function private.cycle4_fail_history_marker()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.comentario = 'FORCAR-FALHA-HISTORICO' then
    raise exception 'Falha sintética de auditoria';
  end if;
  return new;
end;
$$;
create trigger cycle4_fail_history_marker
before insert on public.sme_historico
for each row execute function private.cycle4_fail_history_marker();

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);

do $$
declare
  v_before_action text;
  v_failed boolean := false;
begin
  select proxima_acao into v_before_action
  from public.sme_demandas where numero = 'C4-AUDIT-001';
  begin
    perform public.registrar_andamento_sme_demanda(
      (select id from public.sme_demandas where numero = 'C4-AUDIT-001'),
      'FORCAR-FALHA-HISTORICO', 'Ação que deve ser revertida', date '2026-08-30'
    );
  exception when others then
    if sqlerrm = 'Falha sintética de auditoria' then v_failed := true; else raise; end if;
  end;
  if not v_failed then raise exception 'Ciclo 4: falha de histórico não interrompeu a RPC'; end if;
  if (select proxima_acao from public.sme_demandas where numero = 'C4-AUDIT-001')
     is distinct from v_before_action then
    raise exception 'Ciclo 4: mutação não foi revertida com a falha de histórico';
  end if;
end;
$$;
rollback;

drop trigger cycle4_fail_history_marker on public.sme_historico;
drop function private.cycle4_fail_history_marker();

-- Duas edições sequenciais: a última transação precisa vencer e atualizar o timestamp.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);

do $$
declare
  v_id bigint;
  v_first timestamptz;
  v_second timestamptz;
begin
  select id into v_id from public.sme_demandas where numero = 'C4-AUDIT-001';
  perform public.editar_sme_demanda(
    v_id, 'Primeira edição concorrente', null, 'Equipe externa',
    date '2026-09-10', 'definido', '', null, 'nao_informado', '',
    'CTRH', 'Diversos', 'https://example.invalid/processo',
    'Complementar documentação pendente', date '2026-08-25',
    'Primeira edição sequencial de teste'
  );
  select updated_at into v_first from public.sme_demandas where id = v_id;
  perform pg_sleep(0.02);
  perform public.editar_sme_demanda(
    v_id, 'Segunda edição concorrente', null, 'Equipe externa',
    date '2026-09-10', 'definido', '', null, 'nao_informado', '',
    'CTRH', 'Diversos', 'https://example.invalid/processo',
    'Complementar documentação pendente', date '2026-08-25',
    'Segunda edição sequencial de teste'
  );
  select updated_at into v_second from public.sme_demandas where id = v_id;
  if v_second <= v_first then
    raise exception 'Ciclo 4: updated_at não reflete a última transação';
  end if;
  if (select assunto from public.sme_demandas where id = v_id) <> 'Segunda edição concorrente' then
    raise exception 'Ciclo 4: a última edição não prevaleceu';
  end if;
end;
$$;
commit;

select pg_temp.assert_true(
  not exists (
    select 1 from public.sme_historico h
    left join public.sme_demandas d on d.id = h.demanda_id
    where d.id is null
  ),
  'há histórico órfão após as mutações do Ciclo 4'
);

select pg_temp.assert_true(
  not exists (
    select 1 from public.sme_demandas where numero = 'C4-LEITOR-NEGADO'
  ),
  'tentativa negada do leitor deixou registro parcial'
);

select 'Ciclo 4 homologado: papéis, autoria, transações, exclusão e restauração' as resultado;

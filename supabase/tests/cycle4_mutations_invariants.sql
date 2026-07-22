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

-- Leitor ativo consulta o diretório mínimo, mas não pode alterar dados.
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
    if sqlerrm like 'Acesso negado:%' then v_denied := true; else raise; end if;
  end;
  if not v_denied then raise exception 'Ciclo 4: leitor conseguiu criar demanda'; end if;
end;
$$;
rollback;

-- Editor cria, edita, registra andamento e encerra.
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
  'criação ou encerramento não preservou autoria e limpeza da próxima ação'
);

select pg_temp.assert_true(
  (
    select array_agg(tipo_evento order by created_at, id)
    from public.sme_historico h
    join public.sme_demandas d on d.id = h.demanda_id
    where d.numero = 'C4-AUDIT-001'
  ) = array['criacao','edicao','andamento','mudanca_status']::text[],
  'sequência inicial de eventos auditáveis está incorreta'
);

select pg_temp.assert_true(
  not exists (
    select 1 from public.sme_historico h
    join public.sme_demandas d on d.id = h.demanda_id
    where d.numero = 'C4-AUDIT-001'
      and (h.created_by is null or jsonb_typeof(h.alteracoes) <> 'array')
  ),
  'evento novo ficou sem autor ou sem alterações estruturadas'
);

-- Editor não pode excluir.
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

-- Administrador exclui logicamente e restaura, preservando demanda e histórico.
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
  'exclusão lógica não registrou os metadados administrativos'
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
      and deleted_at is null
      and deleted_by is null
      and deletion_reason is null
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

-- Reabre para testar rollback transacional de uma falha na auditoria.
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

  if not v_failed then
    raise exception 'Ciclo 4: falha de histórico não interrompeu a RPC';
  end if;
  if (select proxima_acao from public.sme_demandas where numero = 'C4-AUDIT-001')
     is distinct from v_before_action then
    raise exception 'Ciclo 4: mutação não foi revertida com a falha de histórico';
  end if;
end;
$$;
rollback;

drop trigger cycle4_fail_history_marker on public.sme_historico;
drop function private.cycle4_fail_history_marker();

-- Duas edições em transações separadas: a última deve prevalecer e ter timestamp posterior.
create temporary table cycle4_first_edit_timestamp (
  updated_at timestamptz not null
) on commit preserve rows;

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select public.editar_sme_demanda(
  (select id from public.sme_demandas where numero = 'C4-AUDIT-001'),
  'Primeira edição sequencial', null, 'Equipe externa',
  date '2026-09-10', 'definido', '', null, 'nao_informado', '',
  'CTRH', 'Diversos', 'https://example.invalid/processo',
  'Complementar documentação pendente', date '2026-08-25',
  'Primeira edição sequencial de teste'
);
insert into cycle4_first_edit_timestamp
select updated_at from public.sme_demandas where numero = 'C4-AUDIT-001';
commit;

select pg_sleep(0.02);

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
select public.editar_sme_demanda(
  (select id from public.sme_demandas where numero = 'C4-AUDIT-001'),
  'Segunda edição sequencial', null, 'Equipe externa',
  date '2026-09-10', 'definido', '', null, 'nao_informado', '',
  'CTRH', 'Diversos', 'https://example.invalid/processo',
  'Complementar documentação pendente', date '2026-08-25',
  'Segunda edição sequencial de teste'
);
commit;

select pg_temp.assert_true(
  (select assunto = 'Segunda edição sequencial'
   from public.sme_demandas where numero = 'C4-AUDIT-001'),
  'a última edição não prevaleceu'
);
select pg_temp.assert_true(
  (select d.updated_at > t.updated_at
   from public.sme_demandas d
   cross join cycle4_first_edit_timestamp t
   where d.numero = 'C4-AUDIT-001'),
  'updated_at não reflete a transação mais recente'
);

select pg_temp.assert_true(
  not exists (
    select 1 from public.sme_historico h
    left join public.sme_demandas d on d.id = h.demanda_id
    where d.id is null
  ),
  'há histórico órfão após as mutações do Ciclo 4'
);

select pg_temp.assert_true(
  not exists (select 1 from public.sme_demandas where numero = 'C4-LEITOR-NEGADO'),
  'tentativa negada do leitor deixou registro parcial'
);

select 'Ciclo 4 homologado: papéis, autoria, transações, exclusão e restauração' as resultado;

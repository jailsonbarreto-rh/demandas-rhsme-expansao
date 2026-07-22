create or replace function public.registrar_andamento_sme_demanda(
  p_demanda_id bigint,
  p_comentario text,
  p_proxima_acao text,
  p_proxima_acao_em date
)
returns public.sme_demandas
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_before public.sme_demandas;
  v_after public.sme_demandas;
  v_comentario text;
  v_proxima_acao text;
  v_changes jsonb := '[]'::jsonb;
begin
  if not private.can_edit() then
    raise exception 'Acesso negado: permissões insuficientes.';
  end if;

  select * into v_before
  from public.sme_demandas
  where id = p_demanda_id
  for update;

  if not found then
    raise exception 'Demanda não encontrada.';
  end if;
  if v_before.deleted_at is not null then
    raise exception 'Demanda excluída não pode receber andamento.';
  end if;
  if v_before.status = 'Encerrado' then
    raise exception 'Demanda encerrada não recebe andamento. Use a transição de status para reabri-la.';
  end if;

  v_comentario := private.cycle4_require_text(
    p_comentario, 1, 'O comentário do andamento é obrigatório.'
  );
  v_proxima_acao := private.cycle4_require_text(
    p_proxima_acao, 5, 'A próxima ação deve possuir pelo menos 5 caracteres.'
  );
  if p_proxima_acao_em is null then
    raise exception 'A data de acompanhamento é obrigatória.';
  end if;

  if coalesce(v_before.proxima_acao, '') is distinct from v_proxima_acao then
    v_changes := private.cycle4_append_change(
      v_changes, 'proxima_acao', v_before.proxima_acao, v_proxima_acao
    );
  end if;
  if v_before.proxima_acao_em is distinct from p_proxima_acao_em then
    v_changes := private.cycle4_append_change(
      v_changes, 'proxima_acao_em', v_before.proxima_acao_em::text, p_proxima_acao_em::text
    );
  end if;

  update public.sme_demandas
  set
    proxima_acao = v_proxima_acao,
    proxima_acao_em = p_proxima_acao_em,
    updated_by = v_actor
  where id = p_demanda_id
  returning * into v_after;

  insert into public.sme_historico (
    demanda_id,
    tipo_evento,
    status_anterior,
    status_novo,
    setor,
    comentario,
    alteracoes,
    created_by
  ) values (
    v_after.id,
    'andamento',
    v_before.status,
    v_after.status,
    v_after.setor,
    v_comentario,
    v_changes,
    v_actor
  );

  return v_after;
end;
$$;

create or replace function public.transicionar_status_sme_demanda(
  p_demanda_id bigint,
  p_novo_status text,
  p_comentario text,
  p_proxima_acao text,
  p_proxima_acao_em date
)
returns public.sme_demandas
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_before public.sme_demandas;
  v_after public.sme_demandas;
  v_comentario text;
  v_proxima_acao text := btrim(coalesce(p_proxima_acao, ''));
  v_changes jsonb := '[]'::jsonb;
begin
  if not private.can_edit() then
    raise exception 'Acesso negado: permissões insuficientes.';
  end if;

  select * into v_before
  from public.sme_demandas
  where id = p_demanda_id
  for update;

  if not found then
    raise exception 'Demanda não encontrada.';
  end if;
  if v_before.deleted_at is not null then
    raise exception 'Demanda excluída não pode mudar de status.';
  end if;
  if v_before.status = p_novo_status then
    raise exception 'O status informado já é o atual. Use Registrar andamento para incluir nova movimentação.';
  end if;

  v_comentario := private.cycle4_require_text(
    p_comentario, 1, 'O comentário da transição é obrigatório.'
  );

  if p_novo_status = 'Encerrado' then
    v_proxima_acao := '';
    p_proxima_acao_em := null;
  else
    v_proxima_acao := private.cycle4_require_text(
      p_proxima_acao, 5, 'A próxima ação deve possuir pelo menos 5 caracteres.'
    );
    if p_proxima_acao_em is null then
      raise exception 'A data de acompanhamento é obrigatória.';
    end if;
  end if;

  v_changes := private.cycle4_append_change(v_changes, 'status', v_before.status, p_novo_status);
  if coalesce(v_before.proxima_acao, '') is distinct from v_proxima_acao then
    v_changes := private.cycle4_append_change(
      v_changes, 'proxima_acao', v_before.proxima_acao, nullif(v_proxima_acao, '')
    );
  end if;
  if v_before.proxima_acao_em is distinct from p_proxima_acao_em then
    v_changes := private.cycle4_append_change(
      v_changes, 'proxima_acao_em', v_before.proxima_acao_em::text, p_proxima_acao_em::text
    );
  end if;

  update public.sme_demandas
  set
    status = p_novo_status,
    proxima_acao = nullif(v_proxima_acao, ''),
    proxima_acao_em = p_proxima_acao_em,
    updated_by = v_actor
  where id = p_demanda_id
  returning * into v_after;

  insert into public.sme_historico (
    demanda_id,
    tipo_evento,
    status_anterior,
    status_novo,
    setor,
    comentario,
    alteracoes,
    created_by
  ) values (
    v_after.id,
    'mudanca_status',
    v_before.status,
    v_after.status,
    v_after.setor,
    v_comentario,
    v_changes,
    v_actor
  );

  return v_after;
end;
$$;

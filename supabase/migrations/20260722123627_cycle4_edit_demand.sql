create or replace function public.editar_sme_demanda(
  p_demanda_id bigint,
  p_assunto text,
  p_responsavel_id uuid,
  p_responsavel text,
  p_limite1 date,
  p_limite1_situacao text,
  p_limite1_justificativa text,
  p_limite2 date,
  p_limite2_situacao text,
  p_limite2_justificativa text,
  p_setor text,
  p_classificacao text,
  p_link_origem text,
  p_proxima_acao text,
  p_proxima_acao_em date,
  p_justificativa text
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
  v_changes jsonb := '[]'::jsonb;
  v_responsibility_changed boolean := false;
  v_deadline_changed boolean := false;
  v_other_changed boolean := false;
  v_event_type text;
  v_assunto text;
  v_justificativa text;
  v_proxima_acao text := btrim(coalesce(p_proxima_acao, ''));
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
    raise exception 'Demanda excluída não pode ser editada. Restaure o registro primeiro.';
  end if;

  v_assunto := private.cycle4_require_text(
    p_assunto, 1, 'O assunto da demanda é obrigatório.'
  );
  v_justificativa := private.cycle4_require_text(
    p_justificativa, 10, 'A justificativa da edição deve possuir pelo menos 10 caracteres.'
  );
  perform private.cycle4_require_text(
    p_classificacao, 1, 'A classificação da demanda é obrigatória.'
  );
  perform private.cycle4_validate_deadline(
    p_limite1, p_limite1_situacao, p_limite1_justificativa, 'Prazo interno'
  );
  perform private.cycle4_validate_deadline(
    p_limite2, p_limite2_situacao, p_limite2_justificativa, 'Prazo final'
  );

  if v_before.status <> 'Encerrado' then
    v_proxima_acao := private.cycle4_require_text(
      p_proxima_acao, 5, 'A próxima ação deve possuir pelo menos 5 caracteres.'
    );
    if p_proxima_acao_em is null then
      raise exception 'A data de acompanhamento é obrigatória.';
    end if;
  else
    v_proxima_acao := '';
    p_proxima_acao_em := null;
  end if;

  if v_before.assunto is distinct from v_assunto then
    v_changes := private.cycle4_append_change(v_changes, 'assunto', v_before.assunto, v_assunto);
    v_other_changed := true;
  end if;
  if v_before.responsavel_id is distinct from p_responsavel_id then
    v_changes := private.cycle4_append_change(
      v_changes, 'responsavel_id', v_before.responsavel_id::text, p_responsavel_id::text
    );
    v_responsibility_changed := true;
  end if;
  if v_before.responsavel is distinct from btrim(coalesce(p_responsavel, '')) then
    v_changes := private.cycle4_append_change(
      v_changes, 'responsavel', v_before.responsavel, btrim(coalesce(p_responsavel, ''))
    );
    v_responsibility_changed := true;
  end if;
  if v_before.limite1 is distinct from p_limite1 then
    v_changes := private.cycle4_append_change(v_changes, 'limite1', v_before.limite1::text, p_limite1::text);
    v_deadline_changed := true;
  end if;
  if v_before.limite1_situacao is distinct from p_limite1_situacao then
    v_changes := private.cycle4_append_change(
      v_changes, 'limite1_situacao', v_before.limite1_situacao, p_limite1_situacao
    );
    v_deadline_changed := true;
  end if;
  if coalesce(v_before.limite1_justificativa, '') is distinct from btrim(coalesce(p_limite1_justificativa, '')) then
    v_changes := private.cycle4_append_change(
      v_changes,
      'limite1_justificativa',
      v_before.limite1_justificativa,
      nullif(btrim(coalesce(p_limite1_justificativa, '')), '')
    );
    v_deadline_changed := true;
  end if;
  if v_before.limite2 is distinct from p_limite2 then
    v_changes := private.cycle4_append_change(v_changes, 'limite2', v_before.limite2::text, p_limite2::text);
    v_deadline_changed := true;
  end if;
  if v_before.limite2_situacao is distinct from p_limite2_situacao then
    v_changes := private.cycle4_append_change(
      v_changes, 'limite2_situacao', v_before.limite2_situacao, p_limite2_situacao
    );
    v_deadline_changed := true;
  end if;
  if coalesce(v_before.limite2_justificativa, '') is distinct from btrim(coalesce(p_limite2_justificativa, '')) then
    v_changes := private.cycle4_append_change(
      v_changes,
      'limite2_justificativa',
      v_before.limite2_justificativa,
      nullif(btrim(coalesce(p_limite2_justificativa, '')), '')
    );
    v_deadline_changed := true;
  end if;
  if v_before.setor is distinct from btrim(coalesce(p_setor, '')) then
    v_changes := private.cycle4_append_change(v_changes, 'setor', v_before.setor, btrim(coalesce(p_setor, '')));
    v_other_changed := true;
  end if;
  if v_before.classificacao is distinct from btrim(p_classificacao) then
    v_changes := private.cycle4_append_change(
      v_changes, 'classificacao', v_before.classificacao, btrim(p_classificacao)
    );
    v_other_changed := true;
  end if;
  if coalesce(v_before.link_origem, '') is distinct from btrim(coalesce(p_link_origem, '')) then
    v_changes := private.cycle4_append_change(
      v_changes, 'link_origem', v_before.link_origem, nullif(btrim(coalesce(p_link_origem, '')), '')
    );
    v_other_changed := true;
  end if;
  if coalesce(v_before.proxima_acao, '') is distinct from v_proxima_acao then
    v_changes := private.cycle4_append_change(
      v_changes, 'proxima_acao', v_before.proxima_acao, nullif(v_proxima_acao, '')
    );
    v_other_changed := true;
  end if;
  if v_before.proxima_acao_em is distinct from p_proxima_acao_em then
    v_changes := private.cycle4_append_change(
      v_changes, 'proxima_acao_em', v_before.proxima_acao_em::text, p_proxima_acao_em::text
    );
    v_other_changed := true;
  end if;

  if jsonb_array_length(v_changes) = 0 then
    raise exception 'Nenhuma alteração foi identificada.';
  end if;

  if v_responsibility_changed and not v_deadline_changed and not v_other_changed then
    v_event_type := 'reatribuicao';
  elsif v_deadline_changed and not v_responsibility_changed and not v_other_changed then
    v_event_type := 'alteracao_prazo';
  else
    v_event_type := 'edicao';
  end if;

  update public.sme_demandas
  set
    assunto = v_assunto,
    responsavel_id = p_responsavel_id,
    responsavel = btrim(coalesce(p_responsavel, '')),
    limite1 = p_limite1,
    limite1_situacao = p_limite1_situacao,
    limite1_justificativa = nullif(btrim(coalesce(p_limite1_justificativa, '')), ''),
    limite2 = p_limite2,
    limite2_situacao = p_limite2_situacao,
    limite2_justificativa = nullif(btrim(coalesce(p_limite2_justificativa, '')), ''),
    setor = btrim(coalesce(p_setor, '')),
    classificacao = btrim(p_classificacao),
    link_origem = nullif(btrim(coalesce(p_link_origem, '')), ''),
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
    v_event_type,
    v_before.status,
    v_after.status,
    v_after.setor,
    v_justificativa,
    v_changes,
    v_actor
  );

  return v_after;
end;
$$;

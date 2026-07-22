-- Ciclo 4 — mutações transacionais, autoria e exclusão lógica.
-- As APIs v1 permanecem disponíveis somente para compatibilidade temporária.

create or replace function private.cycle4_require_text(
  p_value text,
  p_minimum integer,
  p_message text
)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_value text := btrim(coalesce(p_value, ''));
begin
  if length(regexp_replace(v_value, '\s+', ' ', 'g')) < p_minimum then
    raise exception '%', p_message;
  end if;
  return v_value;
end;
$$;

create or replace function private.cycle4_validate_deadline(
  p_date date,
  p_state text,
  p_justification text,
  p_label text
)
returns void
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_justification text := btrim(coalesce(p_justification, ''));
begin
  if p_state = 'definido' then
    if p_date is null then
      raise exception '% definido exige uma data.', p_label;
    end if;
    if v_justification <> '' then
      raise exception '% definido não utiliza justificativa.', p_label;
    end if;
  elsif p_state = 'nao_informado' then
    if p_date is not null then
      raise exception '% não informado não pode possuir data.', p_label;
    end if;
    if v_justification <> '' then
      raise exception '% não informado não utiliza justificativa.', p_label;
    end if;
  elsif p_state = 'nao_se_aplica' then
    if p_date is not null then
      raise exception '% não aplicável não pode possuir data.', p_label;
    end if;
    if length(regexp_replace(v_justification, '\s+', ' ', 'g')) < 10 then
      raise exception '% não aplicável exige justificativa com pelo menos 10 caracteres.', p_label;
    end if;
  else
    raise exception 'Situação inválida para %.', p_label;
  end if;
end;
$$;

create or replace function private.cycle4_append_change(
  p_changes jsonb,
  p_field text,
  p_before text,
  p_after text
)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select coalesce(p_changes, '[]'::jsonb) || jsonb_build_array(
    jsonb_build_object(
      'field', p_field,
      'before', p_before,
      'after', p_after
    )
  );
$$;

revoke all on function private.cycle4_require_text(text, integer, text)
from public, anon, authenticated;
revoke all on function private.cycle4_validate_deadline(date, text, text, text)
from public, anon, authenticated;
revoke all on function private.cycle4_append_change(jsonb, text, text, text)
from public, anon, authenticated;

create or replace function public.criar_sme_demanda_v2(
  p_numero text,
  p_tipo text,
  p_assunto text,
  p_responsavel_id uuid,
  p_responsavel text,
  p_limite1 date,
  p_limite1_situacao text,
  p_limite1_justificativa text,
  p_limite2 date,
  p_limite2_situacao text,
  p_limite2_justificativa text,
  p_proxima_acao text,
  p_proxima_acao_em date,
  p_status text,
  p_setor text,
  p_classificacao text,
  p_link_origem text
)
returns public.sme_demandas
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_demanda public.sme_demandas;
  v_numero text;
  v_assunto text;
  v_proxima_acao text := btrim(coalesce(p_proxima_acao, ''));
  v_changes jsonb := '[]'::jsonb;
begin
  if not private.can_edit() then
    raise exception 'Acesso negado: permissões insuficientes.';
  end if;

  v_numero := private.cycle4_require_text(
    p_numero, 1, 'O número do processo ou documento é obrigatório.'
  );
  v_assunto := private.cycle4_require_text(
    p_assunto, 1, 'O assunto da demanda é obrigatório.'
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

  if p_status <> 'Encerrado' then
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

  insert into public.sme_demandas (
    numero,
    tipo,
    assunto,
    responsavel_id,
    responsavel,
    limite1,
    limite1_situacao,
    limite1_justificativa,
    limite2,
    limite2_situacao,
    limite2_justificativa,
    proxima_acao,
    proxima_acao_em,
    link_origem,
    status,
    setor,
    classificacao,
    origem,
    created_by,
    updated_by
  ) values (
    v_numero,
    p_tipo,
    v_assunto,
    p_responsavel_id,
    btrim(coalesce(p_responsavel, '')),
    p_limite1,
    p_limite1_situacao,
    nullif(btrim(coalesce(p_limite1_justificativa, '')), ''),
    p_limite2,
    p_limite2_situacao,
    nullif(btrim(coalesce(p_limite2_justificativa, '')), ''),
    nullif(v_proxima_acao, ''),
    p_proxima_acao_em,
    nullif(btrim(coalesce(p_link_origem, '')), ''),
    p_status,
    btrim(coalesce(p_setor, '')),
    btrim(p_classificacao),
    'sistema',
    v_actor,
    v_actor
  )
  returning * into v_demanda;

  v_changes := private.cycle4_append_change(v_changes, 'status', null, v_demanda.status);
  v_changes := private.cycle4_append_change(v_changes, 'setor', null, v_demanda.setor);
  v_changes := private.cycle4_append_change(v_changes, 'origem', null, v_demanda.origem);

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
    v_demanda.id,
    'criacao',
    null,
    v_demanda.status,
    v_demanda.setor,
    'Demanda cadastrada no sistema.',
    v_changes,
    v_actor
  );

  return v_demanda;
end;
$$;

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

create or replace function public.excluir_sme_demanda(
  p_demanda_id bigint,
  p_motivo text
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
  v_motivo text;
  v_deleted_at timestamptz := now();
  v_changes jsonb := '[]'::jsonb;
begin
  if not private.is_admin() then
    raise exception 'Acesso negado: somente administrador pode excluir demandas.';
  end if;

  select * into v_before
  from public.sme_demandas
  where id = p_demanda_id
  for update;

  if not found then
    raise exception 'Demanda não encontrada.';
  end if;
  if v_before.deleted_at is not null then
    raise exception 'A demanda já está excluída.';
  end if;

  v_motivo := private.cycle4_require_text(
    p_motivo, 10, 'O motivo da exclusão deve possuir pelo menos 10 caracteres.'
  );
  v_changes := private.cycle4_append_change(
    v_changes, 'deleted_at', null, v_deleted_at::text
  );
  v_changes := private.cycle4_append_change(
    v_changes, 'deletion_reason', null, v_motivo
  );

  update public.sme_demandas
  set
    deleted_at = v_deleted_at,
    deleted_by = v_actor,
    deletion_reason = v_motivo,
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
    'exclusao',
    v_before.status,
    v_after.status,
    v_after.setor,
    v_motivo,
    v_changes,
    v_actor
  );

  return v_after;
end;
$$;

create or replace function public.restaurar_sme_demanda(
  p_demanda_id bigint,
  p_motivo text
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
  v_motivo text;
  v_changes jsonb := '[]'::jsonb;
begin
  if not private.is_admin() then
    raise exception 'Acesso negado: somente administrador pode restaurar demandas.';
  end if;

  select * into v_before
  from public.sme_demandas
  where id = p_demanda_id
  for update;

  if not found then
    raise exception 'Demanda não encontrada.';
  end if;
  if v_before.deleted_at is null then
    raise exception 'A demanda não está excluída.';
  end if;

  v_motivo := private.cycle4_require_text(
    p_motivo, 10, 'O motivo da restauração deve possuir pelo menos 10 caracteres.'
  );
  v_changes := private.cycle4_append_change(
    v_changes, 'deleted_at', v_before.deleted_at::text, null
  );
  v_changes := private.cycle4_append_change(
    v_changes, 'deletion_reason', v_before.deletion_reason, null
  );

  update public.sme_demandas
  set
    deleted_at = null,
    deleted_by = null,
    deletion_reason = null,
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
    'restauracao',
    v_before.status,
    v_after.status,
    v_after.setor,
    v_motivo,
    v_changes,
    v_actor
  );

  return v_after;
end;
$$;

create or replace function public.listar_perfis_minimos()
returns table (
  id uuid,
  nome text,
  setor text
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.nome, p.setor
  from public.perfis_usuarios p
  where private.is_active()
    and p.status = 'ativo'
  order by p.nome, p.id;
$$;

revoke all on function public.criar_sme_demanda_v2(
  text, text, text, uuid, text, date, text, text, date, text, text,
  text, date, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.criar_sme_demanda_v2(
  text, text, text, uuid, text, date, text, text, date, text, text,
  text, date, text, text, text, text
) to authenticated;

revoke all on function public.editar_sme_demanda(
  bigint, text, uuid, text, date, text, text, date, text, text,
  text, text, text, text, date, text
) from public, anon, authenticated;
grant execute on function public.editar_sme_demanda(
  bigint, text, uuid, text, date, text, text, date, text, text,
  text, text, text, text, date, text
) to authenticated;

revoke all on function public.registrar_andamento_sme_demanda(bigint, text, text, date)
from public, anon, authenticated;
grant execute on function public.registrar_andamento_sme_demanda(bigint, text, text, date)
to authenticated;

revoke all on function public.transicionar_status_sme_demanda(bigint, text, text, text, date)
from public, anon, authenticated;
grant execute on function public.transicionar_status_sme_demanda(bigint, text, text, text, date)
to authenticated;

revoke all on function public.excluir_sme_demanda(bigint, text)
from public, anon, authenticated;
grant execute on function public.excluir_sme_demanda(bigint, text)
to authenticated;

revoke all on function public.restaurar_sme_demanda(bigint, text)
from public, anon, authenticated;
grant execute on function public.restaurar_sme_demanda(bigint, text)
to authenticated;

revoke all on function public.listar_perfis_minimos()
from public, anon, authenticated;
grant execute on function public.listar_perfis_minimos()
to authenticated;

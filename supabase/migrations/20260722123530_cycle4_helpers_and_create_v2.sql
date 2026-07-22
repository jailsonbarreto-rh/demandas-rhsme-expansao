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

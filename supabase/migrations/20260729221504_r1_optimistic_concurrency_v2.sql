-- R1-5A — concorrência otimista aditiva para as mutações auditáveis.
-- Este release preserva as assinaturas atuais durante o rollout do frontend.

create or replace function private.assert_sme_demanda_version(
  p_current_updated_at timestamptz,
  p_expected_updated_at timestamptz
)
returns void
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_current_updated_at is distinct from p_expected_updated_at then
    raise exception using
      errcode = 'PT409',
      message = 'CTRH_VERSION_CONFLICT';
  end if;
end;
$$;

revoke all on function private.assert_sme_demanda_version(timestamptz, timestamptz)
from public, anon, authenticated, service_role;

create or replace function public.editar_sme_demanda_v2(
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
  p_justificativa text,
  p_expected_updated_at timestamptz
)
returns public.sme_demandas
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current_updated_at timestamptz;
begin
  if not private.can_edit() then
    raise exception 'Acesso negado: permissões insuficientes.';
  end if;

  select d.updated_at
  into v_current_updated_at
  from public.sme_demandas d
  where d.id = p_demanda_id
  for update;

  if not found then
    raise exception 'Demanda não encontrada.';
  end if;

  perform private.assert_sme_demanda_version(
    v_current_updated_at,
    p_expected_updated_at
  );

  return public.editar_sme_demanda(
    p_demanda_id,
    p_assunto,
    p_responsavel_id,
    p_responsavel,
    p_limite1,
    p_limite1_situacao,
    p_limite1_justificativa,
    p_limite2,
    p_limite2_situacao,
    p_limite2_justificativa,
    p_setor,
    p_classificacao,
    p_link_origem,
    p_proxima_acao,
    p_proxima_acao_em,
    p_justificativa
  );
end;
$$;

create or replace function public.registrar_andamento_sme_demanda_v2(
  p_demanda_id bigint,
  p_comentario text,
  p_proxima_acao text,
  p_proxima_acao_em date,
  p_expected_updated_at timestamptz
)
returns public.sme_demandas
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current_updated_at timestamptz;
begin
  if not private.can_edit() then
    raise exception 'Acesso negado: permissões insuficientes.';
  end if;

  select d.updated_at
  into v_current_updated_at
  from public.sme_demandas d
  where d.id = p_demanda_id
  for update;

  if not found then
    raise exception 'Demanda não encontrada.';
  end if;

  perform private.assert_sme_demanda_version(
    v_current_updated_at,
    p_expected_updated_at
  );

  return public.registrar_andamento_sme_demanda(
    p_demanda_id,
    p_comentario,
    p_proxima_acao,
    p_proxima_acao_em
  );
end;
$$;

create or replace function public.transicionar_status_sme_demanda_v2(
  p_demanda_id bigint,
  p_novo_status text,
  p_comentario text,
  p_proxima_acao text,
  p_proxima_acao_em date,
  p_expected_updated_at timestamptz
)
returns public.sme_demandas
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current_updated_at timestamptz;
begin
  if not private.can_edit() then
    raise exception 'Acesso negado: permissões insuficientes.';
  end if;

  select d.updated_at
  into v_current_updated_at
  from public.sme_demandas d
  where d.id = p_demanda_id
  for update;

  if not found then
    raise exception 'Demanda não encontrada.';
  end if;

  perform private.assert_sme_demanda_version(
    v_current_updated_at,
    p_expected_updated_at
  );

  return public.transicionar_status_sme_demanda(
    p_demanda_id,
    p_novo_status,
    p_comentario,
    p_proxima_acao,
    p_proxima_acao_em
  );
end;
$$;

create or replace function public.excluir_sme_demanda_v2(
  p_demanda_id bigint,
  p_motivo text,
  p_expected_updated_at timestamptz
)
returns public.sme_demandas
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current_updated_at timestamptz;
begin
  if not private.is_admin() then
    raise exception 'Acesso negado: somente administrador pode excluir demandas.';
  end if;

  select d.updated_at
  into v_current_updated_at
  from public.sme_demandas d
  where d.id = p_demanda_id
  for update;

  if not found then
    raise exception 'Demanda não encontrada.';
  end if;

  perform private.assert_sme_demanda_version(
    v_current_updated_at,
    p_expected_updated_at
  );

  return public.excluir_sme_demanda(
    p_demanda_id,
    p_motivo
  );
end;
$$;

create or replace function public.restaurar_sme_demanda_v2(
  p_demanda_id bigint,
  p_motivo text,
  p_expected_updated_at timestamptz
)
returns public.sme_demandas
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current_updated_at timestamptz;
begin
  if not private.is_admin() then
    raise exception 'Acesso negado: somente administrador pode restaurar demandas.';
  end if;

  select d.updated_at
  into v_current_updated_at
  from public.sme_demandas d
  where d.id = p_demanda_id
  for update;

  if not found then
    raise exception 'Demanda não encontrada.';
  end if;

  perform private.assert_sme_demanda_version(
    v_current_updated_at,
    p_expected_updated_at
  );

  return public.restaurar_sme_demanda(
    p_demanda_id,
    p_motivo
  );
end;
$$;

revoke all on function public.editar_sme_demanda_v2(
  bigint, text, uuid, text, date, text, text, date, text, text,
  text, text, text, text, date, text, timestamptz
) from public, anon, authenticated, service_role;
grant execute on function public.editar_sme_demanda_v2(
  bigint, text, uuid, text, date, text, text, date, text, text,
  text, text, text, text, date, text, timestamptz
) to authenticated;

revoke all on function public.registrar_andamento_sme_demanda_v2(
  bigint, text, text, date, timestamptz
) from public, anon, authenticated, service_role;
grant execute on function public.registrar_andamento_sme_demanda_v2(
  bigint, text, text, date, timestamptz
) to authenticated;

revoke all on function public.transicionar_status_sme_demanda_v2(
  bigint, text, text, text, date, timestamptz
) from public, anon, authenticated, service_role;
grant execute on function public.transicionar_status_sme_demanda_v2(
  bigint, text, text, text, date, timestamptz
) to authenticated;

revoke all on function public.excluir_sme_demanda_v2(
  bigint, text, timestamptz
) from public, anon, authenticated, service_role;
grant execute on function public.excluir_sme_demanda_v2(
  bigint, text, timestamptz
) to authenticated;

revoke all on function public.restaurar_sme_demanda_v2(
  bigint, text, timestamptz
) from public, anon, authenticated, service_role;
grant execute on function public.restaurar_sme_demanda_v2(
  bigint, text, timestamptz
) to authenticated;

comment on function private.assert_sme_demanda_version(timestamptz, timestamptz)
is 'Compara a versão esperada da demanda e lança PT409/CTRH_VERSION_CONFLICT sem efeitos colaterais.';

comment on function public.editar_sme_demanda_v2(
  bigint, text, uuid, text, date, text, text, date, text, text,
  text, text, text, text, date, text, timestamptz
) is 'Edição auditável com concorrência otimista pelo updated_at esperado.';

comment on function public.registrar_andamento_sme_demanda_v2(
  bigint, text, text, date, timestamptz
) is 'Andamento auditável com concorrência otimista pelo updated_at esperado.';

comment on function public.transicionar_status_sme_demanda_v2(
  bigint, text, text, text, date, timestamptz
) is 'Transição auditável de status com concorrência otimista pelo updated_at esperado.';

comment on function public.excluir_sme_demanda_v2(
  bigint, text, timestamptz
) is 'Exclusão lógica administrativa com concorrência otimista pelo updated_at esperado.';

comment on function public.restaurar_sme_demanda_v2(
  bigint, text, timestamptz
) is 'Restauração administrativa com concorrência otimista pelo updated_at esperado.';

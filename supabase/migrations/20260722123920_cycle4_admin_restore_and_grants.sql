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

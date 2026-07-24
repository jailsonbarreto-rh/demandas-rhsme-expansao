-- R3 — responsáveis oficiais vinculados a usuários cadastrados.
-- Preserva a informação histórica "Vanessa Migrado" sem UUID até existir perfil oficial.

create or replace function private.r3_responsavel_nome(p_responsavel_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_nome text;
begin
  if p_responsavel_id is null then
    return '';
  end if;

  select btrim(p.nome)
  into v_nome
  from public.perfis_usuarios p
  join auth.users u on u.id = p.id
  where p.id = p_responsavel_id;

  if v_nome is null or v_nome = '' then
    raise exception 'Responsável inválido: selecione um usuário cadastrado.';
  end if;

  return v_nome;
end;
$$;

revoke all on function private.r3_responsavel_nome(uuid)
from public, anon, authenticated;

create or replace function private.r3_sync_responsavel_oficial()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.responsavel_id is not null then
    new.responsavel := private.r3_responsavel_nome(new.responsavel_id);
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.origem = 'sistema' then
      new.responsavel := '';
    else
      new.responsavel := btrim(coalesce(new.responsavel, ''));
    end if;
    return new;
  end if;

  if old.responsavel_id is null
     and old.origem = 'legado'
     and new.origem = 'legado' then
    -- Um texto legado sem perfil pode ser preservado, mas não reescrito livremente.
    new.responsavel := old.responsavel;
  else
    new.responsavel := '';
  end if;

  return new;
end;
$$;

revoke all on function private.r3_sync_responsavel_oficial()
from public, anon, authenticated;

drop trigger if exists sme_demandas_responsavel_oficial_trigger
on public.sme_demandas;

create trigger sme_demandas_responsavel_oficial_trigger
before insert or update of responsavel_id, responsavel, origem
on public.sme_demandas
for each row execute function private.r3_sync_responsavel_oficial();

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
  join auth.users u on u.id = p.id
  where private.is_active()
  order by p.nome, p.id;
$$;

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
  v_responsavel text := '';
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

  if p_responsavel_id is not null then
    v_responsavel := private.r3_responsavel_nome(p_responsavel_id);
  end if;

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
    v_responsavel,
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
  if v_demanda.responsavel_id is not null then
    v_changes := private.cycle4_append_change(
      v_changes, 'responsavel_id', null, v_demanda.responsavel_id::text
    );
    v_changes := private.cycle4_append_change(
      v_changes, 'responsavel', null, v_demanda.responsavel
    );
  end if;

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
  v_responsavel text := '';
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

  if p_responsavel_id is not null then
    v_responsavel := private.r3_responsavel_nome(p_responsavel_id);
  elsif v_before.responsavel_id is null then
    -- Preserva informação legada sem UUID (atualmente, Vanessa Migrado).
    v_responsavel := v_before.responsavel;
  else
    v_responsavel := '';
  end if;

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
  if v_before.responsavel is distinct from v_responsavel then
    v_changes := private.cycle4_append_change(
      v_changes, 'responsavel', v_before.responsavel, v_responsavel
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
    responsavel = v_responsavel,
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

create or replace function public.criar_sme_demanda(
  p_numero text,
  p_tipo text,
  p_assunto text,
  p_responsavel text,
  p_limite1 date,
  p_limite2 date,
  p_status text,
  p_setor text,
  p_classificacao text
)
returns public.sme_demandas
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.can_edit() then
    raise exception 'Acesso negado: permissões insuficientes.';
  end if;

  raise exception 'O cadastro textual de responsável foi descontinuado. Use o cadastro com usuário oficial.';
end;
$$;

-- Confirma que todos os perfis necessários existem antes de tocar nas demandas.
do $$
declare
  v_missing integer;
begin
  with expected(email) as (
    values
      ('ericaholanda@rioeduca.net'),
      ('gisellefiquene@rioeduca.net'),
      ('sabrinaandrade@rioeduca.net'),
      ('thiago.freitas@rioeduca.net'),
      ('jaquelinemelo007@rioeduca.net'),
      ('jailsonbsilva@rioeduca.net'),
      ('jessica.aguiar@rioeduca.net'),
      ('elisabethmoraes@rioeduca.net'),
      ('helenasilva@rioeduca.net')
  )
  select count(*) into v_missing
  from expected e
  where not exists (
    select 1
    from public.perfis_usuarios p
    join auth.users u on u.id = p.id
    where lower(p.email) = e.email
  );

  if v_missing <> 0 then
    raise exception 'Migração R3 interrompida: % perfis oficiais não foram encontrados.', v_missing;
  end if;
end;
$$;

-- Evita que a migração administrativa apague a autoria anterior pelo gatilho genérico.
alter table public.sme_demandas disable trigger sme_demandas_touch_updated_at;

with mappings(legacy_name, email) as (
  values
    ('Erica', 'ericaholanda@rioeduca.net'),
    ('Erica Migrado', 'ericaholanda@rioeduca.net'),
    ('Giselle', 'gisellefiquene@rioeduca.net'),
    ('Giselle Migrado', 'gisellefiquene@rioeduca.net'),
    ('Sabrina', 'sabrinaandrade@rioeduca.net'),
    ('Thiago', 'thiago.freitas@rioeduca.net'),
    ('Thiago Migrado', 'thiago.freitas@rioeduca.net'),
    ('Jaqueline', 'jaquelinemelo007@rioeduca.net'),
    ('Jaqueline Migrado', 'jaquelinemelo007@rioeduca.net'),
    ('Jaqueline IHA', 'jaquelinemelo007@rioeduca.net'),
    ('Jailson', 'jailsonbsilva@rioeduca.net'),
    ('Jessica', 'jessica.aguiar@rioeduca.net'),
    ('Beth', 'elisabethmoraes@rioeduca.net'),
    ('Beth Migrado', 'elisabethmoraes@rioeduca.net'),
    ('Helena', 'helenasilva@rioeduca.net')
),
targets as materialized (
  select
    d.id,
    d.status,
    d.setor,
    d.responsavel as old_name,
    p.id as new_id,
    btrim(p.nome) as new_name
  from public.sme_demandas d
  join mappings m on m.legacy_name = d.responsavel
  join public.perfis_usuarios p on lower(p.email) = m.email
  join auth.users u on u.id = p.id
  where d.responsavel_id is null
),
logged as (
  insert into public.sme_historico (
    demanda_id,
    tipo_evento,
    status_anterior,
    status_novo,
    setor,
    comentario,
    alteracoes,
    created_by
  )
  select
    t.id,
    'reatribuicao',
    t.status,
    t.status,
    t.setor,
    'Responsável vinculado a perfil oficial na migração R3.',
    jsonb_build_array(
      jsonb_build_object(
        'field', 'responsavel_id',
        'before', null,
        'after', t.new_id::text
      ),
      jsonb_build_object(
        'field', 'responsavel',
        'before', t.old_name,
        'after', t.new_name
      )
    ),
    null
  from targets t
  returning demanda_id
)
update public.sme_demandas d
set responsavel_id = t.new_id
from targets t
where d.id = t.id
  and exists (
    select 1 from logged l where l.demanda_id = d.id
  );

alter table public.sme_demandas enable trigger sme_demandas_touch_updated_at;

-- Invariantes finais da migração autorizada.
do $$
begin
  if exists (
    select 1
    from public.sme_demandas d
    where d.responsavel_id is null
      and d.responsavel in (
        'Erica', 'Erica Migrado',
        'Giselle', 'Giselle Migrado',
        'Sabrina',
        'Thiago', 'Thiago Migrado',
        'Jaqueline', 'Jaqueline Migrado', 'Jaqueline IHA',
        'Jailson', 'Jessica',
        'Beth', 'Beth Migrado',
        'Helena'
      )
  ) then
    raise exception 'Migração R3 incompleta: ainda existem responsáveis autorizados sem UUID.';
  end if;

  if (select count(*) from public.sme_demandas
      where responsavel = 'Vanessa Migrado' and responsavel_id is null) <> 1 then
    raise exception 'Migração R3 interrompida: a informação Vanessa Migrado não foi preservada corretamente.';
  end if;

  if exists (
    select 1
    from public.sme_demandas d
    join public.perfis_usuarios p on p.id = d.responsavel_id
    where d.responsavel is distinct from btrim(p.nome)
  ) then
    raise exception 'Migração R3 interrompida: há divergência entre UUID e nome oficial.';
  end if;
end;
$$;

revoke all on function public.listar_perfis_minimos()
from public, anon, authenticated;
grant execute on function public.listar_perfis_minimos()
to authenticated;

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

revoke all on function public.criar_sme_demanda(
  text, text, text, text, date, date, text, text, text
) from public, anon, authenticated;
grant execute on function public.criar_sme_demanda(
  text, text, text, text, date, date, text, text, text
) to authenticated;

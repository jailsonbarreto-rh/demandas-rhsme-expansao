-- Ciclo 3 — expansão aditiva do modelo da Central de Trabalho CTRH.
-- Esta migration não remove colunas, funções, grants ou APIs existentes.

-- Salvaguarda operacional para o plano gratuito, que não possui backup automático acessível.
-- As cópias ficam no schema privado, sem grants para os papéis da aplicação, e preservam
-- exatamente as colunas e os registros existentes antes da expansão.
create table private.cycle3_backup_sme_demandas_20260722
as table public.sme_demandas;

create table private.cycle3_backup_sme_historico_20260722
as table public.sme_historico;

create table private.cycle3_backup_perfis_usuarios_20260722
as table public.perfis_usuarios;

create table private.cycle3_backup_manifest_20260722 (
  captured_at timestamptz not null default now(),
  demandas_count bigint not null,
  historico_count bigint not null,
  perfis_count bigint not null
);

insert into private.cycle3_backup_manifest_20260722 (
  demandas_count,
  historico_count,
  perfis_count
)
select
  (select count(*) from private.cycle3_backup_sme_demandas_20260722),
  (select count(*) from private.cycle3_backup_sme_historico_20260722),
  (select count(*) from private.cycle3_backup_perfis_usuarios_20260722);

revoke all on table private.cycle3_backup_sme_demandas_20260722
from public, anon, authenticated;
revoke all on table private.cycle3_backup_sme_historico_20260722
from public, anon, authenticated;
revoke all on table private.cycle3_backup_perfis_usuarios_20260722
from public, anon, authenticated;
revoke all on table private.cycle3_backup_manifest_20260722
from public, anon, authenticated;

comment on table private.cycle3_backup_sme_demandas_20260722 is
  'Snapshot operacional anterior à expansão do Ciclo 3. Remover somente após estabilidade confirmada em ciclo posterior.';
comment on table private.cycle3_backup_sme_historico_20260722 is
  'Snapshot operacional anterior à expansão do Ciclo 3. Remover somente após estabilidade confirmada em ciclo posterior.';
comment on table private.cycle3_backup_perfis_usuarios_20260722 is
  'Snapshot operacional anterior à expansão do Ciclo 3. Remover somente após estabilidade confirmada em ciclo posterior.';
comment on table private.cycle3_backup_manifest_20260722 is
  'Contagens do snapshot operacional anterior à expansão do Ciclo 3.';

alter table public.sme_demandas
  add column if not exists responsavel_id uuid
    references public.perfis_usuarios(id) on delete set null,
  add column if not exists proxima_acao text,
  add column if not exists proxima_acao_em date,
  add column if not exists limite1_situacao text,
  add column if not exists limite1_justificativa text,
  add column if not exists limite2_situacao text,
  add column if not exists limite2_justificativa text,
  add column if not exists link_origem text,
  add column if not exists origem text,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid
    references auth.users(id) on delete set null,
  add column if not exists deletion_reason text;

alter table public.sme_historico
  add column if not exists tipo_evento text,
  add column if not exists status_anterior text,
  add column if not exists alteracoes jsonb not null default '[]'::jsonb;

-- Todo registro já existente é legado. Novos registros passam a usar o default sistema.
update public.sme_demandas
set origem = 'legado'
where origem is null;

-- A presença da data é a única informação histórica segura para classificar o prazo.
update public.sme_demandas
set
  limite1_situacao = case
    when limite1 is not null then 'definido'
    else 'nao_informado'
  end,
  limite1_justificativa = null
where limite1_situacao is null;

update public.sme_demandas
set
  limite2_situacao = case
    when limite2 is not null then 'definido'
    else 'nao_informado'
  end,
  limite2_justificativa = null
where limite2_situacao is null;

-- O primeiro evento conhecido de cada demanda representa a criação. Os demais eventos
-- legados permanecem mudanças de status, sem inferir status anterior ou autoria.
with eventos_ordenados as (
  select
    id,
    row_number() over (
      partition by demanda_id
      order by created_at asc, id asc
    ) as ordem
  from public.sme_historico
)
update public.sme_historico h
set tipo_evento = case
  when e.ordem = 1 then 'criacao'
  else 'mudanca_status'
end
from eventos_ordenados e
where h.id = e.id
  and h.tipo_evento is null;

alter table public.sme_demandas
  alter column origem set default 'sistema',
  alter column origem set not null,
  alter column limite1_situacao set not null,
  alter column limite2_situacao set not null;

alter table public.sme_historico
  alter column tipo_evento set not null,
  alter column alteracoes set default '[]'::jsonb;

-- Compatibilidade temporária com o frontend e as RPCs legadas.
-- Se apenas a data antiga for alterada, a situação correspondente é derivada sem inventar valor.
create or replace function private.normalizar_campos_central_trabalho()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.limite1_situacao is null then
      new.limite1_situacao := case
        when new.limite1 is not null then 'definido'
        else 'nao_informado'
      end;
      new.limite1_justificativa := null;
    end if;

    if new.limite2_situacao is null then
      new.limite2_situacao := case
        when new.limite2 is not null then 'definido'
        else 'nao_informado'
      end;
      new.limite2_justificativa := null;
    end if;

    if new.origem is null then
      new.origem := 'sistema';
    end if;
  elsif tg_op = 'UPDATE' then
    if new.limite1 is distinct from old.limite1
       and new.limite1_situacao is not distinct from old.limite1_situacao
       and new.limite1_justificativa is not distinct from old.limite1_justificativa then
      new.limite1_situacao := case
        when new.limite1 is not null then 'definido'
        else 'nao_informado'
      end;
      new.limite1_justificativa := null;
    end if;

    if new.limite2 is distinct from old.limite2
       and new.limite2_situacao is not distinct from old.limite2_situacao
       and new.limite2_justificativa is not distinct from old.limite2_justificativa then
      new.limite2_situacao := case
        when new.limite2 is not null then 'definido'
        else 'nao_informado'
      end;
      new.limite2_justificativa := null;
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.normalizar_campos_central_trabalho()
from public, anon, authenticated;

create trigger sme_demandas_normalizar_campos_central_trabalho
before insert or update on public.sme_demandas
for each row execute function private.normalizar_campos_central_trabalho();

-- As RPCs antigas ainda inserem histórico sem tipo_evento. O gatilho classifica somente
-- criação versus movimentação posterior e preserva qualquer tipo explicitamente informado.
create or replace function private.normalizar_evento_central_trabalho()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_possui_evento boolean;
begin
  if new.tipo_evento is null then
    select exists (
      select 1
      from public.sme_historico h
      where h.demanda_id = new.demanda_id
    ) into v_possui_evento;

    new.tipo_evento := case
      when v_possui_evento then 'mudanca_status'
      else 'criacao'
    end;
  end if;

  if new.alteracoes is null then
    new.alteracoes := '[]'::jsonb;
  end if;

  return new;
end;
$$;

revoke all on function private.normalizar_evento_central_trabalho()
from public, anon, authenticated;

create trigger sme_historico_normalizar_evento_central_trabalho
before insert on public.sme_historico
for each row execute function private.normalizar_evento_central_trabalho();

alter table public.sme_demandas
  add constraint sme_demandas_limite1_consistencia_check check (
    (limite1_situacao = 'definido'
      and limite1 is not null
      and limite1_justificativa is null)
    or (limite1_situacao = 'nao_informado'
      and limite1 is null
      and limite1_justificativa is null)
    or (limite1_situacao = 'nao_se_aplica'
      and limite1 is null
      and length(btrim(coalesce(limite1_justificativa, ''))) >= 10)
  ) not valid;

alter table public.sme_demandas
  add constraint sme_demandas_limite2_consistencia_check check (
    (limite2_situacao = 'definido'
      and limite2 is not null
      and limite2_justificativa is null)
    or (limite2_situacao = 'nao_informado'
      and limite2 is null
      and limite2_justificativa is null)
    or (limite2_situacao = 'nao_se_aplica'
      and limite2 is null
      and length(btrim(coalesce(limite2_justificativa, ''))) >= 10)
  ) not valid;

alter table public.sme_demandas
  add constraint sme_demandas_origem_check check (
    origem in ('legado', 'sistema')
  ) not valid;

alter table public.sme_demandas
  add constraint sme_demandas_exclusao_logica_check check (
    (deleted_at is null and deleted_by is null and deletion_reason is null)
    or (
      deleted_at is not null
      and deleted_by is not null
      and length(btrim(coalesce(deletion_reason, ''))) >= 10
    )
  ) not valid;

alter table public.sme_historico
  add constraint sme_historico_tipo_evento_check check (
    tipo_evento in (
      'criacao',
      'andamento',
      'mudanca_status',
      'edicao',
      'reatribuicao',
      'alteracao_prazo',
      'exclusao',
      'restauracao'
    )
  ) not valid;

create index if not exists sme_demandas_responsavel_abertas_idx
  on public.sme_demandas (responsavel_id)
  where deleted_at is null and status <> 'Encerrado';

create index if not exists sme_demandas_proxima_acao_idx
  on public.sme_demandas (proxima_acao_em)
  where deleted_at is null and status <> 'Encerrado';

create index if not exists sme_demandas_status_visivel_idx
  on public.sme_demandas (status)
  where deleted_at is null;

create index if not exists sme_historico_demanda_data_idx
  on public.sme_historico (demanda_id, created_at desc);

\set ON_ERROR_STOP on

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ciclo3.editor@rioeduca.net',
  '',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"nome":"Editor Ciclo 3"}'::jsonb,
  now(),
  now()
);

update public.perfis_usuarios
set nome = 'Editor Ciclo 3', nivel = 'editor', status = 'ativo', setor = 'CTRH'
where id = '11111111-1111-1111-1111-111111111111';

insert into public.sme_demandas (
  numero, tipo, assunto, responsavel, limite1, limite2,
  status, setor, classificacao, created_by, updated_by,
  created_at, updated_at
) values
(
  'LEGADO-C3-001', 'Processo', 'Demanda legada com prazo interno', 'Responsável textual A',
  date '2026-07-10', null, 'Aguardando Andamento', 'CTRH', 'Diversos',
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  timestamptz '2026-07-01 09:00:00-03', timestamptz '2026-07-01 09:00:00-03'
),
(
  'LEGADO-C3-002', 'Expediente', 'Demanda legada com prazo final', 'Responsável textual B',
  null, date '2026-08-20', 'Tramitado', 'CTRH', 'Permuta',
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  timestamptz '2026-07-02 09:00:00-03', timestamptz '2026-07-02 09:00:00-03'
);

insert into public.sme_historico (
  demanda_id, status_novo, setor, comentario, created_by, created_at
)
select id, 'Aguardando Andamento', 'CTRH', 'Criação legada',
  '11111111-1111-1111-1111-111111111111', timestamptz '2026-07-01 09:00:00-03'
from public.sme_demandas where numero = 'LEGADO-C3-001';

insert into public.sme_historico (
  demanda_id, status_novo, setor, comentario, created_by, created_at
)
select id, 'Ajustar', 'CTRH', 'Movimentação legada posterior',
  '11111111-1111-1111-1111-111111111111', timestamptz '2026-07-03 09:00:00-03'
from public.sme_demandas where numero = 'LEGADO-C3-001';

insert into public.sme_historico (
  demanda_id, status_novo, setor, comentario, created_by, created_at
)
select id, 'Tramitado', 'CTRH', 'Criação legada',
  '11111111-1111-1111-1111-111111111111', timestamptz '2026-07-02 09:00:00-03'
from public.sme_demandas where numero = 'LEGADO-C3-002';

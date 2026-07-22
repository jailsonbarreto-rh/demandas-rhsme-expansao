\set ON_ERROR_STOP on

-- O usuário 111... já é criado pela fixture do Ciclo 3.
update public.perfis_usuarios
set nome = 'Administrador Ciclo 4', nivel = 'administrador', status = 'ativo', setor = 'CTRH'
where id = '11111111-1111-1111-1111-111111111111';

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
(
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'ciclo4.editor@rioeduca.net', '', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"nome":"Editor Ciclo 4"}'::jsonb, now(), now()
),
(
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'ciclo4.leitor@rioeduca.net', '', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"nome":"Leitor Ciclo 4"}'::jsonb, now(), now()
);

update public.perfis_usuarios
set nome = 'Editor Ciclo 4', nivel = 'editor', status = 'ativo', setor = 'CTRH'
where id = '22222222-2222-2222-2222-222222222222';

update public.perfis_usuarios
set nome = 'Leitor Ciclo 4', nivel = 'leitor', status = 'ativo', setor = 'Consulta'
where id = '33333333-3333-3333-3333-333333333333';

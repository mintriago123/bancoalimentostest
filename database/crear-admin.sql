-- Script para crear un usuario administrador completo
-- IMPORTANTE: Ejecuta este script en el SQL Editor de Supabase

-- 1. Primero, eliminar el usuario existente en public.usuarios si existe
-- DELETE FROM public.usuarios WHERE id = '<ID DEL USUARIO A ELIMINAR>';

-- 2. Insertar el usuario en auth.users (tabla de autenticación de Supabase)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '<CAMBIAR POR UUID DEL USUARIO>',   -- Cambia este UUID por el que quieras usar
  'authenticated',
  'authenticated',
  'admin@bancoalimentos.com', -- Cambia este email por el que quieras usar
  crypt('admin123', gen_salt('bf')), -- La contraseña será 'admin123' - cámbiala por la que prefieras
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL
);

-- 3. Insertar el usuario en public.usuarios (tabla personalizada)
INSERT INTO public.usuarios (
  id,
  rol,
  tipo_persona,
  nombre,
  ruc,
  cedula,
  direccion,
  telefono,
  representante
) VALUES (
  '<CAMBIA POR EL MISMO UUID DE AUTH.USERS>', -- El mismo UUID que en auth.users
  'ADMINISTRADOR',   -- rol
  'NATURAL',         -- tipo_persona
  'Administrador',   -- nombre
  NULL,              -- ruc
  '1234567890',      -- cedula (única)
  'Direccion 1',     -- direccion
  '0999999999',      -- telefono
  'Administrador'    -- representante
);

-- 4. Insertar la identidad en auth.identities (necesaria para la autenticación por email)
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at,
  id
) VALUES (
  '<CAMBIA POR EL MISMO UUID DE AUTH.USERS>', -- El mismo UUID que en auth.users
  '<CAMBIA POR EL MISMO UUID DE AUTH.USERS>', -- El mismo UUID que en auth.users
  format('{"sub":"%s","email":"%s"}', '40f275bd-a2f7-45b0-a82f-b7cd1ed8dafa', 'admin@bancoalimentos.com')::jsonb,
  'email',
  NOW(),
  NOW(),
  NOW(),
  gen_random_uuid()
);

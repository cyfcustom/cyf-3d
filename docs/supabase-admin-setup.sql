-- =====================================================
-- CYF Custom - Admin User Setup Script
-- =====================================================
-- Este script crea el usuario administrador inicial
-- Email: francisco.august.fa@gmail.com
-- Password: Cyfcustom.765
-- =====================================================

-- 1. Habilitar la extensión pgcrypto si no está habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Crear el usuario administrador
-- Nota: Ejecuta esto en el SQL Editor de Supabase Dashboard
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Generar un UUID para el usuario
  user_id := gen_random_uuid();

  -- Insertar el usuario en auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    email_change_sent_at,
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
    confirmed_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',  -- instance_id
    user_id,                                   -- id
    'authenticated',                           -- aud
    'authenticated',                           -- role
    'francisco.august.fa@gmail.com',          -- email
    crypt('Cyfcustom.765', gen_salt('bf')),   -- encrypted_password
    NOW(),                                     -- email_confirmed_at
    NOW(),                                     -- confirmation_sent_at
    NULL,                                      -- email_change_sent_at
    '{"provider": "email", "providers": ["email"]}'::jsonb,  -- raw_app_meta_data
    '{"role": "admin", "full_name": "CYF Admin"}'::jsonb,    -- raw_user_meta_data
    FALSE,                                     -- is_super_admin
    NOW(),                                     -- created_at
    NOW(),                                     -- updated_at
    NULL,                                      -- phone
    NULL,                                      -- phone_confirmed_at
    '',                                        -- phone_change
    '',                                        -- phone_change_token
    NULL,                                      -- phone_change_sent_at
    NOW(),                                     -- confirmed_at
    '',                                        -- email_change_token_current
    0,                                         -- email_change_confirm_status
    NULL,                                      -- banned_until
    '',                                        -- reauthentication_token
    NULL,                                      -- reauthentication_sent_at
    FALSE,                                     -- is_sso_user
    NULL                                       -- deleted_at
  )
  ON CONFLICT (email) DO NOTHING;

  -- Insertar identidad en auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    user_id,
    jsonb_build_object(
      'sub', user_id::text,
      'email', 'francisco.august.fa@gmail.com'
    ),
    'email',
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (provider, id) DO NOTHING;

  RAISE NOTICE 'Usuario administrador creado exitosamente: %', user_id;
END $$;

-- 3. Verificar que el usuario fue creado
SELECT
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data,
  created_at
FROM auth.users
WHERE email = 'francisco.august.fa@gmail.com';

-- =====================================================
-- INSTRUCCIONES DE USO:
-- =====================================================
-- 1. Ve a tu proyecto en Supabase Dashboard
-- 2. Navega a "SQL Editor"
-- 3. Copia y pega este script completo
-- 4. Click en "Run" para ejecutar
-- 5. Deberías ver el mensaje "Usuario administrador creado exitosamente"
-- 6. Verifica la query SELECT al final que muestra los datos del usuario
--
-- Después de crear el usuario:
-- 1. Ve a http://localhost:5173/cyf-admin-access
-- 2. Inicia sesión con:
--    Email: francisco.august.fa@gmail.com
--    Password: Cyfcustom.765
-- 3. Configura Google Authenticator para 2FA
-- =====================================================

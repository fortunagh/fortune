-- =============================================================================
-- Seed: master admin + customer (dev / staging)
-- Run in Supabase → SQL Editor after migrations.
--
-- 1) Change emails + passwords below (or keep .local addresses for local dev).
-- 2) If INSERT fails, your auth schema may differ — create users in
--    Authentication → Users, then use only the "ROLE ASSIGNMENT" section.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  v_admin_id uuid := gen_random_uuid();
  v_customer_id uuid := gen_random_uuid();
  v_admin_email text := 'admin@fortuna.local';
  v_customer_email text := 'customer@fortuna.local';
  v_admin_pw text := 'AdminChangeMe!1';
  v_customer_pw text := 'CustomerChangeMe!1';
BEGIN
  -- ---------------------------------------------------------------------------
  -- Master admin (email + password login)
  -- ---------------------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_admin_id,
    'authenticated',
    'authenticated',
    v_admin_email,
    extensions.crypt(v_admin_pw, extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- Trigger may have inserted profiles as customer — promote to admin
  INSERT INTO public.profiles (id, role)
  VALUES (v_admin_id, 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = now();

  INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_admin_id::text,
    v_admin_id,
    jsonb_build_object(
      'sub', v_admin_id::text,
      'email', v_admin_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  );

  -- ---------------------------------------------------------------------------
  -- Customer
  -- ---------------------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_customer_id,
    'authenticated',
    'authenticated',
    v_customer_email,
    extensions.crypt(v_customer_pw, extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  INSERT INTO public.profiles (id, role)
  VALUES (v_customer_id, 'customer')
  ON CONFLICT (id) DO UPDATE SET role = 'customer', updated_at = now();

  INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_customer_id::text,
    v_customer_id,
    jsonb_build_object(
      'sub', v_customer_id::text,
      'email', v_customer_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  );

  RAISE NOTICE 'Seeded admin: % (%)', v_admin_email, v_admin_id;
  RAISE NOTICE 'Seeded customer: % (%)', v_customer_email, v_customer_id;
END $$;

-- =============================================================================
-- ALTERNATIVE — users already exist (created in Dashboard): set roles only
-- =============================================================================
/*
UPDATE public.profiles
SET role = 'admin', updated_at = now()
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@fortuna.local' LIMIT 1);

UPDATE public.profiles
SET role = 'customer', updated_at = now()
WHERE id = (SELECT id FROM auth.users WHERE email = 'customer@fortuna.local' LIMIT 1);
*/

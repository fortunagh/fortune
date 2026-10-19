-- =============================================================================
-- Seed: master admin + customer (dev / staging) — IDEMPOTENT
-- Run in Supabase → SQL Editor after migrations.
-- Safe to re-run: existing emails are updated (password + role), not duplicated.
--
-- Defaults:
--   admin@fortuna.local      / AdminChangeMe!1
--   customer@fortuna.local   / CustomerChangeMe!1
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  v_admin_id uuid;
  v_customer_id uuid;
  v_admin_email text := 'admin@fortuna.local';
  v_customer_email text := 'customer@fortuna.local';
  v_admin_pw text := 'AdminChangeMe!1';
  v_customer_pw text := 'CustomerChangeMe!1';
  v_admin_hash text := extensions.crypt(v_admin_pw, extensions.gen_salt('bf'));
  v_customer_hash text := extensions.crypt(v_customer_pw, extensions.gen_salt('bf'));
BEGIN
  -- ---------------------------------------------------------------------------
  -- Master admin
  -- ---------------------------------------------------------------------------
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE email = v_admin_email
  LIMIT 1;

  IF v_admin_id IS NULL THEN
    v_admin_id := gen_random_uuid();

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
      v_admin_hash,
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

    RAISE NOTICE 'Created admin user %', v_admin_email;
  ELSE
    UPDATE auth.users
    SET
      encrypted_password = v_admin_hash,
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
    WHERE id = v_admin_id;

    RAISE NOTICE 'Admin already exists — password reset for %', v_admin_email;
  END IF;

  INSERT INTO public.profiles (id, role)
  VALUES (v_admin_id, 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = now();

  IF NOT EXISTS (
    SELECT 1 FROM auth.identities
    WHERE user_id = v_admin_id AND provider = 'email'
  ) THEN
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
  END IF;

  -- ---------------------------------------------------------------------------
  -- Customer
  -- ---------------------------------------------------------------------------
  SELECT id INTO v_customer_id
  FROM auth.users
  WHERE email = v_customer_email
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    v_customer_id := gen_random_uuid();

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
      v_customer_hash,
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

    RAISE NOTICE 'Created customer user %', v_customer_email;
  ELSE
    UPDATE auth.users
    SET
      encrypted_password = v_customer_hash,
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
    WHERE id = v_customer_id;

    RAISE NOTICE 'Customer already exists — password reset for %', v_customer_email;
  END IF;

  INSERT INTO public.profiles (id, role)
  VALUES (v_customer_id, 'customer')
  ON CONFLICT (id) DO UPDATE SET role = 'customer', updated_at = now();

  IF NOT EXISTS (
    SELECT 1 FROM auth.identities
    WHERE user_id = v_customer_id AND provider = 'email'
  ) THEN
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
  END IF;

  RAISE NOTICE 'Ready — admin: % (%)', v_admin_email, v_admin_id;
  RAISE NOTICE 'Ready — customer: % (%)', v_customer_email, v_customer_id;
END $$;

-- Quick check (optional):
-- SELECT u.email, p.role
-- FROM auth.users u
-- JOIN public.profiles p ON p.id = u.id
-- WHERE u.email IN ('admin@fortuna.local', 'customer@fortuna.local');

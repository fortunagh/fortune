-- =============================================================================
-- Fix: public Request Access form cannot INSERT (production)
-- Run in Supabase → SQL Editor, then retry /register submit.
-- =============================================================================

-- 1) Ensure table + workflow columns exist
CREATE TABLE IF NOT EXISTS public.request_access_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  referral_source text NOT NULL,
  phone_country_iso2 text NOT NULL,
  mobile_number text NOT NULL,
  phone_e164 text,
  email text NOT NULL,
  city text NOT NULL,
  timezone text NOT NULL,
  best_contact_times text NOT NULL,
  preferred_contact_method text NOT NULL
    CHECK (preferred_contact_method IN ('whatsapp', 'email', 'zoom', 'text')),
  occupation_or_business text NOT NULL,
  platform_interest text NOT NULL
);

ALTER TABLE public.request_access_submissions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

ALTER TABLE public.request_access_submissions
  ADD COLUMN IF NOT EXISTS admin_notes text;

-- 2) RLS on + public INSERT for anon & authenticated (marketing form)
ALTER TABLE public.request_access_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "request_access_insert_public" ON public.request_access_submissions;
CREATE POLICY "request_access_insert_public"
  ON public.request_access_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 3) Table privileges (RLS alone is not enough without GRANT)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.request_access_submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.request_access_submissions TO authenticated;

-- 4) Smoke test as anon (should return a new id — delete it after)
-- SET ROLE anon;
-- INSERT INTO public.request_access_submissions (
--   first_name, last_name, referral_source, phone_country_iso2, mobile_number,
--   email, city, timezone, best_contact_times, preferred_contact_method,
--   occupation_or_business, platform_interest
-- ) VALUES (
--   'Test', 'User', 'sql-smoke', 'us', '5550100',
--   'smoke@example.com', 'Test City', 'UTC', 'anytime', 'email',
--   'Tester', 'Smoke test — delete me'
-- ) RETURNING id;
-- RESET ROLE;

-- Verify policies:
SELECT polname, polcmd, polroles::regrole[]
FROM pg_policy
WHERE polrelid = 'public.request_access_submissions'::regclass;

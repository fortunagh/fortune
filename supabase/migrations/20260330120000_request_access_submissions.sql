-- Run in Supabase SQL Editor (or via supabase db push) before using the app.
-- Table: public request access form submissions from the marketing site.

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

CREATE INDEX IF NOT EXISTS request_access_submissions_created_at_idx
  ON public.request_access_submissions (created_at DESC);

ALTER TABLE public.request_access_submissions ENABLE ROW LEVEL SECURITY;

-- Public marketing form: insert only (anon + authenticated clients use publishable key)
CREATE POLICY "request_access_insert_public"
  ON public.request_access_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Signed-in dashboard users can read all submissions
CREATE POLICY "request_access_select_authenticated"
  ON public.request_access_submissions
  FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON TABLE public.request_access_submissions IS 'Request access wizard submissions from the Fortuna landing page';

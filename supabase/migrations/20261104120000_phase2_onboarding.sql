-- Phase 2: onboarding workflow, billing, support, notifications, audit

-- ---------------------------------------------------------------------------
-- Extend existing tables
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS activated_at timestamptz;

ALTER TABLE public.request_access_submissions
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS invitation_sent_at timestamptz;

CREATE INDEX IF NOT EXISTS request_access_submissions_user_id_idx
  ON public.request_access_submissions (user_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Invitations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  submission_id uuid REFERENCES public.request_access_submissions (id) ON DELETE SET NULL,
  email text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  invited_by uuid REFERENCES auth.users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS invitations_email_idx ON public.invitations (email);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invitations_admin_all"
  ON public.invitations FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Onboarding case + step defs + states
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.onboarding_step_defs (
  key text PRIMARY KEY,
  sort_order int NOT NULL,
  phase text NOT NULL CHECK (phase IN ('access', 'setup', 'demo', 'live', 'billing')),
  title text NOT NULL,
  eyebrow text,
  description text,
  confirm_label text,
  confirmation_kind text NOT NULL CHECK (confirmation_kind IN ('client', 'stripe', 'dropbox_sign', 'system')),
  prerequisites text[] NOT NULL DEFAULT '{}',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_step_defs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "step_defs_select_auth"
  ON public.onboarding_step_defs FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "step_defs_admin_update"
  ON public.onboarding_step_defs FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "step_defs_admin_insert"
  ON public.onboarding_step_defs FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.onboarding_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  current_step_key text REFERENCES public.onboarding_step_defs (key),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'blocked', 'completed', 'cancelled')),
  demo_timer_started_at timestamptz,
  readiness_unlocked_at timestamptz,
  live_activated_at timestamptz,
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS onboarding_cases_status_idx ON public.onboarding_cases (status);

ALTER TABLE public.onboarding_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cases_select_own_or_admin"
  ON public.onboarding_cases FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "cases_admin_update"
  ON public.onboarding_cases FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "cases_admin_insert"
  ON public.onboarding_cases FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR user_id = auth.uid());

DROP TRIGGER IF EXISTS onboarding_cases_updated_at ON public.onboarding_cases;
CREATE TRIGGER onboarding_cases_updated_at
  BEFORE UPDATE ON public.onboarding_cases
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.onboarding_step_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  case_id uuid NOT NULL REFERENCES public.onboarding_cases (id) ON DELETE CASCADE,
  step_key text NOT NULL REFERENCES public.onboarding_step_defs (key),
  status text NOT NULL DEFAULT 'locked'
    CHECK (status IN ('locked', 'available', 'in_progress', 'awaiting', 'completed', 'skipped')),
  unlocked_at timestamptz,
  completed_at timestamptz,
  confirmation_source text
    CHECK (confirmation_source IS NULL OR confirmation_source IN ('client', 'stripe', 'dropbox_sign', 'admin', 'system')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (case_id, step_key)
);

CREATE INDEX IF NOT EXISTS onboarding_step_states_case_idx ON public.onboarding_step_states (case_id);
CREATE INDEX IF NOT EXISTS onboarding_step_states_key_idx ON public.onboarding_step_states (step_key);

ALTER TABLE public.onboarding_step_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "step_states_select_own_or_admin"
  ON public.onboarding_step_states FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.onboarding_cases c
      WHERE c.id = case_id AND c.user_id = auth.uid()
    )
  );

-- No direct client UPDATE — transitions go through service/API with elevated checks
CREATE POLICY "step_states_admin_write"
  ON public.onboarding_step_states FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS onboarding_step_states_updated_at ON public.onboarding_step_states;
CREATE TRIGGER onboarding_step_states_updated_at
  BEFORE UPDATE ON public.onboarding_step_states
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Questionnaire + brokers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.brokers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  referral_url text,
  secure_portal_url text,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.broker_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id uuid NOT NULL REFERENCES public.brokers (id) ON DELETE CASCADE,
  ea_key text NOT NULL,
  product_label text NOT NULL,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.eligibility_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  broker_id uuid NOT NULL REFERENCES public.brokers (id) ON DELETE CASCADE,
  rule jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true
);

ALTER TABLE public.brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brokers_select_auth" ON public.brokers FOR SELECT TO authenticated USING (true);
CREATE POLICY "brokers_admin" ON public.brokers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "broker_products_select_auth" ON public.broker_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "broker_products_admin" ON public.broker_products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "eligibility_select_auth" ON public.eligibility_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "eligibility_admin" ON public.eligibility_rules FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.questionnaire_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  case_id uuid NOT NULL REFERENCES public.onboarding_cases (id) ON DELETE CASCADE,
  account_opening_method text,
  entity_type text,
  country_of_incorporation text,
  ultimate_beneficial_owner text,
  multiple_ubos boolean,
  ubo_count int,
  tax_residency_country text,
  passport_issuing_country text,
  residency_document_countries text[],
  can_provide_proof_of_address boolean,
  chosen_broker_id uuid REFERENCES public.brokers (id),
  chosen_ea_key text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  review_status text NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'matched', 'needs_review', 'approved'))
);

ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "questionnaire_own_select"
  ON public.questionnaire_responses FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "questionnaire_own_insert"
  ON public.questionnaire_responses FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "questionnaire_own_update"
  ON public.questionnaire_responses FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ---------------------------------------------------------------------------
-- Resources
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  title text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('pdf', 'video', 'link')),
  storage_path text,
  external_url text,
  related_step_keys text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.resource_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES public.resources (id) ON DELETE CASCADE,
  event text NOT NULL CHECK (event IN ('open', 'progress')),
  progress numeric,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS resource_events_user_idx ON public.resource_events (user_id, resource_id);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resources_select_published"
  ON public.resources FOR SELECT TO authenticated
  USING (published = true OR public.is_admin());

CREATE POLICY "resources_admin"
  ON public.resources FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "resource_events_own"
  ON public.resource_events FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "resource_events_insert_own"
  ON public.resource_events FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Support + assistant
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  step_key text,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assignee_id uuid REFERENCES auth.users (id),
  admin_notes text
);

ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "support_own_select"
  ON public.support_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "support_own_insert"
  ON public.support_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "support_admin_update"
  ON public.support_requests FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.assistant_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  step_key text,
  title text
);

CREATE TABLE IF NOT EXISTS public.assistant_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  thread_id uuid NOT NULL REFERENCES public.assistant_threads (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL
);

ALTER TABLE public.assistant_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assistant_threads_own"
  ON public.assistant_threads FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "assistant_messages_own"
  ON public.assistant_messages FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.assistant_threads t
      WHERE t.id = thread_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "assistant_messages_insert_own"
  ON public.assistant_messages FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.assistant_threads t
      WHERE t.id = thread_id AND t.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Notifications + reminders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  href text,
  read_at timestamptz,
  template_key text
);

CREATE TABLE IF NOT EXISTS public.deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('email', 'sms', 'in_app')),
  template_key text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  sent_at timestamptz,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.reminder_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_key text NOT NULL REFERENCES public.onboarding_step_defs (key),
  delay_hours int NOT NULL DEFAULT 48,
  channel text NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'sms', 'in_app')),
  enabled boolean NOT NULL DEFAULT true,
  template_key text NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_own"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "notifications_own_update"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "deliveries_admin"
  ON public.deliveries FOR SELECT TO authenticated
  USING (public.is_admin() OR user_id = auth.uid());

CREATE POLICY "reminder_rules_select"
  ON public.reminder_rules FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "reminder_rules_admin"
  ON public.reminder_rules FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Agreements + payments + webhooks + audit
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'dropbox_sign',
  provider_request_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'signed', 'declined', 'error')),
  signed_at timestamptz,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('onboarding_fee', 'usage_invoice', 'vps')),
  provider text NOT NULL DEFAULT 'stripe',
  provider_id text UNIQUE,
  amount_cents int NOT NULL,
  currency text NOT NULL DEFAULT 'aud',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'issued', 'paid', 'overdue', 'failed', 'cancelled')),
  period_start date,
  period_end date,
  due_at timestamptz,
  lots numeric,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS payments_user_idx ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments (status);

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  provider text NOT NULL,
  event_id text NOT NULL,
  processed_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (provider, event_id)
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  action text NOT NULL,
  from_status text,
  to_status text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS audit_log_entity_idx ON public.audit_log (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_log_created_idx ON public.audit_log (created_at DESC);

ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agreements_own"
  ON public.agreements FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "payments_own"
  ON public.payments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "payments_admin_write"
  ON public.payments FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "webhook_admin"
  ON public.webhook_events FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "audit_admin"
  ON public.audit_log FOR SELECT TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- Seed step definitions
-- ---------------------------------------------------------------------------
INSERT INTO public.onboarding_step_defs
  (key, sort_order, phase, title, eyebrow, description, confirm_label, confirmation_kind, prerequisites)
VALUES
  ('request_access', 1, 'access', 'Request access', 'Access',
   'Your request was approved and your Fortuna account is active.', NULL, 'system', '{}'),
  ('onboarding_payment', 2, 'access', 'Complete onboarding payment', 'Access',
   'Pay the one-time AUD $2,750 onboarding fee to continue setup.', 'Pay onboarding fee', 'stripe', '{request_access}'),
  ('questionnaire', 3, 'setup', 'Complete the onboarding questionnaire', 'Setup',
   'Tell us how you will open the account so we can show approved broker options.', 'Submit questionnaire', 'client', '{onboarding_payment}'),
  ('vps_setup', 4, 'setup', 'Set up your VPS', 'Setup',
   'Sign up via the ForexVPS affiliate link, follow the guide, then confirm your VPS is ready.', 'My VPS is set up', 'client', '{questionnaire}'),
  ('broker_demo', 5, 'setup', 'Open a broker demo account', 'Setup',
   'Open an MT5 demo (USD, 500:1, USD 100,000) with an approved broker.', 'My demo account is open', 'client', '{vps_setup}'),
  ('licence_portal', 6, 'demo', 'Register in the EA licence portal', 'Demo',
   'From inside your VPS browser, create your Fortuna licence portal account.', 'I’ve registered in the licence portal', 'client', '{broker_demo}'),
  ('demo_licence_apply', 7, 'demo', 'Choose an EA and apply for a demo licence', 'Demo',
   'Review the EA comparison guide, apply for a Demo licence, then confirm submission.', 'I’ve submitted my demo EA licence application', 'client', '{licence_portal}'),
  ('demo_licence_approved', 8, 'demo', 'Confirm demo licence approval', 'Demo',
   'Approval can take up to 24 hours. When approved, confirm here.', 'My demo EA licence is approved', 'client', '{demo_licence_apply}'),
  ('user_agreement', 9, 'demo', 'Sign the user agreement', 'Demo',
   'Review and sign your Fortuna user agreement to continue.', 'Sign agreement', 'dropbox_sign', '{demo_licence_approved}'),
  ('demo_install', 10, 'demo', 'Install the EA on your demo account', 'Demo',
   'Follow the installation guide on your VPS. Confirm when the EA is running on demo.', 'EA is running on my demo account', 'client', '{user_agreement}'),
  ('mt5_mobile', 11, 'demo', 'Practise on demo and monitor with MT5 mobile', 'Demo',
   'Use the MT5 mobile app for routine monitoring. Leave MT5 running on the VPS.', 'I’ve set up MT5 mobile', 'client', '{demo_install}'),
  ('demo_readiness', 12, 'demo', 'Complete the demo readiness checklist', 'Demo',
   'Available after 28 days of demo practice. Confirm all seven items to unlock live setup.', 'Confirm and continue', 'client', '{mt5_mobile}'),
  ('live_licence_apply', 13, 'live', 'Open a live MT5 account and apply for a live licence', 'Live',
   'Open a live MT5 account at your broker, then apply for a Live EA licence.', 'I’ve submitted my live EA licence application', 'client', '{demo_readiness}'),
  ('live_install', 14, 'live', 'Install the live EA and configure Equity Protect', 'Live',
   'Confirm live licence approval, install the EA, and configure Equity Protect.', NULL, 'client', '{live_licence_apply}'),
  ('live_activation', 15, 'live', 'Confirm live activation', 'Live',
   'When your live EA is active, confirm here. Usage fees are billed monthly in arrears.', 'My live EA is active', 'client', '{live_install}'),
  ('onboarding_complete', 16, 'billing', 'Onboarding complete', 'Billing',
   'Your Fortuna onboarding is complete.', NULL, 'system', '{live_activation}'),
  ('usage_billing', 17, 'billing', 'Monthly software usage', 'Billing',
   'Invoices for software usage fees are issued after each month ends.', NULL, 'system', '{onboarding_complete}')
ON CONFLICT (key) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  phase = EXCLUDED.phase,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  confirm_label = EXCLUDED.confirm_label,
  confirmation_kind = EXCLUDED.confirmation_kind,
  prerequisites = EXCLUDED.prerequisites;

INSERT INTO public.reminder_rules (step_key, delay_hours, channel, enabled, template_key)
VALUES
  ('onboarding_payment', 48, 'email', true, 'reminder_onboarding_payment'),
  ('questionnaire', 72, 'email', true, 'reminder_questionnaire'),
  ('vps_setup', 72, 'email', true, 'reminder_vps'),
  ('broker_demo', 72, 'email', true, 'reminder_broker_demo'),
  ('demo_licence_approved', 24, 'email', true, 'reminder_demo_licence'),
  ('user_agreement', 48, 'email', true, 'reminder_agreement'),
  ('demo_readiness', 24, 'email', true, 'reminder_readiness')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.onboarding_cases IS 'One onboarding case per client user';
COMMENT ON TABLE public.payments IS 'Onboarding fee, usage invoices, optional VPS charges';

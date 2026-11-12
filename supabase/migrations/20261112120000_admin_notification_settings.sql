-- Admin-configurable notification email list (new request-access alerts, etc.)
CREATE TABLE IF NOT EXISTS public.admin_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users (id)
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_settings_admin_all"
  ON public.admin_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO public.admin_settings (key, value)
VALUES (
  'notification_emails',
  '{"emails":[]}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE public.admin_settings IS
  'Key/value admin config. notification_emails.value.emails = string[]';

-- Paste into Supabase Dashboard → SQL Editor → Run
-- Source: supabase/migrations/20261105140000_profiles_phone_e164.sql

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_e164 text;

CREATE INDEX IF NOT EXISTS profiles_phone_e164_idx
  ON public.profiles (phone_e164)
  WHERE phone_e164 IS NOT NULL;

COMMENT ON COLUMN public.profiles.phone_e164 IS
  'E.164 mobile for SMS reminders and inbound Twilio matching';

UPDATE public.reminder_rules
SET channel = 'sms',
    delay_hours = 1
WHERE step_key = 'onboarding_payment'
  AND template_key = 'reminder_onboarding_payment';

UPDATE public.profiles p
SET phone_e164 = COALESCE(
  NULLIF(TRIM(s.phone_e164), ''),
  NULLIF(TRIM(s.mobile_number), '')
)
FROM public.request_access_submissions s
WHERE s.user_id = p.id
  AND p.phone_e164 IS NULL
  AND (
    NULLIF(TRIM(s.phone_e164), '') IS NOT NULL
    OR NULLIF(TRIM(s.mobile_number), '') IS NOT NULL
  );

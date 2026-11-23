-- Run in Supabase Dashboard → SQL Editor (required for fee badges + durable waive flag).

ALTER TABLE public.onboarding_cases
  ADD COLUMN IF NOT EXISTS requires_onboarding_fee boolean NOT NULL DEFAULT true;

ALTER TABLE public.request_access_submissions
  ADD COLUMN IF NOT EXISTS waive_onboarding_fee boolean NOT NULL DEFAULT false;

-- Backfill cases where payment was already waived via admin override / fee_waived payload
UPDATE public.onboarding_cases c
SET requires_onboarding_fee = false
FROM public.onboarding_step_states s
WHERE s.case_id = c.id
  AND s.step_key = 'onboarding_payment'
  AND s.status = 'completed'
  AND (
    COALESCE((s.payload->>'fee_waived')::boolean, false) = true
    OR COALESCE((s.payload->>'admin_override')::boolean, false) = true
  );

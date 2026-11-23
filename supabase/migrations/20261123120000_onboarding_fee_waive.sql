-- Segregate clients who must pay the onboarding fee vs existing clients (waived).

ALTER TABLE public.onboarding_cases
  ADD COLUMN IF NOT EXISTS requires_onboarding_fee boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.onboarding_cases.requires_onboarding_fee IS
  'false = existing client / fee waived; payment step completed at bootstrap';

ALTER TABLE public.request_access_submissions
  ADD COLUMN IF NOT EXISTS waive_onboarding_fee boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.request_access_submissions.waive_onboarding_fee IS
  'Set by admin on Accept for existing clients who should not pay AUD $2,750';

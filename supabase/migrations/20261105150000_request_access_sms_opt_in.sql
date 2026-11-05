-- Optional SMS program consent captured on request-access / register.
ALTER TABLE public.request_access_submissions
  ADD COLUMN IF NOT EXISTS sms_opt_in boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.request_access_submissions.sms_opt_in IS
  'True when applicant checked SMS opt-in on the public form (unchecked by default).';

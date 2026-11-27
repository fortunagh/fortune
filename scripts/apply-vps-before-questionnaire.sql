-- Prod/SQL editor copy of 20261127120000_vps_before_questionnaire.sql
UPDATE public.onboarding_step_defs SET
  sort_order = 3,
  prerequisites = '{onboarding_payment}',
  description = 'Register with ForexVPS, follow the video guide, then confirm your VPS is ready.'
WHERE key = 'vps_setup';

UPDATE public.onboarding_step_defs SET
  sort_order = 4,
  prerequisites = '{vps_setup}',
  description = 'Tell us about your account structure so we can identify approved broker options.'
WHERE key = 'questionnaire';

UPDATE public.onboarding_step_defs SET
  sort_order = 5,
  prerequisites = '{questionnaire}'
WHERE key = 'broker_demo';

-- Move user_agreement to sort 6 (before licence portal), matching Email/SMS copy pack.
UPDATE public.onboarding_step_defs SET
  sort_order = 6,
  phase = 'setup',
  title = 'Sign the user agreement',
  eyebrow = 'Setup',
  description = 'Review and sign your Fortuna user agreement before licence portal registration.',
  confirm_label = 'Sign agreement',
  confirmation_kind = 'dropbox_sign',
  prerequisites = '{broker_demo}'
WHERE key = 'user_agreement';

UPDATE public.onboarding_step_defs SET
  sort_order = 7,
  prerequisites = '{user_agreement}'
WHERE key = 'licence_portal';

UPDATE public.onboarding_step_defs SET
  sort_order = 8,
  prerequisites = '{licence_portal}'
WHERE key = 'demo_licence_apply';

UPDATE public.onboarding_step_defs SET
  sort_order = 9,
  prerequisites = '{demo_licence_apply}'
WHERE key = 'demo_licence_approved';

UPDATE public.onboarding_step_defs SET
  sort_order = 10,
  prerequisites = '{demo_licence_approved}',
  description = 'Install the EA on your VPS, practise Equity Protect, then confirm the EA is running on demo.',
  confirm_label = 'My EA is running on my demo account'
WHERE key = 'demo_install';

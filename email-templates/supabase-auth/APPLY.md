# Apply Fortuna branding to Supabase Auth emails

Supabase Auth emails (reset password, confirm signup, etc.) are **not** sent by
our Next.js Resend templates. They are edited in the Supabase Dashboard.

## 1. Logo

Templates already point at
`https://fortunaglobalholdings.com/fortuna/logo-header.png`.
Change that host if your production domain differs.

## 2. Paste templates

Supabase → **Authentication** → **Email Templates**

| Dashboard template | File | Subject |
|---|---|---|
| Confirm sign up | `confirm-signup.html` | Confirm your Fortuna email |
| Invite user | `invite-user.html` | You are invited to Fortuna |
| Magic Link | `magic-link.html` | Your Fortuna sign-in link |
| Change Email Address | `change-email.html` | Confirm your new Fortuna email |
| Reset Password | `reset-password.html` | Reset your Fortuna password |
| Reauthentication | `reauthentication.html` | Confirm it is you — Fortuna |

For each: open the template → paste the HTML into the body → set the subject → Save.

Keep Supabase variables like `{{ .ConfirmationURL }}` and `{{ .Token }}` intact.

## 3. Stop “Supabase Auth / noreply@mail.app.supabase.io”

So mail looks like Fortuna (not Supabase):

1. Supabase → **Project Settings** → **Authentication** → **SMTP Settings**
2. Enable custom SMTP
3. Use Resend SMTP (same domain as `RESEND_FROM_EMAIL`):

| Field | Value |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` (SSL) or `587` |
| Username | `resend` |
| Password | your `RESEND_API_KEY` |
| Sender email | e.g. `onboarding@fortunaglobalholdings.com` |
| Sender name | `Fortuna Global Holdings` |

## 4. Redirect URLs

Under **Authentication** → **URL Configuration**, keep:

- Site URL = production site
- Redirect allow list includes `/auth/update-password`, `/auth/confirm`, `/auth/login`

## Note on Fortuna “Accept” emails

Request-access **Accept / Resend invite** already uses our branded Resend template
(`renderAccessApprovedEmail`), not the Supabase Invite template. The Invite
template still matters for Admin → Invite user if that path uses Supabase invite.

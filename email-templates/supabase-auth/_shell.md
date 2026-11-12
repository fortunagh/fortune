# Shared shell notes

All templates below use the same Fortuna card layout as Resend mail:
cream background `#f7f6f2`, gold CTA `#a8842a`, logo from your live site.

**Logo URL:** replace `https://YOUR_PRODUCTION_DOMAIN` with your real site
(e.g. `https://fortunaglobalholdings.com`) before pasting into Supabase.
Localhost logos often break in Gmail.

Supabase variables used:
- `{{ .ConfirmationURL }}` — primary button link
- `{{ .Token }}` — 6-digit OTP when applicable
- `{{ .Email }}` — recipient address
- `{{ .SiteURL }}` — project Site URL

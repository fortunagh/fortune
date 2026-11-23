# Ops notes — fee waive + guides (Nov 2026)

## Mick Jones enquiry

Real pending Request Access (not a bug):

- **Mick Jones** · `goldtradinghero@gmail.com` · dubai · pending since 2026-11-19  
- Leave pending until you Accept/Decline and choose fee waive if existing.

## Apply fee-waive columns (required for admin fee badges)

In Supabase → SQL Editor, run [`scripts/apply-fee-waive-migration.sql`](../scripts/apply-fee-waive-migration.sql).

Until then, Accept still works: the waive flag is stored in auth `user_metadata` and applied at bootstrap.

## Accept existing clients

Admin → Request Access → Accept → check **Existing client — waive AUD $2,750 onboarding fee**.

## Guides

- PDFs live in Supabase Storage bucket `onboarding-guides` (public).
- VPS video is served from the site at `/guides/vps-setup-video.mp4` (file under `public/guides/`). **Deploy this file** with the next release — Storage plan rejected the ~65MB upload.
- Re-seed PDFs: `node scripts/seed-onboarding-resources.mjs`

## Brokers

E2E placeholder broker is **inactive**. Add real brokers in Admin → Content with signup links before clients reach the broker demo step.

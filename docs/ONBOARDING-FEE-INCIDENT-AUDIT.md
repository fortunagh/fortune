# Onboarding fee email incident — audit & actions

**Date:** 2026-11-16  
**Trigger:** Existing client reportedly received a $2,750 onboarding-fee request.

## Root cause

The portal treats **every activated user** as a new client. There is no “existing client / fee waived” flag.

When Admin Accepts Request Access:

1. **Access-approved email** is sent and tells them to complete **onboarding payment**.
2. Their journey starts on step **`onboarding_payment`** (AUD $2,750).
3. A **reminder** (was enabled, SMS, **1 hour** delay) re-notifies anyone still on that step with subject *“Let’s get you set up with Fortuna”* and a link to the payment step.

Production Resend/SMS are live, so these are real messages even if Stripe is in test mode.

## Who was contacted (from `deliveries` / `notifications`)

| Email | What was sent | Channel / status | Notes |
|-------|----------------|------------------|--------|
| **celetiamiller@gmail.com** | Reminder: *Let’s get you set up with Fortuna* | SMS **skipped** (no phone); in-app notification created 2026-11-15 | Stuck on payment → **fee waived** |
| **kim@kimburke.com.au** | Access approved (×2); Reminder SMS **sent** 2026-11-13 | Email sent; SMS sent | Pending Stripe checkouts → **fee waived**, pending payments **cancelled** |
| **kim.burke@avibe.com.au** | Access approved (×2) 2026-11-09 | Email sent | No onboarding case |
| **tarunkumarz211286@gmail.com** | Access approved; payment reminder SMS failed; later paid test fee & progressed | Mixed | Dev/test — left alone |
| admin@fortunaglobalholdings.com / admin@fortuna.local | Reminder SMS skipped | Internal | Still on payment step; reminder now off |
| demo.client@… | — | — | Still on payment; reminder off |

No `next_step_onboarding_payment` email rows were found; the fee ask came mainly via **access-approved copy** (“onboarding payment”) and/or **reminder** + portal payment step.

## Actions taken (2026-11-16)

1. **Disabled** `reminder_rules` for `onboarding_payment` (`enabled: false`).
2. **Waived** unpaid onboarding payment (admin complete, unlock questionnaire, **no** questionnaire email) for:
   - `celetiamiller@gmail.com`
   - `kim@kimburke.com.au`
3. Cancelled their **pending** `onboarding_fee` payment rows.
4. Wrote audit JSON: `docs/audit-onboarding-fee-emails.json`, `docs/rectify-onboarding-fee-incident.json`.

## Still needed (product)

- Add **existing client / fee waived** path before Approving more existing clients.
- Soften **access-approved** email so it does not always say “onboarding payment”.
- Do not re-enable the payment reminder until that path exists.

## Suggested note to Kim

We audited deliveries: her account and celetiamiller@gmail.com were on the new-client payment path; payment reminders are off; those two accounts have had the fee step waived so they are no longer asked to pay $2,750. Existing clients should not pay. A proper fee-exemption for existing clients is the lasting fix.

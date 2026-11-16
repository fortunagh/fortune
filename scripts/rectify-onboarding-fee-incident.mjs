/**
 * Incident response:
 * 1) Disable onboarding_payment reminder
 * 2) Waive unpaid onboarding_payment for affected real clients (no next-step emails)
 * Loads .env.local; prints no secrets.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

/** Real / stakeholder accounts to waive off payment (not internal demo/admin). */
const WAIVE_EMAILS = new Set([
  "celetiamiller@gmail.com",
  "kim@kimburke.com.au",
]);

async function findUserIdByEmail(email) {
  const target = email.toLowerCase();
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return hit.id;
    if (data.users.length < 200) return null;
    page += 1;
    if (page > 30) return null;
  }
}

/** Complete payment step + unlock questionnaire WITHOUT sending next-step email. */
async function waiveOnboardingPayment(userId, email) {
  const { data: caseRow } = await admin
    .from("onboarding_cases")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (!caseRow) return { ok: false, error: "no case" };

  const { data: states } = await admin
    .from("onboarding_step_states")
    .select("*")
    .eq("case_id", caseRow.id);

  const payment = states?.find((s) => s.step_key === "onboarding_payment");
  if (!payment) return { ok: false, error: "no payment state" };
  if (payment.status === "completed") {
    return { ok: true, already: true };
  }

  const now = new Date().toISOString();

  // Pre-claim next-step idempotency so even if something calls enqueue later, it skips
  await admin.from("deliveries").upsert(
    {
      user_id: userId,
      channel: "email",
      template_key: "next_step_questionnaire",
      idempotency_key: `next_step:${caseRow.id}:questionnaire`,
      status: "skipped",
      meta: {
        reason: "incident_waive_onboarding_fee_no_notify",
        waived_for: email,
      },
    },
    { onConflict: "idempotency_key" },
  );

  await admin
    .from("onboarding_step_states")
    .update({
      status: "completed",
      completed_at: now,
      confirmation_source: "admin",
      payload: {
        ...(payment.payload || {}),
        admin_override: true,
        fee_waived: true,
        waive_reason: "existing_or_stakeholder_not_liable_for_onboarding_fee",
      },
    })
    .eq("id", payment.id);

  await admin
    .from("onboarding_step_states")
    .update({
      status: "available",
      unlocked_at: now,
    })
    .eq("case_id", caseRow.id)
    .eq("step_key", "questionnaire");

  await admin
    .from("onboarding_cases")
    .update({ current_step_key: "questionnaire" })
    .eq("id", caseRow.id);

  // Cancel pending onboarding fee payment rows (do not leave open checkouts as "active")
  await admin
    .from("payments")
    .update({
      status: "cancelled",
      meta: {
        cancelled_reason: "onboarding_fee_waived_incident_2026-11-16",
      },
    })
    .eq("user_id", userId)
    .eq("kind", "onboarding_fee")
    .eq("status", "pending");

  await admin.from("audit_log").insert({
    actor_id: null,
    entity_type: "onboarding_step_state",
    entity_id: payment.id,
    action: "admin_force_complete",
    from_status: payment.status,
    to_status: "completed",
    meta: {
      stepKey: "onboarding_payment",
      fee_waived: true,
      email,
      incident: "existing_client_onboarding_fee_emails",
    },
  });

  return { ok: true, case_id: caseRow.id };
}

async function main() {
  console.log("=== Disable onboarding_payment reminder ===");
  const { data: rules, error: rErr } = await admin
    .from("reminder_rules")
    .update({ enabled: false })
    .eq("step_key", "onboarding_payment")
    .select("*");
  if (rErr) {
    console.error("reminder update failed", rErr.message);
    process.exit(1);
  }
  console.log(
    "Updated rules:",
    (rules || []).map((r) => ({
      id: r.id,
      enabled: r.enabled,
      channel: r.channel,
      delay_hours: r.delay_hours,
    })),
  );

  console.log("\n=== Waive unpaid onboarding_payment for affected clients ===");
  const results = [];
  for (const email of WAIVE_EMAILS) {
    const userId = await findUserIdByEmail(email);
    if (!userId) {
      console.log(`SKIP ${email} — user not found`);
      results.push({ email, ok: false, error: "not found" });
      continue;
    }
    const r = await waiveOnboardingPayment(userId, email);
    console.log(`${email}:`, JSON.stringify(r));
    results.push({ email, userId, ...r });
  }

  // Also disable reminders from firing for remaining internal accounts stuck on payment
  // by completing payment for admin/demo ONLY if unpaid — optional hygiene.
  // Leaving demo/admin on payment is OK now that reminder is disabled.

  const out = {
    at: new Date().toISOString(),
    reminder_disabled: true,
    waive_results: results,
  };
  const outPath = path.join(root, "docs", "rectify-onboarding-fee-incident.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`\nWrote ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

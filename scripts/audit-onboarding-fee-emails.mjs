/**
 * Audit who received onboarding-payment / access-approved emails
 * and who is stuck on the payment step. Loads .env.local; prints no secrets.
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

const PAYMENT_TEMPLATES = [
  "next_step_onboarding_payment",
  "reminder_onboarding_payment",
  "access_approved",
];

function emailFromUser(u) {
  return u?.email ?? null;
}

async function emailMap(userIds) {
  const map = {};
  for (const id of userIds) {
    if (!id || map[id]) continue;
    const { data } = await admin.auth.admin.getUserById(id);
    map[id] = {
      email: data.user?.email ?? null,
      meta: data.user?.user_metadata ?? {},
      created_at: data.user?.created_at ?? null,
    };
  }
  return map;
}

async function main() {
  console.log("=== 1. Deliveries (payment-related templates) ===\n");
  const { data: deliveries, error: dErr } = await admin
    .from("deliveries")
    .select("*")
    .in("template_key", PAYMENT_TEMPLATES)
    .order("created_at", { ascending: false });
  if (dErr) {
    console.error("deliveries error", dErr.message);
  }

  // Also catch any template containing onboarding_payment
  const { data: deliveriesExtra } = await admin
    .from("deliveries")
    .select("*")
    .or(
      "template_key.ilike.%onboarding_payment%,template_key.eq.access_approved,template_key.ilike.%payment%",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  const allDel = [...(deliveries ?? []), ...(deliveriesExtra ?? [])];
  const seen = new Set();
  const uniqDel = [];
  for (const d of allDel) {
    if (seen.has(d.id)) continue;
    seen.add(d.id);
    uniqDel.push(d);
  }

  const delUserIds = [...new Set(uniqDel.map((d) => d.user_id).filter(Boolean))];
  const users = await emailMap(delUserIds);

  const byEmail = {};
  for (const d of uniqDel) {
    const email = users[d.user_id]?.email || "(unknown)";
    if (!byEmail[email]) byEmail[email] = [];
    byEmail[email].push({
      template: d.template_key,
      channel: d.channel,
      status: d.status,
      created_at: d.created_at,
      sent_at: d.sent_at,
      meta: d.meta,
    });
  }

  console.log(`Delivery rows: ${uniqDel.length}`);
  console.log(`Unique recipients: ${Object.keys(byEmail).length}\n`);
  for (const [email, rows] of Object.entries(byEmail).sort()) {
    console.log(`--- ${email} ---`);
    for (const r of rows) {
      console.log(
        `  ${r.created_at} | ${r.channel} | ${r.status} | ${r.template}`,
      );
    }
  }

  console.log("\n=== 2. Notifications (payment-related) ===\n");
  const { data: notifs } = await admin
    .from("notifications")
    .select("*")
    .or(
      "template_key.ilike.%onboarding_payment%,template_key.eq.access_approved,title.ilike.%onboarding%,title.ilike.%set your fortuna%,title.ilike.%get you set up%",
    )
    .order("created_at", { ascending: false })
    .limit(300);

  const nUserIds = [...new Set((notifs ?? []).map((n) => n.user_id))];
  const nUsers = await emailMap(nUserIds);
  console.log(`Notification rows: ${(notifs ?? []).length}`);
  for (const n of notifs ?? []) {
    const email = nUsers[n.user_id]?.email || n.user_id;
    console.log(
      `  ${n.created_at} | ${email} | ${n.template_key} | ${n.title}`,
    );
  }

  console.log("\n=== 3. Cases currently on onboarding_payment ===\n");
  const { data: cases } = await admin
    .from("onboarding_cases")
    .select("id,user_id,status,current_step_key,created_at,updated_at")
    .eq("current_step_key", "onboarding_payment")
    .order("created_at", { ascending: false });

  const caseUserIds = [...new Set((cases ?? []).map((c) => c.user_id))];
  const cUsers = await emailMap(caseUserIds);

  const { data: profiles } = await admin
    .from("profiles")
    .select("id,first_name,last_name,role,activated_at")
    .in("id", caseUserIds.length ? caseUserIds : ["00000000-0000-0000-0000-000000000000"]);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  const { data: payments } = await admin
    .from("payments")
    .select("user_id,status,kind,provider_id,amount_cents,created_at")
    .eq("kind", "onboarding_fee")
    .in("user_id", caseUserIds.length ? caseUserIds : ["00000000-0000-0000-0000-000000000000"]);

  const payByUser = {};
  for (const p of payments ?? []) {
    if (!payByUser[p.user_id]) payByUser[p.user_id] = [];
    payByUser[p.user_id].push(p);
  }

  const stuck = [];
  for (const c of cases ?? []) {
    const u = cUsers[c.user_id];
    const p = profileMap[c.user_id];
    const pays = payByUser[c.user_id] ?? [];
    const paid = pays.some((x) => x.status === "paid");
    const row = {
      case_id: c.id,
      user_id: c.user_id,
      email: u?.email,
      name: [p?.first_name, p?.last_name].filter(Boolean).join(" ") || null,
      case_status: c.status,
      case_created: c.created_at,
      activated_at: p?.activated_at,
      payment_statuses: pays.map((x) => x.status).join(",") || "none",
      has_paid: paid,
    };
    stuck.push(row);
    console.log(
      `${row.email} | ${row.name || "-"} | paid=${row.has_paid} | payments=${row.payment_statuses} | case=${row.case_created}`,
    );
  }
  console.log(`\nStuck on payment: ${stuck.length}`);

  console.log("\n=== 4. Reminder rules (onboarding_payment) ===\n");
  const { data: rules } = await admin
    .from("reminder_rules")
    .select("*")
    .eq("step_key", "onboarding_payment");
  console.log(JSON.stringify(rules, null, 2));

  console.log("\n=== 5. All onboarding_fee payments (any status) ===\n");
  const { data: allPays } = await admin
    .from("payments")
    .select("*")
    .eq("kind", "onboarding_fee")
    .order("created_at", { ascending: false })
    .limit(100);
  const payUsers = await emailMap([
    ...new Set((allPays ?? []).map((p) => p.user_id)),
  ]);
  for (const p of allPays ?? []) {
    console.log(
      `${p.created_at} | ${payUsers[p.user_id]?.email} | ${p.status} | ${p.amount_cents} ${p.currency} | ${p.provider_id}`,
    );
  }

  // Write JSON report for follow-up actions
  const report = {
    generated_at: new Date().toISOString(),
    recipients_by_email: byEmail,
    stuck_on_payment: stuck,
    reminder_rules: rules,
    unpaid_stuck: stuck.filter((s) => !s.has_paid),
  };
  const out = path.join(root, "docs", "audit-onboarding-fee-emails.json");
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(`\nWrote ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

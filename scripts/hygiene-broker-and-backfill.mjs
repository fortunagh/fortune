/**
 * Deactivate E2E Test Broker for client UI; backfill fee-waived cases when column exists.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(
  /\r?\n/,
)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const { data: brokers, error: bErr } = await admin
  .from("brokers")
  .update({
    active: false,
    name: "Placeholder broker (inactive)",
  })
  .ilike("name", "%E2E%Test%Broker%")
  .select("id,name,active");

if (bErr) console.error("broker update", bErr.message);
else console.log("Brokers updated:", brokers);

// Backfill requires_onboarding_fee=false where payment was fee_waived
const { data: states } = await admin
  .from("onboarding_step_states")
  .select("case_id, payload")
  .eq("step_key", "onboarding_payment")
  .eq("status", "completed");

const waivedCaseIds = (states ?? [])
  .filter(
    (s) =>
      s.payload?.fee_waived === true || s.payload?.admin_override === true,
  )
  .map((s) => s.case_id);

if (waivedCaseIds.length) {
  const { error, count } = await admin
    .from("onboarding_cases")
    .update({ requires_onboarding_fee: false })
    .in("id", waivedCaseIds);
  if (error) {
    console.warn(
      "fee backfill skipped (run migration if needed):",
      error.message,
    );
  } else {
    console.log("Backfilled fee waived cases:", waivedCaseIds.length, count);
  }
}

const { data: resources } = await admin
  .from("resources")
  .select("title, kind, published, related_step_keys")
  .eq("published", true);
console.log("Published resources:", resources?.length ?? 0);
for (const r of resources ?? []) {
  console.log(` - ${r.kind}: ${r.title}`);
}

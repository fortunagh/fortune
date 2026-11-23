/**
 * Applies onboarding fee waive columns.
 * Prefer: paste SQL in Supabase Dashboard → SQL Editor if DB password missing.
 *
 *   SUPABASE_DB_PASSWORD=... node scripts/apply-fee-waive-migration.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sqlPath = path.join(
  root,
  "supabase/migrations/20261123120000_onboarding_fee_waive.sql",
);
const sql = fs.readFileSync(sqlPath, "utf8");

for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(
  /\r?\n/,
)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const password = process.env.SUPABASE_DB_PASSWORD;

if (!ref || !password) {
  console.log("Missing SUPABASE_DB_PASSWORD — run this SQL in the Dashboard:");
  console.log(sql);
  process.exit(0);
}

const pgMod = await import("pg").catch(() => null);
if (!pgMod) {
  console.log("Install pg (npm i pg) or run SQL in Dashboard.");
  console.log(sql);
  process.exit(0);
}

const client = new pgMod.default.Client({
  host: `db.${ref}.supabase.co`,
  port: 5432,
  database: "postgres",
  user: "postgres",
  password,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(sql);

// Backfill known waived payment steps
await client.query(`
  UPDATE public.onboarding_cases c
  SET requires_onboarding_fee = false
  FROM public.onboarding_step_states s
  WHERE s.case_id = c.id
    AND s.step_key = 'onboarding_payment'
    AND s.status = 'completed'
    AND (
      (s.payload->>'fee_waived')::boolean = true
      OR (s.payload->>'admin_override')::boolean = true
    );
`);

await client.end();
console.log("Fee-waive migration applied (+ backfill).");

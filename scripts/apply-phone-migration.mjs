/**
 * Applies phone_e164 migration via Supabase SQL HTTP (requires database password).
 * Prefer running the SQL in Supabase Dashboard → SQL Editor if this fails.
 *
 * Usage:
 *   SUPABASE_DB_PASSWORD=... node scripts/apply-phone-migration.mjs
 *
 * Or paste supabase/migrations/20261105140000_profiles_phone_e164.sql in the SQL Editor.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sql = fs.readFileSync(
  path.join(root, "supabase/migrations/20261105140000_profiles_phone_e164.sql"),
  "utf8",
);

const envPath = path.join(root, ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const password = process.env.SUPABASE_DB_PASSWORD;

if (!ref || !password) {
  console.log("Missing SUPABASE_DB_PASSWORD or project URL.");
  console.log("Run this SQL in Supabase Dashboard → SQL Editor:");
  console.log("---");
  console.log(sql);
  process.exit(0);
}

const { default: pg } = await import("pg").catch(() => ({ default: null }));
if (!pg) {
  console.log("Install pg or run the SQL manually in the Dashboard.");
  console.log(sql);
  process.exit(0);
}

const client = new pg.Client({
  host: `db.${ref}.supabase.co`,
  port: 5432,
  database: "postgres",
  user: "postgres",
  password,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(sql);
await client.end();
console.log("Migration applied.");

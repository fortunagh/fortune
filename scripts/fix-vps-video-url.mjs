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

const prodUrl =
  "https://www.fortunaglobalholdings.com/guides/vps-setup-video.mp4";

const { data, error } = await admin
  .from("resources")
  .update({
    external_url: prodUrl,
    related_step_keys: ["vps_setup"],
    published: true,
    kind: "video",
  })
  .eq("title", "VPS setup video")
  .select("id,title,external_url");

if (error) {
  console.error(error.message);
  process.exit(1);
}
console.log(data);

const { count } = await admin
  .from("resources")
  .select("*", { count: "exact", head: true })
  .eq("published", true);
console.log("published count", count);

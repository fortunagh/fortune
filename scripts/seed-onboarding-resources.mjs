/**
 * Upload Fortuna PDFs + VPS video to Supabase Storage and seed `resources` rows.
 * Loads .env.local; does not print secrets.
 *
 *   node scripts/seed-onboarding-resources.mjs
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

const BUCKET = "onboarding-guides";
const pdfDir = path.join(root, "context-for-phase-2", "_pdf_list");
const videoPath = path.join(root, "context-for-phase-2", "Final 8.mp4");

const ASSETS = [
  {
    file: path.join(pdfDir, "Fortuna_Complete_Client_Guide.pdf"),
    storagePath: "guides/fortuna-complete-client-guide.pdf",
    title: "Fortuna Complete Client Guide — EA comparison",
    kind: "pdf",
    related: ["demo_licence_apply"],
    contentType: "application/pdf",
  },
  {
    file: path.join(pdfDir, "Fortuna_EA_Registration_and_Setup_Guide.pdf"),
    storagePath: "guides/fortuna-ea-registration-and-setup-guide.pdf",
    title: "Fortuna EA Registration & Setup Guide",
    kind: "pdf",
    related: [
      "licence_portal",
      "demo_licence_apply",
      "demo_install",
      "live_licence_apply",
      "live_install",
    ],
    contentType: "application/pdf",
  },
  {
    file: path.join(pdfDir, "Fortuna_MT5_Mobile_Setup_Guide.pdf"),
    storagePath: "guides/fortuna-mt5-mobile-setup-guide.pdf",
    title: "Fortuna MT5 Mobile Setup Guide",
    kind: "pdf",
    related: ["mt5_mobile"],
    contentType: "application/pdf",
  },
  {
    file: path.join(pdfDir, "Fortuna_Equity_Protect_Guide(1).pdf"),
    storagePath: "guides/fortuna-equity-protect-guide.pdf",
    title: "Fortuna Equity Protect Guide",
    kind: "pdf",
    related: ["live_install"],
    contentType: "application/pdf",
  },
  {
    file: videoPath,
    storagePath: "guides/vps-setup-video.mp4",
    title: "VPS setup video",
    kind: "video",
    related: ["vps_setup"],
    contentType: "video/mp4",
  },
];

async function ensureBucket() {
  const { data: buckets } = await admin.storage.listBuckets();
  const exists = (buckets ?? []).some((b) => b.name === BUCKET);
  if (!exists) {
    const { error } = await admin.storage.createBucket(BUCKET, {
      public: true,
    });
    if (error && !/already exists|duplicate/i.test(error.message)) {
      throw new Error(`createBucket: ${error.message}`);
    }
  }
  // Raise limit so the ~65MB VPS video can upload (project plan permitting).
  const { error: updErr } = await admin.storage.updateBucket(BUCKET, {
    public: true,
    fileSizeLimit: 104857600,
    allowedMimeTypes: ["application/pdf", "video/mp4", "video/quicktime"],
  });
  if (updErr) {
    console.warn("updateBucket (non-fatal):", updErr.message);
  }
  console.log("Bucket ready:", BUCKET);
}

async function uploadOne(asset) {
  if (!fs.existsSync(asset.file)) {
    console.warn("Missing file, skip:", asset.file);
    return null;
  }
  const body = fs.readFileSync(asset.file);
  const { error } = await admin.storage.from(BUCKET).upload(asset.storagePath, body, {
    contentType: asset.contentType,
    upsert: true,
  });
  if (error) throw new Error(`upload ${asset.storagePath}: ${error.message}`);
  const { data } = admin.storage.from(BUCKET).getPublicUrl(asset.storagePath);
  return data.publicUrl;
}

async function main() {
  // Ensure PDF extract exists
  if (!fs.existsSync(pdfDir)) {
    console.error(
      "PDF folder missing. Extract Fortuna_Final_Onboarding_PDFs.zip to context-for-phase-2/_pdf_list first.",
    );
    process.exit(1);
  }

  await ensureBucket();

  for (const asset of ASSETS) {
    try {
      const publicUrl = await uploadOne(asset);
      if (!publicUrl) continue;

      const { data: existing } = await admin
        .from("resources")
        .select("id")
        .eq("title", asset.title)
        .maybeSingle();

      const row = {
        title: asset.title,
        kind: asset.kind,
        storage_path: asset.storagePath,
        external_url: publicUrl,
        related_step_keys: asset.related,
        published: true,
        sort_order: asset.kind === "video" ? 1 : 10,
      };

      if (existing?.id) {
        const { error } = await admin
          .from("resources")
          .update(row)
          .eq("id", existing.id);
        if (error) throw new Error(`update resource: ${error.message}`);
        console.log("Updated resource:", asset.title);
      } else {
        const { error } = await admin.from("resources").insert(row);
        if (error) throw new Error(`insert resource: ${error.message}`);
        console.log("Inserted resource:", asset.title);
      }
    } catch (e) {
      console.error(`FAILED ${asset.title}:`, e.message || e);
      if (asset.kind === "video") {
        console.error(
          "VPS video too large for current Storage plan. Host Final 8.mp4 externally and add via Admin → Content (step: vps_setup), or raise the bucket file size limit in Supabase.",
        );
      }
    }
  }

  const { data: all } = await admin
    .from("resources")
    .select("title, kind, published, related_step_keys")
    .eq("published", true);
  console.log("\nPublished resources:", all?.length ?? 0);
  for (const r of all ?? []) {
    console.log(` - ${r.kind}: ${r.title} → [${(r.related_step_keys || []).join(", ")}]`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

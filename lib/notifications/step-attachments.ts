import type { SupabaseClient } from "@supabase/supabase-js";

import type { EmailAttachment } from "@/lib/integrations/resend";

const GUIDE_BUCKET = "onboarding-guides";
/** Skip large media — Resend total attachment limit; link in body instead. */
const ATTACHABLE_KINDS = new Set(["pdf"]);
const MAX_ATTACHMENTS = 4;
const MAX_BYTES_EACH = 12 * 1024 * 1024;

type ResourceRow = {
  title: string;
  kind: string;
  storage_path: string | null;
  external_url: string | null;
};

function filenameFromResource(r: ResourceRow): string {
  const fromPath = r.storage_path?.split("/").pop();
  if (fromPath && /\.pdf$/i.test(fromPath)) return fromPath;
  const safe = r.title
    .replace(/[^\w\s.-]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return `${safe || "fortuna-guide"}.pdf`;
}

/**
 * Load published PDF guides for a step from Storage (for Resend attachments).
 * Videos / links are returned separately for the email body.
 */
export async function loadStepEmailMaterials(
  admin: SupabaseClient,
  stepKey: string,
): Promise<{
  attachments: EmailAttachment[];
  linkResources: { title: string; url: string; kind: string }[];
}> {
  const { data, error } = await admin
    .from("resources")
    .select("title, kind, storage_path, external_url")
    .eq("published", true)
    .contains("related_step_keys", [stepKey])
    .order("sort_order");

  if (error) {
    console.error("loadStepEmailMaterials", error.message);
    return { attachments: [], linkResources: [] };
  }

  const rows = (data ?? []) as ResourceRow[];
  const attachments: EmailAttachment[] = [];
  const linkResources: { title: string; url: string; kind: string }[] = [];

  for (const r of rows) {
    const url =
      r.external_url ||
      (r.storage_path
        ? admin.storage.from(GUIDE_BUCKET).getPublicUrl(r.storage_path).data
            .publicUrl
        : null);

    if (!ATTACHABLE_KINDS.has(r.kind)) {
      if (url) {
        linkResources.push({ title: r.title, url, kind: r.kind });
      }
      continue;
    }

    if (!r.storage_path || attachments.length >= MAX_ATTACHMENTS) {
      if (url) {
        linkResources.push({ title: r.title, url, kind: r.kind });
      }
      continue;
    }

    try {
      const { data: blob, error: dlErr } = await admin.storage
        .from(GUIDE_BUCKET)
        .download(r.storage_path);
      if (dlErr || !blob) {
        console.warn("attachment download failed", r.storage_path, dlErr?.message);
        if (url) linkResources.push({ title: r.title, url, kind: r.kind });
        continue;
      }
      const buf = Buffer.from(await blob.arrayBuffer());
      if (buf.byteLength === 0 || buf.byteLength > MAX_BYTES_EACH) {
        if (url) linkResources.push({ title: r.title, url, kind: r.kind });
        continue;
      }
      attachments.push({
        filename: filenameFromResource(r),
        content: buf,
        contentType: "application/pdf",
      });
    } catch (e) {
      console.error("attachment load", r.title, e);
      if (url) linkResources.push({ title: r.title, url, kind: r.kind });
    }
  }

  return { attachments, linkResources };
}

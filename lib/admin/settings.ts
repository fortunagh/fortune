import type { SupabaseClient } from "@supabase/supabase-js";

const NOTIFICATION_EMAILS_KEY = "notification_emails";

export async function getNotificationEmails(
  admin: SupabaseClient,
): Promise<string[]> {
  const { data, error } = await admin
    .from("admin_settings")
    .select("value")
    .eq("key", NOTIFICATION_EMAILS_KEY)
    .maybeSingle();

  if (error || !data?.value) return [];
  const emails = (data.value as { emails?: unknown }).emails;
  if (!Array.isArray(emails)) return [];
  return emails
    .filter((e): e is string => typeof e === "string")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function setNotificationEmails(
  admin: SupabaseClient,
  emails: string[],
  updatedBy: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const cleaned = [
    ...new Set(
      emails
        .map((e) => e.trim().toLowerCase())
        .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)),
    ),
  ];

  const { error } = await admin.from("admin_settings").upsert({
    key: NOTIFICATION_EMAILS_KEY,
    value: { emails: cleaned },
    updated_at: new Date().toISOString(),
    updated_by: updatedBy,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

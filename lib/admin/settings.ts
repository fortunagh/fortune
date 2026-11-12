import type { SupabaseClient } from "@supabase/supabase-js";

const NOTIFICATION_EMAILS_KEY = "notification_emails";
const BILLING_DEFAULTS_KEY = "billing_defaults";
const SUPPORT_DEFAULTS_KEY = "support_defaults";

export type BillingDefaults = {
  currency: string;
  ratePerLotUsd: number;
  invoiceDueDays: number;
};

export type SupportDefaults = {
  autoMarkInProgressOnReply: boolean;
  replyEmailEnabled: boolean;
};

const DEFAULT_BILLING: BillingDefaults = {
  currency: "usd",
  ratePerLotUsd: 30,
  invoiceDueDays: 14,
};

const DEFAULT_SUPPORT: SupportDefaults = {
  autoMarkInProgressOnReply: true,
  replyEmailEnabled: true,
};

async function readJsonSetting<T>(
  admin: SupabaseClient,
  key: string,
): Promise<Record<string, unknown> | null> {
  const { data, error } = await admin
    .from("admin_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error || !data?.value || typeof data.value !== "object") return null;
  return data.value as Record<string, unknown>;
}

async function writeJsonSetting(
  admin: SupabaseClient,
  key: string,
  value: Record<string, unknown>,
  updatedBy: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await admin.from("admin_settings").upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
    updated_by: updatedBy,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getNotificationEmails(
  admin: SupabaseClient,
): Promise<string[]> {
  const value = await readJsonSetting(admin, NOTIFICATION_EMAILS_KEY);
  const emails = value?.emails;
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
  return writeJsonSetting(
    admin,
    NOTIFICATION_EMAILS_KEY,
    { emails: cleaned },
    updatedBy,
  );
}

export async function getBillingDefaults(
  admin: SupabaseClient,
): Promise<BillingDefaults> {
  const value = await readJsonSetting(admin, BILLING_DEFAULTS_KEY);
  if (!value) return DEFAULT_BILLING;
  return {
    currency:
      typeof value.currency === "string" && value.currency
        ? value.currency.toLowerCase()
        : DEFAULT_BILLING.currency,
    ratePerLotUsd:
      typeof value.ratePerLotUsd === "number" && value.ratePerLotUsd > 0
        ? value.ratePerLotUsd
        : DEFAULT_BILLING.ratePerLotUsd,
    invoiceDueDays:
      typeof value.invoiceDueDays === "number" && value.invoiceDueDays > 0
        ? Math.floor(value.invoiceDueDays)
        : DEFAULT_BILLING.invoiceDueDays,
  };
}

export async function setBillingDefaults(
  admin: SupabaseClient,
  defaults: BillingDefaults,
  updatedBy: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  return writeJsonSetting(
    admin,
    BILLING_DEFAULTS_KEY,
    {
      currency: defaults.currency.trim().toLowerCase() || "usd",
      ratePerLotUsd: defaults.ratePerLotUsd,
      invoiceDueDays: defaults.invoiceDueDays,
    },
    updatedBy,
  );
}

export async function getSupportDefaults(
  admin: SupabaseClient,
): Promise<SupportDefaults> {
  const value = await readJsonSetting(admin, SUPPORT_DEFAULTS_KEY);
  if (!value) return DEFAULT_SUPPORT;
  return {
    autoMarkInProgressOnReply:
      typeof value.autoMarkInProgressOnReply === "boolean"
        ? value.autoMarkInProgressOnReply
        : DEFAULT_SUPPORT.autoMarkInProgressOnReply,
    replyEmailEnabled:
      typeof value.replyEmailEnabled === "boolean"
        ? value.replyEmailEnabled
        : DEFAULT_SUPPORT.replyEmailEnabled,
  };
}

export async function setSupportDefaults(
  admin: SupabaseClient,
  defaults: SupportDefaults,
  updatedBy: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  return writeJsonSetting(
    admin,
    SUPPORT_DEFAULTS_KEY,
    { ...defaults },
    updatedBy,
  );
}

import type { SupabaseClient } from "@supabase/supabase-js";

type AdminClient = SupabaseClient;

/** Normalize to E.164-ish (+digits) for Twilio matching. */
export function normalizePhoneE164(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) {
    const rest = digits.slice(1).replace(/\D/g, "");
    return rest.length >= 8 ? `+${rest}` : null;
  }
  const only = digits.replace(/\D/g, "");
  return only.length >= 8 ? `+${only}` : null;
}

/**
 * Resolve client mobile: profiles.phone_e164, else linked request_access_submissions.
 */
export async function resolveUserPhone(
  admin: AdminClient,
  userId: string,
): Promise<string | null> {
  const { data: profile } = await admin
    .from("profiles")
    .select("phone_e164")
    .eq("id", userId)
    .maybeSingle();

  const fromProfile = normalizePhoneE164(profile?.phone_e164);
  if (fromProfile) return fromProfile;

  const { data: submission } = await admin
    .from("request_access_submissions")
    .select("phone_e164, mobile_number")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    normalizePhoneE164(submission?.phone_e164) ||
    normalizePhoneE164(submission?.mobile_number)
  );
}

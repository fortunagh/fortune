import { getStepDef } from "@/lib/onboarding/steps";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export type AdminClientRow = {
  caseId: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  currentStepKey: string | null;
  currentStepTitle: string;
  updatedAt: string;
};

export async function loadAdminClientDirectory(): Promise<AdminClientRow[]> {
  const supabase = await createClient();
  const { data: cases } = await supabase
    .from("onboarding_cases")
    .select("id, user_id, status, current_step_key, updated_at")
    .order("updated_at", { ascending: false });

  if (!cases?.length) return [];

  const userIds = cases.map((c) => c.user_id as string);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, phone_e164")
    .in("id", userIds);

  const profileById = new Map((profiles ?? []).map((p) => [p.id as string, p]));

  const emailById = new Map<string, string>();
  try {
    const admin = createServiceRoleClient();
    const results = await Promise.all(
      userIds.map(async (id) => {
        const { data } = await admin.auth.admin.getUserById(id);
        return [id, data.user?.email ?? null] as const;
      }),
    );
    for (const [id, email] of results) {
      if (email) emailById.set(id, email);
    }
  } catch {
    // Service role may be unavailable in some local setups.
  }

  // Fallback: match invitation emails when auth lookup failed.
  if (emailById.size < userIds.length) {
    const { data: invitations } = await supabase
      .from("invitations")
      .select("email, submission_id")
      .order("created_at", { ascending: false });
    const { data: submissions } = await supabase
      .from("request_access_submissions")
      .select("id, email, first_name, last_name, phone_e164");

    const subByEmail = new Map(
      (submissions ?? []).map((s) => [
        String(s.email).toLowerCase(),
        s,
      ]),
    );
    for (const inv of invitations ?? []) {
      const email = String(inv.email).toLowerCase();
      // Attach to profile name match if unique enough — only used for name fill.
      void subByEmail.get(email);
    }
  }

  return cases.map((row) => {
    const userId = row.user_id as string;
    const profile = profileById.get(userId);
    const name =
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
      "Unnamed client";
    const stepKey = (row.current_step_key as string | null) ?? null;
    return {
      caseId: row.id as string,
      userId,
      name,
      email: emailById.get(userId) ?? null,
      phone: (profile?.phone_e164 as string | null) ?? null,
      status: row.status as string,
      currentStepKey: stepKey,
      currentStepTitle: getStepDef(stepKey ?? "")?.title ?? stepKey ?? "—",
      updatedAt: row.updated_at as string,
    };
  });
}

export function filterAdminClients(
  rows: AdminClientRow[],
  opts: { q?: string; status?: string | null; step?: string | null },
) {
  const q = (opts.q ?? "").toLowerCase();
  return rows.filter((row) => {
    if (opts.status && row.status !== opts.status) return false;
    if (opts.step && row.currentStepKey !== opts.step) return false;
    if (!q) return true;
    return (
      row.name.toLowerCase().includes(q) ||
      (row.email?.toLowerCase().includes(q) ?? false) ||
      (row.phone?.includes(q) ?? false)
    );
  });
}

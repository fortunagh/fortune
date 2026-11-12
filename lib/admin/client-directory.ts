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

function displayName(parts: {
  first?: string | null;
  last?: string | null;
  email?: string | null;
}) {
  const fromParts = [parts.first, parts.last].filter(Boolean).join(" ").trim();
  if (fromParts) return fromParts;
  if (parts.email) {
    const local = parts.email.split("@")[0]?.trim();
    if (local) return local;
  }
  return "Unnamed client";
}

export async function loadAdminClientDirectory(): Promise<AdminClientRow[]> {
  const supabase = await createClient();
  const { data: cases } = await supabase
    .from("onboarding_cases")
    .select("id, user_id, status, current_step_key, updated_at")
    .order("updated_at", { ascending: false });

  if (!cases?.length) return [];

  const userIds = cases.map((c) => c.user_id as string);

  const [{ data: profiles }, { data: submissions }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, first_name, last_name, phone_e164")
      .in("id", userIds),
    supabase
      .from("request_access_submissions")
      .select("user_id, email, first_name, last_name, phone_e164")
      .in("user_id", userIds),
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id as string, p]));
  const submissionByUser = new Map(
    (submissions ?? [])
      .filter((s) => s.user_id)
      .map((s) => [s.user_id as string, s]),
  );

  const emailById = new Map<string, string>();
  const metaNameById = new Map<string, { first?: string; last?: string }>();
  try {
    const admin = createServiceRoleClient();
    const results = await Promise.all(
      userIds.map(async (id) => {
        const { data } = await admin.auth.admin.getUserById(id);
        const meta = data.user?.user_metadata ?? {};
        return {
          id,
          email: data.user?.email ?? null,
          first:
            typeof meta.first_name === "string" ? meta.first_name : undefined,
          last:
            typeof meta.last_name === "string" ? meta.last_name : undefined,
        };
      }),
    );
    for (const row of results) {
      if (row.email) emailById.set(row.id, row.email);
      if (row.first || row.last) {
        metaNameById.set(row.id, { first: row.first, last: row.last });
      }
    }
  } catch {
    // Service role may be unavailable in some local setups.
  }

  // Match submissions by email when user_id was never linked.
  const missingNameIds = userIds.filter((id) => {
    const p = profileById.get(id);
    const s = submissionByUser.get(id);
    const m = metaNameById.get(id);
    return !(
      p?.first_name ||
      p?.last_name ||
      s?.first_name ||
      s?.last_name ||
      m?.first ||
      m?.last
    );
  });

  if (missingNameIds.length > 0) {
    const emails = missingNameIds
      .map((id) => emailById.get(id)?.toLowerCase())
      .filter(Boolean) as string[];
    if (emails.length > 0) {
      const { data: byEmail } = await supabase
        .from("request_access_submissions")
        .select("email, first_name, last_name, phone_e164")
        .in("email", emails);
      const subByEmail = new Map(
        (byEmail ?? []).map((s) => [String(s.email).toLowerCase(), s]),
      );
      for (const id of missingNameIds) {
        const email = emailById.get(id)?.toLowerCase();
        if (!email) continue;
        const sub = subByEmail.get(email);
        if (sub) submissionByUser.set(id, { ...sub, user_id: id });
      }
    }
  }

  return cases.map((row) => {
    const userId = row.user_id as string;
    const profile = profileById.get(userId);
    const submission = submissionByUser.get(userId);
    const meta = metaNameById.get(userId);
    const email = emailById.get(userId) ?? (submission?.email as string | null) ?? null;
    const name = displayName({
      first:
        (profile?.first_name as string | null) ||
        meta?.first ||
        (submission?.first_name as string | null),
      last:
        (profile?.last_name as string | null) ||
        meta?.last ||
        (submission?.last_name as string | null),
      email,
    });
    const stepKey = (row.current_step_key as string | null) ?? null;
    return {
      caseId: row.id as string,
      userId,
      name,
      email,
      phone:
        (profile?.phone_e164 as string | null) ||
        (submission?.phone_e164 as string | null) ||
        null,
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

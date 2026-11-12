import { notFound } from "next/navigation";

import { ClientWorkspace } from "@/components/admin/client-workspace";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createClient } from "@/lib/supabase/server";
import { getCaseForUser } from "@/lib/onboarding/case";
import { ONBOARDING_STEPS } from "@/lib/onboarding/steps";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();
  const { caseRow, states } = await getCaseForUser(supabase, userId);
  if (!caseRow) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  let email: string | null = null;
  try {
    const admin = createServiceRoleClient();
    const { data } = await admin.auth.admin.getUserById(userId);
    email = data.user?.email ?? null;
  } catch {
    email = null;
  }

  const [{ data: support }, { data: payments }, { data: auditByEntity }] =
    await Promise.all([
      supabase
        .from("support_requests")
        .select("id, body, status, step_key, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("payments")
        .select(
          "id, kind, amount_cents, currency, status, period_start, period_end, created_at",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(80),
    ]);

  const relatedAudit = (auditByEntity ?? []).filter(
    (a) =>
      (a.meta as { userId?: string } | null)?.userId === userId ||
      states.some((s) => s.id === a.entity_id),
  );

  const name =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    email ||
    "Client";

  return (
    <ClientWorkspace
      userId={userId}
      name={name}
      email={email}
      phone={profile?.phone_e164 ?? null}
      caseStatus={caseRow.status}
      caseId={caseRow.id}
      currentStepKey={caseRow.current_step_key}
      steps={ONBOARDING_STEPS.map((s) => ({ key: s.key, title: s.title }))}
      states={states.map((s) => ({
        step_key: s.step_key,
        status: s.status,
        completed_at: s.completed_at,
      }))}
      support={support ?? []}
      payments={payments ?? []}
      audit={relatedAudit.slice(0, 30).map((a) => ({
        id: a.id,
        action: a.action,
        from_status: a.from_status,
        to_status: a.to_status,
        created_at: a.created_at,
        entity_type: a.entity_type,
      }))}
    />
  );
}

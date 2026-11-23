import { notFound } from "next/navigation";

import { ClientWorkspace } from "@/components/admin/client-workspace";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createClient } from "@/lib/supabase/server";
import {
  demoDaysElapsed,
  getCaseForUser,
} from "@/lib/onboarding/case";
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
  let metaFirst: string | undefined;
  let metaLast: string | undefined;
  try {
    const admin = createServiceRoleClient();
    const { data } = await admin.auth.admin.getUserById(userId);
    email = data.user?.email ?? null;
    const meta = data.user?.user_metadata ?? {};
    metaFirst =
      typeof meta.first_name === "string" ? meta.first_name : undefined;
    metaLast = typeof meta.last_name === "string" ? meta.last_name : undefined;
  } catch {
    email = null;
  }

  const stateIds = states.map((s) => s.id);

  const [
    { data: support },
    { data: payments },
    { data: auditRows },
    { data: submission },
    { data: questionnaire },
  ] = await Promise.all([
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
      .select(
        "id, action, from_status, to_status, created_at, entity_type, entity_id, meta",
      )
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("request_access_submissions")
      .select("first_name, last_name, email, phone_e164")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("questionnaire_responses")
      .select(
        "review_status, account_opening_method, tax_residency_country, passport_issuing_country, can_provide_proof_of_address, created_at",
      )
      .eq("case_id", caseRow.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  let linkedSubmission = submission;
  if (!linkedSubmission && email) {
    const { data: byEmail } = await supabase
      .from("request_access_submissions")
      .select("first_name, last_name, email, phone_e164")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    linkedSubmission = byEmail;
  }

  const relatedAudit = (auditRows ?? [])
    .filter((a) => {
      const meta = a.meta as { userId?: string } | null;
      return (
        meta?.userId === userId ||
        a.entity_id === userId ||
        a.entity_id === caseRow.id ||
        stateIds.includes(a.entity_id)
      );
    })
    .slice(0, 40);

  const name =
    [
      profile?.first_name || metaFirst || linkedSubmission?.first_name,
      profile?.last_name || metaLast || linkedSubmission?.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    email ||
    "Client";

  if (!email && linkedSubmission?.email) {
    email = linkedSubmission.email as string;
  }

  const demoDays = demoDaysElapsed(caseRow.demo_timer_started_at);

  return (
    <ClientWorkspace
      userId={userId}
      name={name}
      email={email}
      phone={
        profile?.phone_e164 ??
        (linkedSubmission?.phone_e164 as string | null) ??
        null
      }
      caseStatus={caseRow.status}
      caseId={caseRow.id}
      currentStepKey={caseRow.current_step_key}
      requiresOnboardingFee={caseRow.requires_onboarding_fee !== false}
      demoTimerStartedAt={caseRow.demo_timer_started_at}
      readinessUnlockedAt={caseRow.readiness_unlocked_at}
      liveActivatedAt={caseRow.live_activated_at}
      demoDays={demoDays}
      steps={ONBOARDING_STEPS.map((s) => ({
        key: s.key,
        title: s.title,
        phase: s.phase,
        sort: s.sort,
      }))}
      states={states.map((s) => ({
        step_key: s.step_key,
        status: s.status,
        completed_at: s.completed_at,
        unlocked_at: s.unlocked_at,
        confirmation_source: s.confirmation_source,
        payload: (s.payload as Record<string, unknown>) ?? {},
      }))}
      support={support ?? []}
      payments={payments ?? []}
      audit={relatedAudit.map((a) => ({
        id: a.id,
        action: a.action,
        from_status: a.from_status,
        to_status: a.to_status,
        created_at: a.created_at,
        entity_type: a.entity_type,
      }))}
      questionnaire={
        questionnaire
          ? {
              review_status: questionnaire.review_status,
              account_opening_method: questionnaire.account_opening_method,
              tax_residency_country: questionnaire.tax_residency_country,
              passport_issuing_country: questionnaire.passport_issuing_country,
              can_provide_proof_of_address:
                questionnaire.can_provide_proof_of_address,
              submitted_at: questionnaire.created_at,
            }
          : null
      }
    />
  );
}

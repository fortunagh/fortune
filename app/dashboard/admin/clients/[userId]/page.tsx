import { notFound } from "next/navigation";

import { AdminStepOverride } from "@/components/admin/admin-step-override";
import { PageHeader, WidgetCard } from "@/components/portal/portal-ui";
import { Badge } from "@/components/ui/badge";
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

  const { data: audit } = await supabase
    .from("audit_log")
    .select("*")
    .eq("meta->>userId", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: auditByEntity } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(40);

  const relatedAudit = (auditByEntity ?? []).filter(
    (a) =>
      (a.meta as { userId?: string } | null)?.userId === userId ||
      states.some((s) => s.id === a.entity_id),
  );

  void audit;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <PageHeader
        title={
          [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
          "Client"
        }
        description={`Case ${caseRow.id.slice(0, 8)}`}
      />
      <Badge
        variant="outline"
        className="rounded-full border-neutral-200 uppercase"
      >
        {caseRow.status}
      </Badge>

      <WidgetCard>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Timeline
        </h3>
        <ul className="space-y-2">
          {ONBOARDING_STEPS.map((step) => {
            const st = states.find((s) => s.step_key === step.key);
            return (
              <li
                key={step.key}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 py-2 text-sm last:border-0"
              >
                <span className="text-neutral-900">{step.title}</span>
                <span className="font-mono text-xs text-neutral-500">
                  {st?.status ?? "—"}
                  {st?.completed_at
                    ? ` · ${new Date(st.completed_at).toLocaleString()}`
                    : ""}
                </span>
              </li>
            );
          })}
        </ul>
      </WidgetCard>

      <WidgetCard>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Admin override
        </h3>
        <AdminStepOverride
          userId={userId}
          steps={ONBOARDING_STEPS.map((s) => s.key)}
        />
      </WidgetCard>

      <WidgetCard>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Recent audit
        </h3>
        <ul className="space-y-2 text-sm text-neutral-500">
          {relatedAudit.length === 0 ? (
            <li>No audit rows yet.</li>
          ) : (
            relatedAudit.slice(0, 15).map((a) => (
              <li key={a.id}>
                {new Date(a.created_at).toLocaleString()} — {a.action}{" "}
                {a.from_status ?? "∅"} → {a.to_status ?? "∅"}
              </li>
            ))
          )}
        </ul>
      </WidgetCard>
    </div>
  );
}

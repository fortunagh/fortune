import { notFound } from "next/navigation";

import { AdminStepOverride } from "@/components/admin/admin-step-override";
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
      <div>
        <h2 className="font-display text-2xl tracking-tight">
          {[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
            "Client"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Case {caseRow.id.slice(0, 8)} ·{" "}
          <Badge variant="outline" className="rounded-none uppercase">
            {caseRow.status}
          </Badge>
        </p>
      </div>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Timeline
        </h3>
        <ul className="space-y-2 border border-border p-4">
          {ONBOARDING_STEPS.map((step) => {
            const st = states.find((s) => s.step_key === step.key);
            return (
              <li
                key={step.key}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2 text-sm last:border-0"
              >
                <span>{step.title}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {st?.status ?? "—"}
                  {st?.completed_at
                    ? ` · ${new Date(st.completed_at).toLocaleString()}`
                    : ""}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Admin override
        </h3>
        <AdminStepOverride userId={userId} steps={ONBOARDING_STEPS.map((s) => s.key)} />
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Recent audit
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
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
      </section>
    </div>
  );
}

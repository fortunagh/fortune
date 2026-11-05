import Link from "next/link";

import { AdminOverviewCharts } from "@/components/admin/admin-overview-charts";
import {
  PageHeader,
  WidgetCard,
  fortunaDisplayClass,
  fortunaUiClass,
} from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";
import { getStepDef, ONBOARDING_STEPS } from "@/lib/onboarding/steps";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const [
    { data: rows },
    { data: cases },
    supportRes,
    { data: recentSubs },
  ] = await Promise.all([
    supabase.from("request_access_submissions").select("status"),
    supabase.from("onboarding_cases").select("status, current_step_key"),
    supabase
      .from("support_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("request_access_submissions")
      .select("id, first_name, last_name, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const total = rows?.length ?? 0;
  const pending =
    rows?.filter(
      (r: { status?: string | null }) => (r.status ?? "pending") === "pending",
    ).length ?? 0;
  const approved =
    rows?.filter(
      (r: { status?: string | null }) => r.status === "approved",
    ).length ?? 0;
  const activeCases =
    cases?.filter((c) => c.status === "active").length ?? 0;
  const completedCases =
    cases?.filter((c) => c.status === "completed").length ?? 0;
  const supportOpen = supportRes.count ?? 0;

  const paidOrBeyond =
    cases?.filter((c) => {
      if (c.status === "completed") return true;
      const key = c.current_step_key;
      if (!key || key === "request_access" || key === "onboarding_payment")
        return false;
      return true;
    }).length ?? 0;

  const funnel = [
    { name: "Requests", value: total },
    { name: "Approved", value: approved },
    { name: "In setup", value: paidOrBeyond },
    { name: "Completed", value: completedCases },
  ];

  const stepCounts = new Map<string, number>();
  for (const c of cases ?? []) {
    if (c.status !== "active" || !c.current_step_key) continue;
    stepCounts.set(
      c.current_step_key,
      (stepCounts.get(c.current_step_key) ?? 0) + 1,
    );
  }

  const byStep = ONBOARDING_STEPS.filter((s) => stepCounts.has(s.key))
    .map((s) => ({
      name: s.title.length > 18 ? `${s.title.slice(0, 16)}…` : s.title,
      fullLabel: s.title,
      value: stepCounts.get(s.key) ?? 0,
    }))
    .slice(0, 8);

  // If no active steps matched filter, still show top keys from map
  if (byStep.length === 0 && stepCounts.size > 0) {
    for (const [key, value] of stepCounts) {
      const def = getStepDef(key);
      byStep.push({
        name: def?.title?.slice(0, 18) ?? key,
        fullLabel: def?.title ?? key,
        value,
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <PageHeader
        title="Overview"
        description="Request access, onboarding pipeline, and support at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total submissions" value={total} />
        <StatCard label="Pending review" value={pending} accent />
        <StatCard label="Active onboarding" value={activeCases} />
        <StatCard label="Open support" value={supportOpen} />
      </div>

      <AdminOverviewCharts funnel={funnel} byStep={byStep} />

      <div className="grid gap-4 lg:grid-cols-2">
        <WidgetCard>
          <p
            className={cn(
              fortunaUiClass,
              "mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500",
            )}
          >
            Recent submissions
          </p>
          <ul className="space-y-3">
            {(recentSubs ?? []).length === 0 ? (
              <li className="text-sm text-neutral-500">No submissions yet.</li>
            ) : (
              (recentSubs ?? []).map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-3 border-b border-black/[0.04] pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-900">
                      {row.first_name} {row.last_name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {new Date(row.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
                    {row.status ?? "pending"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </WidgetCard>

        <WidgetCard>
          <p
            className={cn(
              fortunaUiClass,
              "mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500",
            )}
          >
            Quick actions
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href="/dashboard/admin/request-access">
                Manage submissions
              </Link>
            </Button>
            <Button asChild variant="fortuna" size="sm">
              <Link href="/dashboard/admin/clients">Clients</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href="/dashboard/admin/support">Support queue</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href="/dashboard/admin/invite">Invite user</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href="/dashboard/admin/content">Content</Link>
            </Button>
          </div>
        </WidgetCard>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <WidgetCard>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </p>
      <p
        className={cn(
          fortunaDisplayClass,
          "mt-2 text-3xl tabular-nums",
          accent ? "text-[#a8842a]" : "text-neutral-950",
        )}
      >
        {value}
      </p>
    </WidgetCard>
  );
}

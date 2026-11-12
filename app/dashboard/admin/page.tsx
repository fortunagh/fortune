import Link from "next/link";

import { AdminOverviewCharts } from "@/components/admin/admin-overview-charts";
import { AdminPage } from "@/components/admin/ui/admin-page";
import { AdminStatus } from "@/components/admin/ui/admin-status";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableEmpty,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
  AdminTableShell,
} from "@/components/admin/ui/admin-table";
import { getStepDef, ONBOARDING_STEPS } from "@/lib/onboarding/steps";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const [
    { data: rows },
    { data: cases },
    supportRes,
    { data: recentPending },
    { data: openTickets },
  ] = await Promise.all([
    supabase.from("request_access_submissions").select("status"),
    supabase.from("onboarding_cases").select("status, current_step_key"),
    supabase
      .from("support_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("request_access_submissions")
      .select("id, first_name, last_name, email, status, created_at")
      .or("status.eq.pending,status.is.null")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("support_requests")
      .select("id, user_id, body, status, created_at, step_key")
      .in("status", ["open", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(8),
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

  const ticketUserIds = Array.from(
    new Set((openTickets ?? []).map((t) => t.user_id as string)),
  );
  const { data: ticketProfiles } =
    ticketUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", ticketUserIds)
      : { data: [] };
  const profileById = new Map(
    (ticketProfiles ?? []).map((p) => [p.id as string, p]),
  );

  type AttentionItem = {
    id: string;
    href: string;
    title: string;
    subtitle: string;
    status: string;
    when: string;
  };

  const attention: AttentionItem[] = [
    ...(recentPending ?? []).map((row) => ({
      id: `req-${row.id}`,
      href: "/dashboard/admin/request-access?status=pending",
      title: `${row.first_name} ${row.last_name}`,
      subtitle: row.email as string,
      status: (row.status as string) ?? "pending",
      when: row.created_at as string,
    })),
    ...(openTickets ?? []).map((t) => {
      const p = profileById.get(t.user_id as string);
      const name =
        [p?.first_name, p?.last_name].filter(Boolean).join(" ") ||
        "Support ticket";
      return {
        id: `sup-${t.id}`,
        href: `/dashboard/admin/support?status=${t.status}`,
        title: name,
        subtitle: String(t.body).slice(0, 80),
        status: t.status as string,
        when: t.created_at as string,
      };
    }),
  ]
    .sort((a, b) => +new Date(b.when) - +new Date(a.when))
    .slice(0, 10);

  return (
    <AdminPage
      title="Overview"
      description="Pipeline health and items that need attention."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatLink
          href="/dashboard/admin/request-access"
          label="Total submissions"
          value={total}
        />
        <StatLink
          href="/dashboard/admin/request-access?status=pending"
          label="Pending review"
          value={pending}
          accent
        />
        <StatLink
          href="/dashboard/admin/clients?status=active"
          label="Active onboarding"
          value={activeCases}
        />
        <StatLink
          href="/dashboard/admin/support?status=open"
          label="Open support"
          value={supportOpen}
        />
      </div>

      <AdminOverviewCharts funnel={funnel} byStep={byStep} />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-900">
          Needs attention
        </h2>
        <AdminTableShell>
          <AdminTable>
            <AdminTableHeader>
              <AdminTableRow className="hover:bg-transparent">
                <AdminTableHead>Item</AdminTableHead>
                <AdminTableHead>Status</AdminTableHead>
                <AdminTableHead className="hidden sm:table-cell">
                  When
                </AdminTableHead>
              </AdminTableRow>
            </AdminTableHeader>
            <AdminTableBody>
              {attention.length === 0 ? (
                <AdminTableEmpty colSpan={3}>
                  Nothing waiting right now.
                </AdminTableEmpty>
              ) : (
                attention.map((item) => (
                  <AdminTableRow key={item.id} clickable>
                    <AdminTableCell>
                      <Link href={item.href} className="block">
                        <p className="font-medium text-neutral-950">
                          {item.title}
                        </p>
                        <p className="truncate text-xs text-neutral-500">
                          {item.subtitle}
                        </p>
                      </Link>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminStatus status={item.status} />
                    </AdminTableCell>
                    <AdminTableCell className="hidden whitespace-nowrap text-xs text-neutral-500 sm:table-cell">
                      {new Date(item.when).toLocaleString()}
                    </AdminTableCell>
                  </AdminTableRow>
                ))
              )}
            </AdminTableBody>
          </AdminTable>
        </AdminTableShell>
      </div>
    </AdminPage>
  );
}

function StatLink({
  href,
  label,
  value,
  accent,
}: {
  href: string;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-neutral-200/80 bg-white p-4 transition-colors hover:border-[#c59d3f]/40 hover:bg-[hsl(var(--portal-gold-soft))]/40"
    >
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          accent ? "text-[#a8842a]" : "text-neutral-950",
        )}
      >
        {value}
      </p>
    </Link>
  );
}

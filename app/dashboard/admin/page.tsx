import Link from "next/link";

import {
  PageHeader,
  WidgetCard,
  fortunaDisplayClass,
} from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const [{ data: rows }, { data: cases }, supportRes] = await Promise.all([
    supabase.from("request_access_submissions").select("status"),
    supabase.from("onboarding_cases").select("status"),
    supabase
      .from("support_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
  ]);

  const total = rows?.length ?? 0;
  const pending =
    rows?.filter(
      (r: { status?: string | null }) => (r.status ?? "pending") === "pending",
    ).length ?? 0;
  const activeCases =
    cases?.filter((c) => c.status === "active").length ?? 0;
  const supportOpen = supportRes.count ?? 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <PageHeader
        title="Overview"
        description="Request access and onboarding at a glance."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total submissions" value={total} />
        <StatCard label="Pending review" value={pending} accent />
        <StatCard label="Active onboarding" value={activeCases} />
        <StatCard label="Open support" value={supportOpen} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="rounded-xl">
          <Link href="/dashboard/admin/request-access">Manage submissions</Link>
        </Button>
        <Button asChild variant="fortuna" size="sm">
          <Link href="/dashboard/admin/clients">Clients</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="rounded-xl">
          <Link href="/dashboard/admin/invite">Invite user</Link>
        </Button>
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

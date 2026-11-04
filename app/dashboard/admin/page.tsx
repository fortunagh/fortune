import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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
      <div>
        <h2 className="font-display text-2xl tracking-tight">Overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Request access and onboarding at a glance.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-none border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{total}</p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-primary">
              {pending}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active onboarding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{activeCases}</p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{supportOpen}</p>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="rounded-none">
          <Link href="/dashboard/admin/request-access">Manage submissions</Link>
        </Button>
        <Button asChild variant="fortuna" size="sm">
          <Link href="/dashboard/admin/clients">Clients</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="rounded-none">
          <Link href="/dashboard/admin/invite">Invite user</Link>
        </Button>
      </div>
    </div>
  );
}

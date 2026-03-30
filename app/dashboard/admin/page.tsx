import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("request_access_submissions")
    .select("status");

  const total = rows?.length ?? 0;
  const pending =
    rows?.filter(
      (r: { status?: string | null }) => (r.status ?? "pending") === "pending",
    ).length ?? 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          Overview
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Request access pipeline at a glance.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{total}</p>
          </CardContent>
        </Card>
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-amber-800 dark:text-amber-200">
              {pending}
            </p>
          </CardContent>
        </Card>
        <Card className="border-neutral-200 sm:col-span-2 lg:col-span-1 dark:border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quick actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/admin/request-access">
                Manage submissions
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard/admin/invite">Invite user</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

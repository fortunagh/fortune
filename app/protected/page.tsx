import { redirect } from "next/navigation";

import { RequestAccessRequests } from "@/components/dashboard/request-access-requests";
import { createClient } from "@/lib/supabase/server";
import { InfoIcon } from "lucide-react";
import { Suspense } from "react";

function DashboardFallback() {
  return (
    <div className="flex w-full flex-1 flex-col gap-10 p-1">
      <div className="h-12 animate-pulse rounded-md bg-muted" />
      <div className="h-40 animate-pulse rounded-md bg-muted" />
    </div>
  );
}

async function ProtectedDashboard() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-10">
      <div className="w-full">
        <div className="flex items-center gap-3 rounded-md bg-accent p-3 px-5 text-sm text-foreground">
          <InfoIcon size={16} strokeWidth={2} />
          Dashboard — request access submissions from the Fortuna landing page.
        </div>
      </div>

      <section className="flex w-full flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Request access</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Each row is a completed submission from the public form. Apply the
            SQL migration in Supabase if the table is missing.
          </p>
        </div>
        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">Loading submissions…</p>
          }
        >
          <RequestAccessRequests />
        </Suspense>
      </section>
    </div>
  );
}

export default function ProtectedPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <ProtectedDashboard />
    </Suspense>
  );
}

import { redirect } from "next/navigation";
import { Suspense } from "react";

import { PortalShell } from "@/components/portal/portal-shell";
import { CustomerDashboardSkeleton } from "@/components/portal/portal-skeletons";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { requireRequest } from "@/lib/onboarding/connection";
import { createClient } from "@/lib/supabase/server";
import "@/components/landing/fortuna.css";

async function ClientGate({ children }: { children: React.ReactNode }) {
  await requireRequest();
  const session = await getSessionProfile();
  if (!session?.user) {
    redirect("/auth/login");
  }
  if (session.profile?.role === "admin") {
    redirect("/dashboard/admin");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", session.user.id)
    .maybeSingle();

  return (
    <PortalShell
      userEmail={session.user.email ?? ""}
      firstName={profile?.first_name}
    >
      {children}
    </PortalShell>
  );
}

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<CustomerDashboardSkeleton />}>
      <ClientGate>{children}</ClientGate>
    </Suspense>
  );
}

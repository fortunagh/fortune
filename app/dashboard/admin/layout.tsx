import { AdminBootstrapFallback } from "@/components/admin/admin-bootstrap-fallback";
import { AdminMainSkeleton } from "@/components/admin/admin-skeletons";
import { AdminShell } from "@/components/admin/admin-shell";
import { Toaster } from "@/components/ui/sonner";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { requireRequest } from "@/lib/onboarding/connection";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import "@/components/landing/fortuna.css";

async function AdminGate({ children }: { children: React.ReactNode }) {
  await requireRequest();
  const session = await getSessionProfile();
  if (!session?.user) {
    redirect("/auth/login");
  }
  if (session.profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const [{ count: pendingRequests }, { count: openSupport }] =
    await Promise.all([
      supabase
        .from("request_access_submissions")
        .select("id", { count: "exact", head: true })
        .or("status.eq.pending,status.is.null"),
      supabase
        .from("support_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "open"),
    ]);

  return (
    <AdminShell
      userEmail={session.user.email ?? ""}
      pendingRequests={pendingRequests ?? 0}
      openSupport={openSupport ?? 0}
    >
      <Suspense fallback={<AdminMainSkeleton />}>{children}</Suspense>
      <Toaster position="top-right" richColors closeButton />
    </AdminShell>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh font-[Arial,Helvetica,sans-serif] antialiased">
      <Suspense fallback={<AdminBootstrapFallback />}>
        <AdminGate>{children}</AdminGate>
      </Suspense>
    </div>
  );
}

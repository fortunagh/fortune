import { AdminBootstrapFallback } from "@/components/admin/admin-bootstrap-fallback";
import { AdminMainSkeleton } from "@/components/admin/admin-skeletons";
import { AdminShell } from "@/components/admin/admin-shell";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { requireRequest } from "@/lib/onboarding/connection";
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
  return (
    <AdminShell userEmail={session.user.email ?? ""}>
      <Suspense fallback={<AdminMainSkeleton />}>{children}</Suspense>
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

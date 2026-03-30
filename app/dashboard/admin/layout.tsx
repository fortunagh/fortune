import { AdminShell } from "@/components/admin/admin-shell";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { redirect } from "next/navigation";
import { Suspense } from "react";

function AdminFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
      Loading admin…
    </div>
  );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  const session = await getSessionProfile();
  if (!session?.user) {
    redirect("/auth/login");
  }
  if (session.profile?.role !== "admin") {
    redirect("/dashboard");
  }
  return (
    <AdminShell userEmail={session.user.email ?? ""}>
      <Suspense
        fallback={
          <div className="p-2 text-sm text-muted-foreground">Loading…</div>
        }
      >
        {children}
      </Suspense>
    </AdminShell>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

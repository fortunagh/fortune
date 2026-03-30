import { CustomerDashboardSkeleton } from "@/components/admin/admin-skeletons";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { redirect } from "next/navigation";
import { Suspense } from "react";

function Loading() {
  return <CustomerDashboardSkeleton />;
}

async function DashboardHome() {
  const session = await getSessionProfile();
  if (!session?.user) {
    redirect("/auth/login");
  }
  if (session.profile?.role === "admin") {
    redirect("/dashboard/admin");
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Your account</h1>
      <p className="text-muted-foreground">
        Signed in as{" "}
        <span className="font-medium text-foreground">
          {session.user.email ?? "—"}
        </span>
        .
      </p>
      <p className="text-sm leading-relaxed text-muted-foreground">
        This is the customer area. Admins are redirected to the admin dashboard
        automatically.
      </p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardHome />
    </Suspense>
  );
}

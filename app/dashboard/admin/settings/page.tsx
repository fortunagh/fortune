import { AdminNotificationSettings } from "@/components/admin/admin-notification-settings";
import { AdminPage } from "@/components/admin/ui/admin-page";
import { getNotificationEmails } from "@/lib/admin/settings";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export default async function AdminSettingsPage() {
  let emails: string[] = [];
  try {
    const admin = createServiceRoleClient();
    emails = await getNotificationEmails(admin);
  } catch {
    emails = [];
  }

  return (
    <AdminPage
      title="Settings"
      description="Notification emails for new request-access submissions."
      className="max-w-2xl"
    >
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        If saving fails, run{" "}
        <code className="text-xs">
          scripts/apply-admin-notification-settings.sql
        </code>{" "}
        in Supabase.
      </div>
      <div className="rounded-xl border border-neutral-200/80 bg-white p-4">
        <AdminNotificationSettings initialEmails={emails} />
      </div>
    </AdminPage>
  );
}

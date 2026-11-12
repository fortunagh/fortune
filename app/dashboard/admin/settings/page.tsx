import { AdminSettingsPanel } from "@/components/admin/admin-settings-panel";
import { AdminPage } from "@/components/admin/ui/admin-page";
import {
  getBillingDefaults,
  getNotificationEmails,
  getSupportDefaults,
} from "@/lib/admin/settings";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export default async function AdminSettingsPage() {
  const session = await getSessionProfile();
  let emails: string[] = [];
  let billing = {
    currency: "usd",
    ratePerLotUsd: 30,
    invoiceDueDays: 14,
  };
  let support = {
    autoMarkInProgressOnReply: true,
    replyEmailEnabled: true,
  };
  let loadError: string | null = null;

  try {
    const admin = createServiceRoleClient();
    [emails, billing, support] = await Promise.all([
      getNotificationEmails(admin),
      getBillingDefaults(admin),
      getSupportDefaults(admin),
    ]);
  } catch (e) {
    loadError =
      e instanceof Error
        ? e.message
        : "Could not load settings. Confirm admin_settings exists in Supabase.";
  }

  return (
    <AdminPage
      title="Settings"
      description="Workspace preferences for notifications, billing defaults, and support."
      className="max-w-5xl"
    >
      {loadError ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {loadError} If needed, run{" "}
          <code className="text-xs">
            scripts/apply-admin-notification-settings.sql
          </code>
          .
        </p>
      ) : null}
      <AdminSettingsPanel
        initialEmails={emails}
        initialBilling={billing}
        initialSupport={support}
        adminEmail={session?.user?.email ?? ""}
      />
    </AdminPage>
  );
}

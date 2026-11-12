import { AdminNotificationSettings } from "@/components/admin/admin-notification-settings";
import {
  PageHeader,
  SoftNotice,
  WidgetCard,
} from "@/components/portal/portal-ui";
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
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        description="Notification and admin preferences for the Fortuna portal."
      />
      <SoftNotice>
        Run the admin_settings SQL in Supabase if this page cannot save yet
        (scripts/apply-admin-notification-settings.sql).
      </SoftNotice>
      <WidgetCard>
        <AdminNotificationSettings initialEmails={emails} />
      </WidgetCard>
    </div>
  );
}

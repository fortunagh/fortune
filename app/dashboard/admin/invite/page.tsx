import { InviteUserForm } from "@/components/admin/invite-user-form";
import { PageHeader, WidgetCard } from "@/components/portal/portal-ui";

export default function AdminInvitePage() {
  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <PageHeader
        title="Invite user"
        description="Sends a Supabase invitation email. New users start as customer; promote to admin in SQL if needed."
      />
      <WidgetCard>
        <InviteUserForm />
      </WidgetCard>
    </div>
  );
}

import { InviteUserForm } from "@/components/admin/invite-user-form";

export default function AdminInvitePage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Invite user</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sends a Supabase invitation email. New users start as{" "}
          <span className="font-medium">customer</span>; promote to admin in SQL
          if needed.
        </p>
      </div>
      <InviteUserForm />
    </div>
  );
}

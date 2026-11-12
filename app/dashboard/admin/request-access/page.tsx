import { RequestAccessAdminTable } from "@/components/admin/request-access-admin-table";
import { PageHeader, WidgetCard } from "@/components/portal/portal-ui";
import { createClient } from "@/lib/supabase/server";
import type { RequestAccessSubmissionRow } from "@/lib/types/request-access-submission";

export default async function AdminRequestAccessPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("request_access_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("admin request-access list", error);
    return (
      <p className="text-sm text-destructive">
        Could not load submissions. Run the database migrations and ensure you
        are an admin.
      </p>
    );
  }

  const rows = (data ?? []) as RequestAccessSubmissionRow[];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Request access"
        description="Accept sends a set-password email. Reject declines the application. View opens the full registration."
      />
      <WidgetCard className="overflow-x-auto p-0 sm:p-0">
        <div className="p-4 sm:p-5">
          <RequestAccessAdminTable initialRows={rows} />
        </div>
      </WidgetCard>
    </div>
  );
}

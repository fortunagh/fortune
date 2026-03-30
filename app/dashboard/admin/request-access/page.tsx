import { RequestAccessAdminTable } from "@/components/admin/request-access-admin-table";
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
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Request access</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review leads from the public form. Edit status and notes, or delete
          records.
        </p>
      </div>
      <RequestAccessAdminTable initialRows={rows} />
    </div>
  );
}

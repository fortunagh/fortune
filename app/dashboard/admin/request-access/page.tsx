import { Suspense } from "react";

import { RequestAccessAdminTable } from "@/components/admin/request-access-admin-table";
import { AdminPage } from "@/components/admin/ui/admin-page";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";
import { AdminStatusFilterLinks } from "@/components/admin/ui/admin-filter-link";
import { AdminToolbar } from "@/components/admin/ui/admin-toolbar";
import {
  ADMIN_PAGE_SIZE,
  parseAdminPage,
  parseAdminQuery,
  parseAdminStatus,
} from "@/lib/admin/search-params";
import { createClient } from "@/lib/supabase/server";
import type { RequestAccessSubmissionRow } from "@/lib/types/request-access-submission";

export default async function AdminRequestAccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = parseAdminQuery(sp.q).toLowerCase();
  const status = parseAdminStatus(sp.status, [
    "pending",
    "contacted",
    "approved",
    "declined",
  ]);
  const page = parseAdminPage(sp.page);

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

  const all = (data ?? []) as RequestAccessSubmissionRow[];
  const filtered = all.filter((row) => {
    const rowStatus = (row.status ?? "pending").toLowerCase();
    if (status && rowStatus !== status) return false;
    if (!q) return true;
    const hay = `${row.first_name} ${row.last_name} ${row.email} ${row.phone_e164 ?? ""} ${row.city}`.toLowerCase();
    return hay.includes(q);
  });
  const total = filtered.length;
  const rows = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE,
  );

  return (
    <AdminPage
      title="Request access"
      description="Accept sends a set-password email. Reject declines the application. View opens the full registration."
    >
      <Suspense fallback={null}>
        <AdminToolbar
          searchPlaceholder="Search name, email, city…"
          resultCount={total}
          filters={
            <AdminStatusFilterLinks
              options={[
                { value: "all", label: "All" },
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "declined", label: "Declined" },
              ]}
            />
          }
        />
      </Suspense>

      <RequestAccessAdminTable initialRows={rows} />

      <Suspense fallback={null}>
        <AdminPagination page={page} pageSize={ADMIN_PAGE_SIZE} total={total} />
      </Suspense>
    </AdminPage>
  );
}

import Link from "next/link";
import { Suspense } from "react";

import { AdminPage } from "@/components/admin/ui/admin-page";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableEmpty,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
  AdminTableShell,
} from "@/components/admin/ui/admin-table";
import { AdminToolbar } from "@/components/admin/ui/admin-toolbar";
import { AdminStatusFilterLinks } from "@/components/admin/ui/admin-filter-link";
import {
  ADMIN_PAGE_SIZE,
  parseAdminPage,
  parseAdminQuery,
} from "@/lib/admin/search-params";
import { createClient } from "@/lib/supabase/server";

function humanAction(action: string) {
  return action.replace(/_/g, " ");
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = parseAdminQuery(sp.q).toLowerCase();
  const entity =
    typeof sp.entity === "string" ? sp.entity.toLowerCase() : null;
  const page = parseAdminPage(sp.page);

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  const filtered = (rows ?? []).filter((r) => {
    if (entity && String(r.entity_type).toLowerCase() !== entity) return false;
    if (!q) return true;
    const metaUser =
      ((r.meta as { userId?: string } | null)?.userId ?? "").toLowerCase();
    const hay =
      `${r.action} ${r.entity_type} ${r.entity_id} ${r.from_status ?? ""} ${r.to_status ?? ""} ${metaUser}`.toLowerCase();
    return hay.includes(q);
  });

  const total = filtered.length;
  const pageRows = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE,
  );

  return (
    <AdminPage
      title="Audit"
      description="Status changes and admin overrides."
    >
      <Suspense fallback={null}>
        <AdminToolbar
          searchPlaceholder="Search action, entity, user…"
          resultCount={total}
          filters={
            <AdminStatusFilterLinks
              param="entity"
              options={[
                { value: "all", label: "All" },
                { value: "onboarding_case", label: "Cases" },
                { value: "onboarding_step_state", label: "Steps" },
                { value: "request_access_submission", label: "Requests" },
                { value: "support_request", label: "Support" },
              ]}
            />
          }
        />
      </Suspense>

      <AdminTableShell>
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow className="hover:bg-transparent">
              <AdminTableHead>When</AdminTableHead>
              <AdminTableHead>Action</AdminTableHead>
              <AdminTableHead>Entity</AdminTableHead>
              <AdminTableHead>Change</AdminTableHead>
              <AdminTableHead className="hidden sm:table-cell">
                Client
              </AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {pageRows.length === 0 ? (
              <AdminTableEmpty colSpan={5}>No audit rows.</AdminTableEmpty>
            ) : (
              pageRows.map((r) => {
                const userId = (r.meta as { userId?: string } | null)?.userId;
                return (
                  <AdminTableRow key={r.id}>
                    <AdminTableCell className="whitespace-nowrap text-xs text-neutral-500">
                      {new Date(r.created_at).toLocaleString()}
                    </AdminTableCell>
                    <AdminTableCell className="capitalize">
                      {humanAction(r.action)}
                    </AdminTableCell>
                    <AdminTableCell className="font-mono text-xs text-neutral-600">
                      {r.entity_type}:{String(r.entity_id).slice(0, 8)}
                    </AdminTableCell>
                    <AdminTableCell className="text-xs text-neutral-600">
                      {r.from_status ?? "∅"} → {r.to_status ?? "∅"}
                    </AdminTableCell>
                    <AdminTableCell className="hidden sm:table-cell">
                      {userId ? (
                        <Link
                          href={`/dashboard/admin/clients/${userId}`}
                          className="text-xs font-medium text-[#8a6d1f] hover:underline"
                        >
                          Open client
                        </Link>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })
            )}
          </AdminTableBody>
        </AdminTable>
      </AdminTableShell>

      <Suspense fallback={null}>
        <AdminPagination page={page} pageSize={ADMIN_PAGE_SIZE} total={total} />
      </Suspense>
    </AdminPage>
  );
}

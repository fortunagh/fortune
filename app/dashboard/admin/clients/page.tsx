import Link from "next/link";
import { Suspense } from "react";

import { InviteUserDialog } from "@/components/admin/invite-user-dialog";
import { AdminPage } from "@/components/admin/ui/admin-page";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";
import { AdminStatus } from "@/components/admin/ui/admin-status";
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
import { AdminStatusFilterLinks } from "@/components/admin/ui/admin-filter-link";
import { AdminToolbar } from "@/components/admin/ui/admin-toolbar";
import {
  filterAdminClients,
  loadAdminClientDirectory,
} from "@/lib/admin/client-directory";
import {
  ADMIN_PAGE_SIZE,
  parseAdminPage,
  parseAdminQuery,
  parseAdminStatus,
} from "@/lib/admin/search-params";
import { ONBOARDING_STEPS } from "@/lib/onboarding/steps";
import { ClientsStepFilter } from "@/components/admin/clients-step-filter";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = parseAdminQuery(sp.q);
  const status = parseAdminStatus(sp.status, [
    "active",
    "completed",
    "paused",
    "cancelled",
  ]);
  const step = typeof sp.step === "string" ? sp.step : null;
  const page = parseAdminPage(sp.page);

  const all = await loadAdminClientDirectory();
  const filtered = filterAdminClients(all, { q, status, step });
  const total = filtered.length;
  const slice = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE,
  );

  return (
    <AdminPage
      title="Clients"
      description="Onboarding progress across activated accounts."
      actions={
        <Suspense fallback={null}>
          <InviteUserDialog />
        </Suspense>
      }
    >
      <Suspense fallback={null}>
        <AdminToolbar
          searchPlaceholder="Search name, email, phone…"
          resultCount={total}
          filters={
            <>
              <AdminStatusFilterLinks
                options={[
                  { value: "all", label: "All" },
                  { value: "active", label: "Active" },
                  { value: "completed", label: "Completed" },
                ]}
              />
              <ClientsStepFilter
                steps={ONBOARDING_STEPS.map((s) => ({
                  key: s.key,
                  title: s.title,
                }))}
              />
            </>
          }
        />
      </Suspense>

      <AdminTableShell>
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow className="hover:bg-transparent">
              <AdminTableHead>Client</AdminTableHead>
              <AdminTableHead className="hidden md:table-cell">
                Email
              </AdminTableHead>
              <AdminTableHead>Current step</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead className="hidden sm:table-cell">
                Updated
              </AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {slice.length === 0 ? (
              <AdminTableEmpty colSpan={5}>No clients found.</AdminTableEmpty>
            ) : (
              slice.map((row) => (
                <AdminTableRow key={row.caseId} clickable className="group">
                  <AdminTableCell>
                    <Link
                      href={`/dashboard/admin/clients/${row.userId}`}
                      className="font-medium text-neutral-950 group-hover:text-[#8a6d1f]"
                    >
                      {row.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-neutral-500 md:hidden">
                      {row.email ?? "No email"}
                    </p>
                  </AdminTableCell>
                  <AdminTableCell className="hidden max-w-[220px] truncate text-neutral-600 md:table-cell">
                    {row.email ?? "—"}
                  </AdminTableCell>
                  <AdminTableCell className="max-w-[200px] truncate text-neutral-700">
                    {row.currentStepTitle}
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminStatus status={row.status} />
                  </AdminTableCell>
                  <AdminTableCell className="hidden whitespace-nowrap text-xs text-neutral-500 sm:table-cell">
                    {new Date(row.updatedAt).toLocaleString()}
                  </AdminTableCell>
                </AdminTableRow>
              ))
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

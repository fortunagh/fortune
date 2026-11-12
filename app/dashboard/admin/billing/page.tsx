import { Suspense } from "react";

import { AdminIssueInvoiceForm } from "@/components/admin/admin-issue-invoice-form";
import { AdminPage } from "@/components/admin/ui/admin-page";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";
import { AdminStatus } from "@/components/admin/ui/admin-status";
import { AdminStatusFilterLinks } from "@/components/admin/ui/admin-filter-link";
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
import { AdminEmpty } from "@/components/admin/ui/admin-empty";
import {
  ADMIN_PAGE_SIZE,
  parseAdminPage,
  parseAdminQuery,
  parseAdminStatus,
} from "@/lib/admin/search-params";
import { formatMoney } from "@/lib/billing/usage";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createClient } from "@/lib/supabase/server";

export default async function AdminBillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = parseAdminQuery(sp.q).toLowerCase();
  const status = parseAdminStatus(sp.status);
  const page = parseAdminPage(sp.page);

  const supabase = await createClient();
  const [{ data: payments }, { data: cases }, { data: profiles }] =
    await Promise.all([
      supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300),
      supabase
        .from("onboarding_cases")
        .select("user_id")
        .eq("status", "completed"),
      supabase.from("profiles").select("id, first_name, last_name"),
    ]);

  const profileById = new Map(
    (profiles ?? []).map((p) => [p.id as string, p]),
  );

  const completedIds = Array.from(
    new Set((cases ?? []).map((c) => c.user_id as string)),
  );
  const emailById = new Map<string, string>();
  try {
    const admin = createServiceRoleClient();
    const ids = Array.from(
      new Set([
        ...completedIds,
        ...((payments ?? []).map((p) => p.user_id as string) ?? []),
      ]),
    );
    const emails = await Promise.all(
      ids.map(async (id) => {
        const { data } = await admin.auth.admin.getUserById(id);
        return [id, data.user?.email ?? null] as const;
      }),
    );
    for (const [id, email] of emails) {
      if (email) emailById.set(id, email);
    }
  } catch {
    // optional
  }

  function displayName(userId: string) {
    const p = profileById.get(userId);
    return (
      [p?.first_name, p?.last_name].filter(Boolean).join(" ") ||
      emailById.get(userId) ||
      "Unknown client"
    );
  }

  const clients = completedIds.map((userId) => ({
    userId,
    name: displayName(userId),
    email: emailById.get(userId) ?? null,
  }));

  const enriched = (payments ?? []).map((p) => {
    const userId = p.user_id as string;
    return {
      ...p,
      clientName: displayName(userId),
      clientEmail: emailById.get(userId) ?? null,
    };
  });

  const filtered = enriched.filter((p) => {
    if (status && String(p.status).toLowerCase() !== status) return false;
    if (!q) return true;
    return (
      p.clientName.toLowerCase().includes(q) ||
      (p.clientEmail?.toLowerCase().includes(q) ?? false) ||
      String(p.kind).toLowerCase().includes(q)
    );
  });

  const total = filtered.length;
  const rows = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE,
  );

  return (
    <AdminPage
      title="Billing"
      description="Onboarding fees and monthly usage invoices. Default usage: USD $30 per round-turn lot."
      actions={<AdminIssueInvoiceForm clients={clients} />}
    >
      <Suspense fallback={null}>
        <AdminToolbar
          searchPlaceholder="Search client or kind…"
          resultCount={total}
          filters={
            <AdminStatusFilterLinks
              options={[
                { value: "all", label: "All" },
                { value: "paid", label: "Paid" },
                { value: "pending", label: "Pending" },
                { value: "failed", label: "Failed" },
              ]}
            />
          }
        />
      </Suspense>

      {total === 0 ? (
        <AdminEmpty
          title="No payments yet"
          description="Issued invoices and onboarding fees will show up here."
          action={<AdminIssueInvoiceForm clients={clients} />}
        />
      ) : (
        <>
          <AdminTableShell>
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow className="hover:bg-transparent">
                  <AdminTableHead>Client</AdminTableHead>
                  <AdminTableHead>Kind</AdminTableHead>
                  <AdminTableHead>Amount</AdminTableHead>
                  <AdminTableHead className="hidden sm:table-cell">
                    Period
                  </AdminTableHead>
                  <AdminTableHead>Status</AdminTableHead>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {rows.length === 0 ? (
                  <AdminTableEmpty colSpan={5}>No matches.</AdminTableEmpty>
                ) : (
                  rows.map((p) => (
                    <AdminTableRow key={p.id}>
                      <AdminTableCell>
                        <p className="font-medium">{p.clientName}</p>
                        <p className="text-xs text-neutral-500">
                          {p.clientEmail ?? "—"}
                        </p>
                      </AdminTableCell>
                      <AdminTableCell>{p.kind}</AdminTableCell>
                      <AdminTableCell>
                        {formatMoney(p.amount_cents, p.currency)}
                      </AdminTableCell>
                      <AdminTableCell className="hidden text-xs text-neutral-500 sm:table-cell">
                        {p.period_start && p.period_end
                          ? `${p.period_start} → ${p.period_end}`
                          : "—"}
                      </AdminTableCell>
                      <AdminTableCell>
                        <AdminStatus status={p.status} />
                      </AdminTableCell>
                    </AdminTableRow>
                  ))
                )}
              </AdminTableBody>
            </AdminTable>
          </AdminTableShell>
          <Suspense fallback={null}>
            <AdminPagination
              page={page}
              pageSize={ADMIN_PAGE_SIZE}
              total={total}
            />
          </Suspense>
        </>
      )}
    </AdminPage>
  );
}

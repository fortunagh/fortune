import { Suspense } from "react";

import { SupportQueue } from "@/components/admin/support-queue";
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
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = parseAdminQuery(sp.q).toLowerCase();
  const status = parseAdminStatus(sp.status, [
    "open",
    "in_progress",
    "resolved",
    "closed",
  ]);
  const page = parseAdminPage(sp.page);
  // Default to open + in_progress when no status filter.
  const defaultActive = !status && !sp.status;

  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("support_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  const userIds = Array.from(
    new Set((requests ?? []).map((r) => r.user_id as string)),
  );
  const { data: profiles } =
    userIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", userIds)
      : { data: [] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id as string, p]));
  const emailById = new Map<string, string>();
  try {
    const admin = createServiceRoleClient();
    const emails = await Promise.all(
      userIds.map(async (id) => {
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

  const enriched = (requests ?? []).map((r) => {
    const profile = profileById.get(r.user_id as string);
    const email = emailById.get(r.user_id as string) ?? null;
    const name =
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
      email?.split("@")[0] ||
      "Unknown client";
    return {
      id: r.id as string,
      user_id: r.user_id as string,
      body: r.body as string,
      status: r.status as string,
      step_key: (r.step_key as string | null) ?? null,
      created_at: r.created_at as string,
      admin_notes: (r.admin_notes as string | null) ?? null,
      clientName: name,
      clientEmail: email,
    };
  });

  const filtered = enriched.filter((row) => {
    if (defaultActive) {
      if (row.status !== "open" && row.status !== "in_progress") return false;
    } else if (status && row.status !== status) {
      return false;
    }
    if (!q) return true;
    return (
      row.clientName.toLowerCase().includes(q) ||
      row.body.toLowerCase().includes(q) ||
      (row.clientEmail?.toLowerCase().includes(q) ?? false)
    );
  });

  const total = filtered.length;
  const rows = filtered.slice(
    (page - 1) * ADMIN_PAGE_SIZE,
    page * ADMIN_PAGE_SIZE,
  );

  return (
    <AdminPage
      title="Support"
      description="Client help requests with step context. Open a row to update status."
    >
      <Suspense fallback={null}>
        <AdminToolbar
          searchPlaceholder="Search client or message…"
          resultCount={total}
          filters={
            <AdminStatusFilterLinks
              options={[
                { value: "all", label: "Active" },
                { value: "open", label: "Open" },
                { value: "in_progress", label: "In progress" },
                { value: "resolved", label: "Resolved" },
                { value: "closed", label: "Closed" },
              ]}
            />
          }
        />
      </Suspense>

      <SupportQueue rows={rows} />

      <Suspense fallback={null}>
        <AdminPagination page={page} pageSize={ADMIN_PAGE_SIZE} total={total} />
      </Suspense>
    </AdminPage>
  );
}

import Link from "next/link";

import { PageHeader, WidgetCard } from "@/components/portal/portal-ui";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const { data: cases } = await supabase
    .from("onboarding_cases")
    .select("*")
    .order("updated_at", { ascending: false });

  const userIds = (cases ?? []).map((c) => c.user_id as string);
  const { data: profiles } =
    userIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", userIds)
      : { data: [] };

  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Clients"
        description="Onboarding progress across activated accounts."
      />

      <WidgetCard className="overflow-x-auto p-0 sm:p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50/80 text-[10px] uppercase tracking-[0.14em] text-neutral-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Client</th>
              <th className="px-5 py-3 font-semibold">Current step</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {(cases ?? []).length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-8 text-center text-neutral-500"
                >
                  No onboarding cases yet.
                </td>
              </tr>
            ) : (
              (cases ?? []).map((row) => {
                const p = byId.get(row.user_id);
                const name =
                  [p?.first_name, p?.last_name].filter(Boolean).join(" ") ||
                  row.user_id.slice(0, 8);
                return (
                  <tr key={row.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-5 py-3 font-medium text-neutral-900">
                      {name}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-neutral-600">
                      {row.current_step_key ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        variant="outline"
                        className="rounded-full border-neutral-200 uppercase"
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/dashboard/admin/clients/${row.user_id}`}
                        className="text-xs font-semibold uppercase tracking-[0.12em] text-[#a8842a] hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </WidgetCard>
    </div>
  );
}

import Link from "next/link";

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
      <div>
        <h2 className="font-display text-2xl tracking-tight">Clients</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Onboarding progress across activated accounts.
        </p>
      </div>

      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Client</th>
              <th className="px-4 py-3 font-semibold">Current step</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {(cases ?? []).length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-muted-foreground"
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
                  <tr key={row.id} className="border-b border-border">
                    <td className="px-4 py-3">{name}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {row.current_step_key ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className="rounded-none uppercase"
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/admin/clients/${row.user_id}`}
                        className="text-xs font-semibold uppercase tracking-[0.12em] text-primary hover:underline"
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
      </div>
    </div>
  );
}

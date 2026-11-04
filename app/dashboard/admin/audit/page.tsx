import { PageHeader, WidgetCard } from "@/components/portal/portal-ui";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAuditPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Audit log"
        description="Status changes and admin overrides."
      />
      <WidgetCard className="overflow-x-auto p-0 sm:p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50/80 text-[10px] uppercase tracking-[0.14em] text-neutral-500">
            <tr>
              <th className="px-5 py-3">When</th>
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Entity</th>
              <th className="px-5 py-3">From → To</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-5 py-3 text-xs text-neutral-500">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="px-5 py-3">{r.action}</td>
                <td className="px-5 py-3 font-mono text-xs">
                  {r.entity_type}:{String(r.entity_id).slice(0, 8)}
                </td>
                <td className="px-5 py-3 text-xs">
                  {r.from_status ?? "∅"} → {r.to_status ?? "∅"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </WidgetCard>
    </div>
  );
}

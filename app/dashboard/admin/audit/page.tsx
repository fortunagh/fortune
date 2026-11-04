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
      <div>
        <h2 className="font-display text-2xl tracking-tight">Audit log</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Status changes and admin overrides.
        </p>
      </div>
      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">From → To</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => (
              <tr key={r.id} className="border-b border-border">
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">{r.action}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {r.entity_type}:{String(r.entity_id).slice(0, 8)}
                </td>
                <td className="px-4 py-3 text-xs">
                  {r.from_status ?? "∅"} → {r.to_status ?? "∅"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

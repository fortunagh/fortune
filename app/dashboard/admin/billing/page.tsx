import { AdminIssueInvoiceForm } from "@/components/admin/admin-issue-invoice-form";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/billing/usage";
import { createClient } from "@/lib/supabase/server";

export default async function AdminBillingPage() {
  const supabase = await createClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: cases } = await supabase
    .from("onboarding_cases")
    .select("user_id")
    .eq("status", "completed");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div>
        <h2 className="font-display text-2xl tracking-tight">Billing</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Onboarding fees and monthly usage invoices. Default usage rule: USD
          $30 per round-turn lot.
        </p>
      </div>

      <AdminIssueInvoiceForm
        userIds={(cases ?? []).map((c) => c.user_id as string)}
      />

      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Kind</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(payments ?? []).map((p) => (
              <tr key={p.id} className="border-b border-border">
                <td className="px-4 py-3">{p.kind}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {String(p.user_id).slice(0, 8)}
                </td>
                <td className="px-4 py-3">
                  {formatMoney(p.amount_cents, p.currency)}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {p.period_start && p.period_end
                    ? `${p.period_start} → ${p.period_end}`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="rounded-none uppercase">
                    {p.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

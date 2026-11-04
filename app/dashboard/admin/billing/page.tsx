import { AdminIssueInvoiceForm } from "@/components/admin/admin-issue-invoice-form";
import { PageHeader, WidgetCard } from "@/components/portal/portal-ui";
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
      <PageHeader
        title="Billing"
        description="Onboarding fees and monthly usage invoices. Default usage rule: USD $30 per round-turn lot."
      />

      <WidgetCard>
        <AdminIssueInvoiceForm
          userIds={(cases ?? []).map((c) => c.user_id as string)}
        />
      </WidgetCard>

      <WidgetCard className="overflow-x-auto p-0 sm:p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50/80 text-[10px] uppercase tracking-[0.14em] text-neutral-500">
            <tr>
              <th className="px-5 py-3">Kind</th>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Period</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(payments ?? []).map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-5 py-3">{p.kind}</td>
                <td className="px-5 py-3 font-mono text-xs">
                  {String(p.user_id).slice(0, 8)}
                </td>
                <td className="px-5 py-3">
                  {formatMoney(p.amount_cents, p.currency)}
                </td>
                <td className="px-5 py-3 text-xs text-neutral-500">
                  {p.period_start && p.period_end
                    ? `${p.period_start} → ${p.period_end}`
                    : "—"}
                </td>
                <td className="px-5 py-3">
                  <Badge
                    variant="outline"
                    className="rounded-full border-neutral-200 uppercase"
                  >
                    {p.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </WidgetCard>
    </div>
  );
}

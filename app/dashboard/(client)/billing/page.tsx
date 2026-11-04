import {
  PageHeader,
  PortalMuted,
  SoftNotice,
  WidgetCard,
} from "@/components/portal/portal-ui";
import { Badge } from "@/components/ui/badge";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { formatMoney } from "@/lib/billing/usage";
import { createClient } from "@/lib/supabase/server";

export default async function BillingPage() {
  const session = await getSessionProfile();
  if (!session?.user) return null;

  const supabase = await createClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Invoices"
        description="Onboarding fees and monthly usage invoices."
      />

      <SoftNotice>
        Software usage fees are billed monthly in arrears. After each month ends,
        Fortuna will issue an invoice for that month’s software usage fees.
      </SoftNotice>

      {(payments?.length ?? 0) === 0 ? (
        <WidgetCard className="text-center">
          <p className="text-base font-semibold text-neutral-950">
            No invoices yet
          </p>
          <PortalMuted className="mt-2">
            Onboarding fees and monthly usage invoices will appear here.
          </PortalMuted>
        </WidgetCard>
      ) : (
        <ul className="space-y-3">
          {(payments ?? []).map((p) => (
            <li key={p.id}>
              <WidgetCard className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold capitalize text-neutral-950">
                    {p.kind.replace(/_/g, " ")}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {formatMoney(p.amount_cents, p.currency)}
                    {p.period_start && p.period_end
                      ? ` · ${p.period_start} → ${p.period_end}`
                      : null}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="rounded-full border-neutral-200 uppercase"
                >
                  {p.status}
                </Badge>
              </WidgetCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

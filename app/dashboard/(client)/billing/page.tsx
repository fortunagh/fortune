import {
  BronzeRule,
  Eyebrow,
  NoticeBlock,
  PortalCard,
  PortalEmpty,
  PortalTitle,
} from "@/components/portal/portal-primitives";
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
      <div>
        <Eyebrow>Billing</Eyebrow>
        <PortalTitle className="mt-2">Invoices</PortalTitle>
        <BronzeRule className="mt-4" />
      </div>

      <NoticeBlock>
        Software usage fees are billed monthly in arrears. After each month ends,
        Fortuna will issue an invoice for that month’s software usage fees.
      </NoticeBlock>

      {(payments?.length ?? 0) === 0 ? (
        <PortalEmpty
          title="No invoices yet"
          description="Onboarding fees and monthly usage invoices will appear here."
        />
      ) : (
        <ul className="space-y-3">
          {(payments ?? []).map((p) => (
            <li key={p.id}>
              <PortalCard className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-[Arial,Helvetica,sans-serif] text-sm font-semibold uppercase tracking-[0.08em]">
                    {p.kind.replace(/_/g, " ")}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatMoney(p.amount_cents, p.currency)}
                    {p.period_start && p.period_end
                      ? ` · ${p.period_start} → ${p.period_end}`
                      : null}
                  </p>
                </div>
                <Badge variant="outline" className="rounded-none uppercase">
                  {p.status}
                </Badge>
              </PortalCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

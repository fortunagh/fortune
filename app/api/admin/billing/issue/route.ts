import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { formatMoney, usageAmountCentsFromLots } from "@/lib/billing/usage";
import { createUsageInvoice } from "@/lib/integrations/stripe";
import { sendInvoiceEmail } from "@/lib/notifications/enqueue";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const bodySchema = z.object({
  userId: z.string().uuid(),
  lots: z.number().nonnegative().optional(),
  amountCents: z.number().int().positive().optional(),
  currency: z.string().default("usd"),
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await getSessionProfile();
  if (!session?.user || session.profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const amountCents =
    parsed.data.amountCents ??
    usageAmountCentsFromLots(parsed.data.lots ?? 0);

  if (amountCents <= 0) {
    return NextResponse.json(
      { error: "Provide lots or amountCents" },
      { status: 400 },
    );
  }

  const admin = createServiceRoleClient();
  const { data: userData } = await admin.auth.admin.getUserById(
    parsed.data.userId,
  );
  const email = userData.user?.email;
  if (!email) {
    return NextResponse.json({ error: "User email not found" }, { status: 404 });
  }

  const billingMonth = new Date(parsed.data.periodStart).toLocaleString(
    undefined,
    { month: "long", year: "numeric" },
  );

  const stripeInvoice = await createUsageInvoice({
    customerEmail: email,
    userId: parsed.data.userId,
    amountCents,
    currency: parsed.data.currency,
    description: `Fortuna software usage — ${billingMonth}`,
    periodStart: parsed.data.periodStart,
    periodEnd: parsed.data.periodEnd,
  });

  const providerId =
    stripeInvoice.invoiceId ??
    `manual:${parsed.data.userId}:${parsed.data.periodStart}`;

  const { data: payment, error } = await admin
    .from("payments")
    .insert({
      user_id: parsed.data.userId,
      kind: "usage_invoice",
      provider: stripeInvoice.invoiceId ? "stripe" : "manual",
      provider_id: providerId,
      amount_cents: amountCents,
      currency: parsed.data.currency,
      status: "issued",
      period_start: parsed.data.periodStart,
      period_end: parsed.data.periodEnd,
      lots: parsed.data.lots ?? null,
      due_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      meta: {
        hosted_invoice_url: stripeInvoice.hostedUrl,
        stripe_error: stripeInvoice.error ?? null,
      },
    })
    .select("*")
    .single();

  if (error || !payment) {
    return NextResponse.json(
      { error: error?.message ?? "Could not save payment" },
      { status: 500 },
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  await sendInvoiceEmail(admin, {
    userId: parsed.data.userId,
    paymentId: payment.id,
    billingMonth,
    periodStart: parsed.data.periodStart,
    periodEnd: parsed.data.periodEnd,
    invoiceNumber: providerId,
    amount: formatMoney(amountCents, parsed.data.currency),
    currency: parsed.data.currency.toUpperCase(),
    dueDate: payment.due_at
      ? new Date(payment.due_at).toLocaleDateString()
      : "—",
    invoiceUrl:
      stripeInvoice.hostedUrl || `${origin}/dashboard/billing`,
  });

  await admin.from("audit_log").insert({
    actor_id: session.user.id,
    entity_type: "payment",
    entity_id: payment.id,
    action: "issue_usage_invoice",
    to_status: "issued",
    meta: { userId: parsed.data.userId },
  });

  return NextResponse.json({
    ok: true,
    payment,
    warning: stripeInvoice.error,
  });
}

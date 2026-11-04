import Stripe from "stripe";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export const ONBOARDING_FEE_AMOUNT_CENTS = 275_000; // AUD 2,750.00
export const ONBOARDING_FEE_CURRENCY = "aud";

/** Usage fee config — USD $30 per round-turn lot (from client guide). */
export const USAGE_FEE_PER_LOT_USD_CENTS = 3000;

export async function createOnboardingCheckoutSession(options: {
  userId: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string | null; sessionId: string | null; error?: string }> {
  const stripe = getStripe();
  if (!stripe) {
    return {
      url: null,
      sessionId: null,
      error: "STRIPE_SECRET_KEY is not configured",
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: options.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: ONBOARDING_FEE_CURRENCY,
          unit_amount: ONBOARDING_FEE_AMOUNT_CENTS,
          product_data: {
            name: "Fortuna onboarding fee",
            description: "One-time onboarding fee (AUD $2,750)",
          },
        },
      },
    ],
    metadata: {
      user_id: options.userId,
      kind: "onboarding_fee",
    },
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
  });

  return { url: session.url, sessionId: session.id };
}

export async function createUsageInvoice(options: {
  customerEmail: string;
  userId: string;
  amountCents: number;
  currency: string;
  description: string;
  periodStart: string;
  periodEnd: string;
}): Promise<{ invoiceId: string | null; hostedUrl: string | null; error?: string }> {
  const stripe = getStripe();
  if (!stripe) {
    return {
      invoiceId: null,
      hostedUrl: null,
      error: "STRIPE_SECRET_KEY is not configured",
    };
  }

  const customers = await stripe.customers.list({
    email: options.customerEmail,
    limit: 1,
  });
  const customer =
    customers.data[0] ??
    (await stripe.customers.create({
      email: options.customerEmail,
      metadata: { user_id: options.userId },
    }));

  await stripe.invoiceItems.create({
    customer: customer.id,
    amount: options.amountCents,
    currency: options.currency.toLowerCase(),
    description: options.description,
  });

  const invoice = await stripe.invoices.create({
    customer: customer.id,
    collection_method: "send_invoice",
    days_until_due: 14,
    metadata: {
      user_id: options.userId,
      kind: "usage_invoice",
      period_start: options.periodStart,
      period_end: options.periodEnd,
    },
  });

  const finalized = await stripe.invoices.finalizeInvoice(invoice.id);
  await stripe.invoices.sendInvoice(finalized.id);

  return {
    invoiceId: finalized.id,
    hostedUrl: finalized.hosted_invoice_url ?? null,
  };
}

export function constructStripeEvent(
  body: string | Buffer,
  signature: string,
): Stripe.Event {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    throw new Error("Stripe webhook not configured");
  }
  return stripe.webhooks.constructEvent(body, signature, secret);
}

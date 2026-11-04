import { NextResponse } from "next/server";

import { constructStripeEvent } from "@/lib/integrations/stripe";
import { completeStep } from "@/lib/onboarding/transition";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();
  let event;
  try {
    event = constructStripeEvent(body, signature);
  } catch (e) {
    console.error("stripe webhook verify", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let admin;
  try {
    admin = createServiceRoleClient();
  } catch {
    return NextResponse.json({ error: "Misconfigured" }, { status: 500 });
  }

  const { error: dupErr } = await admin.from("webhook_events").insert({
    provider: "stripe",
    event_id: event.id,
    payload: event as unknown as Record<string, unknown>,
    processed_at: new Date().toISOString(),
  });

  if (dupErr) {
    // unique violation → already processed
    return NextResponse.json({ ok: true, deduped: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      id: string;
      metadata?: { user_id?: string; kind?: string };
      payment_status?: string;
    };
    const userId = session.metadata?.user_id;
    if (userId && session.metadata?.kind === "onboarding_fee") {
      await admin
        .from("payments")
        .update({ status: "paid" })
        .eq("provider_id", session.id);

      await completeStep({
        admin,
        userId,
        stepKey: "onboarding_payment",
        source: "stripe",
        actorId: null,
        payload: { checkout_session_id: session.id },
      });
    }
  }

  if (
    event.type === "invoice.paid" ||
    event.type === "invoice.payment_failed" ||
    event.type === "invoice.finalized"
  ) {
    const invoice = event.data.object as {
      id: string;
      status?: string | null;
      hosted_invoice_url?: string | null;
    };
    const status =
      event.type === "invoice.paid"
        ? "paid"
        : event.type === "invoice.payment_failed"
          ? "overdue"
          : "issued";
    await admin
      .from("payments")
      .update({
        status,
        meta: { hosted_invoice_url: invoice.hosted_invoice_url ?? null },
      })
      .eq("provider_id", invoice.id);
  }

  return NextResponse.json({ ok: true });
}

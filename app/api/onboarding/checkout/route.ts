import { NextResponse } from "next/server";

import { getSessionProfile } from "@/lib/auth/get-session-profile";
import {
  createOnboardingCheckoutSession,
  ONBOARDING_FEE_AMOUNT_CENTS,
  ONBOARDING_FEE_CURRENCY,
} from "@/lib/integrations/stripe";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(request: Request) {
  const session = await getSessionProfile();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    request.headers.get("origin") ||
    "http://localhost:3000";

  const checkout = await createOnboardingCheckoutSession({
    userId: session.user.id,
    email: session.user.email,
    successUrl: `${origin}/dashboard/steps/onboarding_payment?paid=1`,
    cancelUrl: `${origin}/dashboard/steps/onboarding_payment?cancelled=1`,
  });

  if (!checkout.sessionId || checkout.error) {
    return NextResponse.json(
      { error: checkout.error ?? "Could not create checkout" },
      { status: 500 },
    );
  }

  try {
    const admin = createServiceRoleClient();
    await admin.from("payments").upsert(
      {
        user_id: session.user.id,
        kind: "onboarding_fee",
        provider: "stripe",
        provider_id: checkout.sessionId,
        amount_cents: ONBOARDING_FEE_AMOUNT_CENTS,
        currency: ONBOARDING_FEE_CURRENCY,
        status: "pending",
      },
      { onConflict: "provider_id" },
    );
  } catch (e) {
    console.error("payment record", e);
  }

  return NextResponse.json({ url: checkout.url, sessionId: checkout.sessionId });
}

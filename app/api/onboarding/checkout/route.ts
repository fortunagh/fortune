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

  const origin = resolveCheckoutOrigin(request);

  const checkout = await createOnboardingCheckoutSession({
    userId: session.user.id,
    email: session.user.email,
    successUrl: `${origin}/dashboard?paid=1`,
    cancelUrl: `${origin}/dashboard?cancelled=1`,
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

function resolveCheckoutOrigin(request: Request): string {
  const headerOrigin = request.headers.get("origin");
  if (headerOrigin) return headerOrigin.replace(/\/$/, "");

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost.split(",")[0].trim()}`.replace(
      /\/$/,
      "",
    );
  }

  const host = request.headers.get("host");
  if (host) {
    const proto = host.includes("localhost") ? "http" : "https";
    return `${proto}://${host}`.replace(/\/$/, "");
  }

  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

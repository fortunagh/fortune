import { NextResponse } from "next/server";

import { completeStep } from "@/lib/onboarding/transition";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  let payload: Record<string, unknown> = {};

  try {
    if (contentType.includes("application/json")) {
      payload = (await request.json()) as Record<string, unknown>;
    } else {
      const form = await request.formData();
      const raw = form.get("json");
      if (typeof raw === "string") {
        payload = JSON.parse(raw) as Record<string, unknown>;
      }
    }
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const event = (payload.event as Record<string, unknown> | undefined) ?? payload;
  const eventType =
    (event.event_type as string | undefined) ||
    (payload.event_type as string | undefined) ||
    "";
  const eventHash =
    (event.event_hash as string | undefined) ||
    (payload.event_hash as string | undefined) ||
    `${eventType}-${Date.now()}`;

  let admin;
  try {
    admin = createServiceRoleClient();
  } catch {
    return NextResponse.json({ error: "Misconfigured" }, { status: 500 });
  }

  const { error: dupErr } = await admin.from("webhook_events").insert({
    provider: "dropbox_sign",
    event_id: eventHash,
    payload,
    processed_at: new Date().toISOString(),
  });
  if (dupErr) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  if (eventType === "signature_request_all_signed" || eventType === "signature_request_signed") {
    const sr =
      (payload.signature_request as Record<string, unknown> | undefined) ||
      (event.signature_request as Record<string, unknown> | undefined);
    const requestId = (sr?.signature_request_id as string | undefined) ?? null;
    const metadata = (sr?.metadata as Record<string, string> | undefined) ?? {};
    let userId = metadata.user_id;

    if (requestId) {
      const { data: agreement } = await admin
        .from("agreements")
        .select("*")
        .eq("provider_request_id", requestId)
        .maybeSingle();

      if (agreement) {
        userId = agreement.user_id;
        await admin
          .from("agreements")
          .update({
            status: "signed",
            signed_at: new Date().toISOString(),
          })
          .eq("id", agreement.id);
      }
    }

    if (userId) {
      await completeStep({
        admin,
        userId,
        stepKey: "user_agreement",
        source: "dropbox_sign",
        actorId: null,
        payload: { signature_request_id: requestId },
      });
    }
  }

  // Dropbox Sign expects "Hello API Event Received"
  return new NextResponse("Hello API Event Received", { status: 200 });
}

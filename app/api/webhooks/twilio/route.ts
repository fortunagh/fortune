import { NextResponse } from "next/server";

import { validateTwilioSignature } from "@/lib/integrations/twilio";
import { normalizePhoneE164 } from "@/lib/onboarding/phone";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(request: Request) {
  const form = await request.formData();
  const params: Record<string, string> = {};
  form.forEach((value, key) => {
    params[key] = String(value);
  });

  const signature = request.headers.get("x-twilio-signature");
  const url = process.env.TWILIO_WEBHOOK_URL || request.url;
  const valid = validateTwilioSignature(signature, url, params);

  // Allow local tunnels with mismatched public URL only when explicitly disabled
  if (!valid && process.env.TWILIO_SKIP_SIGNATURE !== "true") {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  const from = normalizePhoneE164(params.From);
  const body = (params.Body || "").trim();

  if (!from || !body) {
    return twimlOk();
  }

  let admin;
  try {
    admin = createServiceRoleClient();
  } catch {
    return twimlOk();
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("phone_e164", from)
    .maybeSingle();

  let userId = profile?.id as string | undefined;

  if (!userId) {
    const { data: sub } = await admin
      .from("request_access_submissions")
      .select("user_id, phone_e164")
      .eq("phone_e164", from)
      .not("user_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    userId = sub?.user_id ?? undefined;
  }

  if (!userId) {
    console.warn("twilio inbound: no user for", from);
    return twimlOk();
  }

  let stepKey: string | null = null;
  const { data: caseRow } = await admin
    .from("onboarding_cases")
    .select("current_step_key")
    .eq("user_id", userId)
    .maybeSingle();
  stepKey = caseRow?.current_step_key ?? null;

  await admin.from("support_requests").insert({
    user_id: userId,
    body: `SMS from ${from}:\n${body}`,
    status: "open",
    step_key: stepKey,
  });

  await admin.from("notifications").insert({
    user_id: userId,
    title: "SMS received by Fortuna support",
    body: body.slice(0, 500),
    href: "/dashboard/support",
    template_key: "sms_inbound",
  });

  return twimlOk();
}

function twimlOk() {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
    {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    },
  );
}

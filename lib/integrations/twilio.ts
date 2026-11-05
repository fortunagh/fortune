import twilio from "twilio";

export function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
}

export async function sendSms(options: {
  to: string;
  body: string;
}): Promise<{ ok: boolean; sid?: string; error?: string }> {
  const from = process.env.TWILIO_PHONE_NUMBER;
  const client = getTwilioClient();
  if (!client || !from) {
    return { ok: false, error: "TWILIO not configured" };
  }

  try {
    const msg = await client.messages.create({
      to: options.to,
      from,
      body: options.body,
    });
    return { ok: true, sid: msg.sid };
  } catch (e) {
    const message = e instanceof Error ? e.message : "SMS send failed";
    console.error("twilio sendSms", message);
    return { ok: false, error: message };
  }
}

export function validateTwilioSignature(
  signature: string | null,
  url: string,
  params: Record<string, string>,
): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token || !signature) return false;
  return twilio.validateRequest(token, signature, url, params);
}

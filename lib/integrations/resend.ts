import { Resend } from "resend";

export type EmailAttachment = {
  filename: string;
  /** Raw file bytes */
  content: Buffer;
  contentType?: string;
};

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ||
    "Fortuna Global Holdings <onboarding@fortunaglobalholdings.com>";

  if (!key) {
    console.warn("RESEND_API_KEY missing — email not sent:", options.subject);
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  const recipients = (Array.isArray(options.to) ? options.to : [options.to])
    .map((e) => e.trim())
    .filter(Boolean);
  if (recipients.length === 0) {
    return { ok: false, error: "No recipients" };
  }

  try {
    const resend = new Resend(key);
    const { data, error } = await resend.emails.send({
      from,
      to: recipients,
      subject: options.subject,
      html: options.html,
      text: options.text,
      ...(options.attachments?.length
        ? {
            attachments: options.attachments.map((a) => ({
              filename: a.filename,
              content: a.content,
              contentType: a.contentType,
            })),
          }
        : {}),
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Email send failed";
    return { ok: false, error: message };
  }
}

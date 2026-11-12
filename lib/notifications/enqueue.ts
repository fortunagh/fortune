import type { SupabaseClient } from "@supabase/supabase-js";

import { sendEmail } from "@/lib/integrations/resend";
import { sendSms } from "@/lib/integrations/twilio";
import { resolveUserPhone } from "@/lib/onboarding/phone";
import { getNotificationEmails } from "@/lib/admin/settings";
import {
  renderAccessApprovedEmail,
  renderInvoiceEmail,
  renderNewRequestAccessAdminEmail,
  renderNextStepEmail,
} from "./templates";

type AdminClient = SupabaseClient;
type NotifyChannel = "email" | "sms" | "in_app";

async function profileName(
  admin: AdminClient,
  userId: string,
): Promise<{ firstName: string; email: string | null }> {
  const { data: profile } = await admin
    .from("profiles")
    .select("first_name")
    .eq("id", userId)
    .maybeSingle();

  const { data: userData } = await admin.auth.admin.getUserById(userId);
  const email = userData.user?.email ?? null;
  const firstName =
    profile?.first_name ||
    email?.split("@")[0] ||
    "there";

  return { firstName, email };
}

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export async function enqueueNextStepNotification(
  admin: AdminClient,
  options: {
    userId: string;
    stepKey: string;
    idempotencyKey: string;
    templateKey?: string;
    channel?: NotifyChannel;
  },
) {
  const {
    userId,
    stepKey,
    idempotencyKey,
    templateKey,
    channel = "email",
  } = options;

  const { data: existing } = await admin
    .from("deliveries")
    .select("id")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existing) return { skipped: true as const };

  const { firstName, email } = await profileName(admin, userId);
  const tpl =
    templateKey === "onboarding_complete"
      ? renderNextStepEmail({
          firstName,
          stepKey: "onboarding_complete",
          portalUrl: siteUrl(),
        })
      : renderNextStepEmail({
          firstName,
          stepKey,
          portalUrl: siteUrl(),
        });

  const template = templateKey ?? `next_step_${stepKey}`;
  const smsBody = `Fortuna: ${tpl.subject}. Open ${siteUrl()}/dashboard/steps/${stepKey}`;

  await admin.from("notifications").insert({
    user_id: userId,
    title: tpl.subject,
    body: tpl.text.slice(0, 500),
    href: `/dashboard/steps/${stepKey}`,
    template_key: template,
  });

  if (channel === "in_app") {
    await admin.from("deliveries").insert({
      user_id: userId,
      channel: "in_app",
      template_key: template,
      idempotency_key: idempotencyKey,
      status: "sent",
      sent_at: new Date().toISOString(),
      meta: { stepKey },
    });
    return { ok: true as const };
  }

  if (channel === "sms") {
    const phone = await resolveUserPhone(admin, userId);
    const { data: delivery } = await admin
      .from("deliveries")
      .insert({
        user_id: userId,
        channel: "sms",
        template_key: template,
        idempotency_key: idempotencyKey,
        status: "pending",
        meta: { stepKey, to: phone },
      })
      .select("id")
      .single();

    if (!phone) {
      if (delivery) {
        await admin
          .from("deliveries")
          .update({ status: "skipped", meta: { stepKey, error: "no_phone" } })
          .eq("id", delivery.id);
      }
      return { skipped: true as const };
    }

    const sent = await sendSms({ to: phone, body: smsBody });
    if (delivery) {
      await admin
        .from("deliveries")
        .update({
          status: sent.ok ? "sent" : "failed",
          sent_at: sent.ok ? new Date().toISOString() : null,
          meta: { stepKey, to: phone, sid: sent.sid ?? null, error: sent.error ?? null },
        })
        .eq("id", delivery.id);
    }
    return sent;
  }

  const { data: delivery } = await admin
    .from("deliveries")
    .insert({
      user_id: userId,
      channel: "email",
      template_key: template,
      idempotency_key: idempotencyKey,
      status: "pending",
      meta: { stepKey },
    })
    .select("id")
    .single();

  if (!email) {
    if (delivery) {
      await admin
        .from("deliveries")
        .update({ status: "skipped" })
        .eq("id", delivery.id);
    }
    return { skipped: true as const };
  }

  const sent = await sendEmail({
    to: email,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });

  if (delivery) {
    await admin
      .from("deliveries")
      .update({
        status: sent.ok ? "sent" : "failed",
        sent_at: sent.ok ? new Date().toISOString() : null,
        meta: { stepKey, error: sent.error ?? null },
      })
      .eq("id", delivery.id);
  }

  return sent;
}

export async function notifyAdminsOfNewRequestAccess(options: {
  admin: AdminClient;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  interest: string;
}) {
  const emails = await getNotificationEmails(options.admin);
  if (emails.length === 0) {
    console.warn(
      "No admin notification emails configured — skip new request alert",
    );
    return { skipped: true as const };
  }

  const tpl = renderNewRequestAccessAdminEmail({
    firstName: options.firstName,
    lastName: options.lastName,
    email: options.email,
    phone: options.phone,
    city: options.city,
    interest: options.interest,
    adminUrl: `${siteUrl()}/dashboard/admin/request-access`,
  });

  return sendEmail({
    to: emails,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });
}

export async function sendAccessApprovedEmail(
  admin: AdminClient,
  options: {
    userId?: string | null;
    email: string;
    firstName: string;
    activateUrl: string;
    idempotencyKey: string;
  },
) {
  const { email, firstName, activateUrl, idempotencyKey, userId } = options;

  const { data: existing } = await admin
    .from("deliveries")
    .select("id")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  if (existing) return { skipped: true as const };

  const tpl = renderAccessApprovedEmail({ firstName, activateUrl });

  const deliveryUser = userId ?? null;
  if (deliveryUser) {
    await admin.from("notifications").insert({
      user_id: deliveryUser,
      title: tpl.subject,
      body: tpl.text.slice(0, 500),
      href: activateUrl,
      template_key: "access_approved",
    });
  }

  // For pre-activation, store delivery against a placeholder by skipping user FK if needed
  // Use invited email in meta; user_id may be null until activation — require a user for FK.
  // If no user yet, just send email and log without deliveries row user constraint:
  const sent = await sendEmail({
    to: email,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });

  if (deliveryUser) {
    await admin.from("deliveries").insert({
      user_id: deliveryUser,
      channel: "email",
      template_key: "access_approved",
      idempotency_key: idempotencyKey,
      status: sent.ok ? "sent" : "failed",
      sent_at: sent.ok ? new Date().toISOString() : null,
      meta: { email },
    });
  }

  return sent;
}

export async function sendInvoiceEmail(
  admin: AdminClient,
  options: {
    userId: string;
    paymentId: string;
    billingMonth: string;
    periodStart: string;
    periodEnd: string;
    invoiceNumber: string;
    amount: string;
    currency: string;
    dueDate: string;
    invoiceUrl: string;
  },
) {
  const idempotencyKey = `invoice:${options.paymentId}`;
  const { data: existing } = await admin
    .from("deliveries")
    .select("id")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  if (existing) return { skipped: true as const };

  const { firstName, email } = await profileName(admin, options.userId);
  if (!email) return { skipped: true as const };

  const tpl = renderInvoiceEmail({
    firstName,
    billingMonth: options.billingMonth,
    periodStart: options.periodStart,
    periodEnd: options.periodEnd,
    invoiceNumber: options.invoiceNumber,
    amount: options.amount,
    currency: options.currency,
    dueDate: options.dueDate,
    invoiceUrl: options.invoiceUrl,
  });

  await admin.from("notifications").insert({
    user_id: options.userId,
    title: tpl.subject,
    body: tpl.text.slice(0, 500),
    href: "/dashboard/billing",
    template_key: "usage_invoice",
  });

  const sent = await sendEmail({
    to: email,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });

  await admin.from("deliveries").insert({
    user_id: options.userId,
    channel: "email",
    template_key: "usage_invoice",
    idempotency_key: idempotencyKey,
    status: sent.ok ? "sent" : "failed",
    sent_at: sent.ok ? new Date().toISOString() : null,
    meta: { paymentId: options.paymentId },
  });

  return sent;
}

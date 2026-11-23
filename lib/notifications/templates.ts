import { getStepCopy } from "@/lib/onboarding/step-copy";
import { getStepDef } from "@/lib/onboarding/steps";

import { wrapFortunaEmail } from "./email-layout";

export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraphsToHtml(paragraphs: string[], bullets?: string[], note?: string) {
  const parts: string[] = [];
  for (const p of paragraphs) {
    parts.push(`<p style="margin:0 0 12px">${escapeHtml(p)}</p>`);
  }
  if (bullets?.length) {
    parts.push(
      `<ul style="margin:0 0 12px;padding-left:18px">${bullets
        .map((b) => `<li style="margin:0 0 6px">${escapeHtml(b)}</li>`)
        .join("")}</ul>`,
    );
  }
  if (note) {
    parts.push(
      `<p style="margin:12px 0 0;padding:12px 14px;background:#fbf8f3;border-left:3px solid #c59d3f;font-size:14px;color:#3f3f46">${escapeHtml(note)}</p>`,
    );
  }
  return parts.join("");
}

function paragraphsToText(paragraphs: string[], bullets?: string[], note?: string) {
  const lines = [...paragraphs];
  if (bullets?.length) {
    lines.push("", ...bullets.map((b) => `• ${b}`));
  }
  if (note) lines.push("", note);
  return lines.join("\n\n");
}

const CTA_BY_STEP: Record<string, string> = {
  onboarding_payment: "Complete my onboarding",
  questionnaire: "Complete my onboarding questionnaire",
  vps_setup: "Continue in your portal",
  broker_demo: "Continue in your portal",
  user_agreement: "Review and sign my agreement",
  licence_portal: "Continue in your portal",
  demo_licence_apply: "Continue in your portal",
  demo_licence_approved: "Check my demo licence status",
  demo_install: "Continue in your portal",
  mt5_mobile: "Continue in your portal",
  demo_readiness: "Complete my Demo Readiness Checklist",
  live_licence_apply: "Continue in your portal",
  live_install: "Continue in your portal",
  live_activation: "Continue in your portal",
  onboarding_complete: "Open your portal",
  usage_billing: "View billing",
};

export function renderNextStepEmail(options: {
  firstName: string;
  stepKey: string;
  portalUrl: string;
}): EmailTemplate {
  const { firstName, stepKey, portalUrl } = options;
  const def = getStepDef(stepKey);
  const copy = getStepCopy(stepKey);

  const subject =
    copy?.emailSubject ?? def?.title ?? "Your next Fortuna step";
  const cta = CTA_BY_STEP[stepKey] ?? "Continue in your portal";
  const link = `${portalUrl.replace(/\/$/, "")}/dashboard/steps/${stepKey}`;

  const bodyHtml = copy
    ? paragraphsToHtml(
        copy.emailParagraphs,
        copy.emailBullets,
        copy.emailNote ?? copy.portalNote,
      )
    : `<p style="margin:0 0 12px">${escapeHtml(def?.description ?? "Your next Fortuna step is ready.")}</p>`;

  const bodyText = copy
    ? paragraphsToText(
        copy.emailParagraphs,
        copy.emailBullets,
        copy.emailNote ?? copy.portalNote,
      )
    : (def?.description ?? "Your next Fortuna step is ready.");

  const { html, text } = wrapFortunaEmail({
    firstName,
    previewText: subject,
    bodyHtml,
    bodyText,
    ctaLabel: cta,
    ctaUrl: link,
  });

  return { subject, html, text };
}

/** Alert admins when a new request-access form is submitted. */
export function renderNewRequestAccessAdminEmail(options: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  interest: string;
  adminUrl: string;
}): EmailTemplate {
  const o = options;
  const { html, text } = wrapFortunaEmail({
    firstName: "Admin",
    previewText: `New request from ${o.firstName} ${o.lastName}`,
    bodyHtml: `<p style="margin:0 0 12px">A new Client Portal access request was submitted.</p>
<ul style="margin:0 0 12px;padding-left:18px">
<li><strong>Name</strong> — ${escapeHtml(o.firstName)} ${escapeHtml(o.lastName)}</li>
<li><strong>Email</strong> — ${escapeHtml(o.email)}</li>
<li><strong>Phone</strong> — ${escapeHtml(o.phone)}</li>
<li><strong>City</strong> — ${escapeHtml(o.city)}</li>
<li><strong>Interest</strong> — ${escapeHtml(o.interest.slice(0, 280))}</li>
</ul>`,
    bodyText: `A new Client Portal access request was submitted.\nName — ${o.firstName} ${o.lastName}\nEmail — ${o.email}\nPhone — ${o.phone}\nCity — ${o.city}\nInterest — ${o.interest}`,
    ctaLabel: "Review in admin",
    ctaUrl: o.adminUrl,
  });

  return {
    subject: `New access request — ${o.firstName} ${o.lastName}`,
    html,
    text,
  };
}

/** Branded set-password email after admin approval. */
export function renderAccessApprovedEmail(options: {
  firstName: string;
  activateUrl: string;
  /** Existing clients: do not mention the onboarding payment. */
  feeWaived?: boolean;
}): EmailTemplate {
  const { firstName, activateUrl, feeWaived = false } = options;
  const paragraphs = feeWaived
    ? [
        "Thank you for registering with Fortuna. Your access has been approved, and you can now activate your Fortuna onboarding account.",
        "Use the secure invitation link to create your password and sign in. Your onboarding portal will show the steps to complete, the resources for each stage and your progress.",
        "Once your account is activated, continue your setup steps in the portal. Your onboarding fee has been waived.",
      ]
    : [
        "Thank you for registering with Fortuna. Your access has been approved, and you can now activate your Fortuna onboarding account.",
        "Use the secure invitation link to create your password and sign in. Your onboarding portal will show the steps to complete, the resources for each stage and your progress.",
        "Once your account is activated, you will receive the next step to begin onboarding.",
      ];
  const { html, text } = wrapFortunaEmail({
    firstName,
    previewText: "Your Fortuna access is ready",
    bodyHtml: paragraphsToHtml(paragraphs),
    bodyText: paragraphs.join("\n\n"),
    ctaLabel: "Activate my Fortuna account",
    ctaUrl: activateUrl,
  });

  return {
    subject: "Your Fortuna access is ready",
    html,
    text,
  };
}

export function renderSupportReplyEmail(options: {
  firstName: string;
  reply: string;
  originalMessage: string;
  supportUrl: string;
}): EmailTemplate {
  const o = options;
  const safeReply = escapeHtml(o.reply);
  const safeOriginal = escapeHtml(o.originalMessage);
  const { html, text } = wrapFortunaEmail({
    firstName: o.firstName,
    previewText: "Reply from Fortuna support",
    bodyHtml: `<p style="margin:0 0 12px">Our team replied to your support request:</p>
<blockquote style="margin:0 0 16px;padding:12px 14px;border-left:3px solid #c59d3f;background:#fbf8f3;color:#171717;white-space:pre-wrap">${safeReply}</blockquote>
<p style="margin:0 0 8px;color:#737373;font-size:13px">Your original message:</p>
<p style="margin:0;color:#737373;font-size:13px;white-space:pre-wrap">${safeOriginal}</p>`,
    bodyText: `Our team replied to your support request:\n\n${o.reply}\n\nYour original message:\n${o.originalMessage}`,
    ctaLabel: "Open support in portal",
    ctaUrl: o.supportUrl,
  });

  return {
    subject: "Fortuna support replied to your request",
    html,
    text,
  };
}

export function renderInvoiceEmail(options: {
  firstName: string;
  billingMonth: string;
  periodStart: string;
  periodEnd: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  dueDate: string;
  invoiceUrl: string;
}): EmailTemplate {
  const o = options;
  const { html, text } = wrapFortunaEmail({
    firstName: o.firstName,
    previewText: `Invoice ${o.invoiceNumber}`,
    bodyHtml: `<p style="margin:0 0 12px">Your Fortuna invoice for <strong>${escapeHtml(o.billingMonth)}</strong> is ready. It covers software usage fees for <strong>${escapeHtml(o.periodStart)} to ${escapeHtml(o.periodEnd)}</strong>.</p>
<ul style="margin:0 0 12px;padding-left:18px">
<li>Invoice number — ${escapeHtml(o.invoiceNumber)}</li>
<li>Amount due — ${escapeHtml(o.amount)} ${escapeHtml(o.currency)}</li>
<li>Payment due — ${escapeHtml(o.dueDate)}</li>
</ul>
<p style="margin:0;color:#737373;font-size:13px">If you have a question about this invoice, reply to this email and include your invoice number.</p>`,
    bodyText: `Your Fortuna invoice for ${o.billingMonth} is ready.\nInvoice number — ${o.invoiceNumber}\nAmount due — ${o.amount} ${o.currency}\nPayment due — ${o.dueDate}`,
    ctaLabel: "View invoice and pay",
    ctaUrl: o.invoiceUrl,
  });

  return {
    subject: `Fortuna software usage invoice | ${o.billingMonth}`,
    html,
    text,
  };
}

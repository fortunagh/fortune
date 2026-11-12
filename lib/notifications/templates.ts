import { getStepDef } from "@/lib/onboarding/steps";

import { wrapFortunaEmail } from "./email-layout";

export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

export function renderNextStepEmail(options: {
  firstName: string;
  stepKey: string;
  portalUrl: string;
}): EmailTemplate {
  const { firstName, stepKey, portalUrl } = options;
  const def = getStepDef(stepKey);

  const map: Record<string, { subject: string; cta: string; intro: string }> = {
    onboarding_payment: {
      subject: "Let’s get you set up with Fortuna",
      cta: "Complete onboarding",
      intro:
        "Please complete the onboarding link below. We’ll guide you through setting up your account, installing the software and learning how to use it on a demo account.",
    },
    questionnaire: {
      subject: "Complete your onboarding questionnaire",
      cta: "Complete the questionnaire",
      intro:
        "Please complete the questionnaire so we can identify the approved broker options available for your setup.",
    },
    vps_setup: {
      subject: "Set up your VPS",
      cta: "Continue in your portal",
      intro:
        "Use the ForexVPS signup link in your portal, then follow the video or PDF to set up and connect to your VPS.",
    },
    broker_demo: {
      subject: "Open your MT5 demo account",
      cta: "Continue in your portal",
      intro:
        "Choose a broker from your approved options and open a demo account on MT5 with USD, 500:1 leverage and a USD 100,000 demo balance.",
    },
    licence_portal: {
      subject: "Create your Fortuna licence portal account",
      cta: "Continue in your portal",
      intro:
        "Connect to your VPS and open a web browser inside it to register in the Fortuna licence portal.",
    },
    demo_licence_apply: {
      subject: "Choose your EA and apply for a demo licence",
      cta: "Continue in your portal",
      intro:
        "Review the EA comparison guide, then apply for a Demo licence in the licence portal.",
    },
    user_agreement: {
      subject: "Sign your Fortuna user agreement",
      cta: "Sign your agreement",
      intro: "Please review and sign your Fortuna user agreement to continue.",
    },
    demo_install: {
      subject: "Install your EA on your demo account",
      cta: "Continue in your portal",
      intro:
        "Connect to your VPS and follow the installation section of the Fortuna EA Registration & Setup Guide.",
    },
    mt5_mobile: {
      subject: "Monitor your demo account with MT5 mobile",
      cta: "Continue in your portal",
      intro:
        "Use the MT5 mobile app for routine monitoring of your demo account. Leave MT5 running on your VPS.",
    },
    demo_readiness: {
      subject: "Are you ready for the next step with Fortuna?",
      cta: "Complete your Demo Readiness Checklist",
      intro:
        "Please complete the Demo Readiness Checklist in your Fortuna portal.",
    },
    live_licence_apply: {
      subject: "Your next step with Fortuna — Apply for a live EA licence",
      cta: "Continue in your portal",
      intro:
        "You’ve completed your demo practice and readiness checklist. When you’re ready, open a live MT5 account and apply for a live EA licence.",
    },
    live_install: {
      subject: "Install your live EA and set up Equity Protect",
      cta: "Continue in your portal",
      intro:
        "Once your live EA licence is approved, install the EA and configure Equity Protect before enabling Algo Trading.",
    },
    live_activation: {
      subject: "Confirm when your live EA is active",
      cta: "Continue in your portal",
      intro:
        "When you decide to begin live trading and the EA is active, confirm in your onboarding portal.",
    },
    onboarding_complete: {
      subject: "Your Fortuna onboarding is complete",
      cta: "Open your portal",
      intro:
        "Thank you for confirming that your EA is active on your live MT5 account. Your Fortuna onboarding is now complete.",
    },
  };

  const entry = map[stepKey] ?? {
    subject: def?.title ?? "Your next Fortuna step",
    cta: "Continue in your portal",
    intro: def?.description ?? "Your next Fortuna step is ready.",
  };

  const link = `${portalUrl.replace(/\/$/, "")}/dashboard/steps/${stepKey}`;
  const { html, text } = wrapFortunaEmail({
    firstName,
    previewText: entry.subject,
    bodyHtml: `<p style="margin:0 0 12px">${entry.intro}</p>`,
    bodyText: entry.intro,
    ctaLabel: entry.cta,
    ctaUrl: link,
  });

  return { subject: entry.subject, html, text };
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
<li><strong>Name</strong> — ${o.firstName} ${o.lastName}</li>
<li><strong>Email</strong> — ${o.email}</li>
<li><strong>Phone</strong> — ${o.phone}</li>
<li><strong>City</strong> — ${o.city}</li>
<li><strong>Interest</strong> — ${o.interest.slice(0, 280)}</li>
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
}): EmailTemplate {
  const { firstName, activateUrl } = options;
  const { html, text } = wrapFortunaEmail({
    firstName,
    previewText: "Set your Fortuna password",
    bodyHtml: `<p style="margin:0 0 12px">Your Fortuna access has been approved. Set your password with the button below, then sign in to complete your onboarding payment and setup steps.</p>
<p style="margin:0;color:#737373;font-size:13px">This link expires for security. If it no longer works, contact support@fortunaglobal.com.</p>`,
    bodyText:
      "Your Fortuna access has been approved. Set your password with the link below, then sign in to complete your onboarding payment and setup steps.",
    ctaLabel: "Set your Fortuna password",
    ctaUrl: activateUrl,
  });

  return {
    subject: "Set your Fortuna password",
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
    bodyHtml: `<p style="margin:0 0 12px">Your Fortuna invoice for <strong>${o.billingMonth}</strong> is ready. It covers software usage fees for <strong>${o.periodStart} to ${o.periodEnd}</strong>.</p>
<ul style="margin:0 0 12px;padding-left:18px">
<li>Invoice number — ${o.invoiceNumber}</li>
<li>Amount due — ${o.amount} ${o.currency}</li>
<li>Payment due — ${o.dueDate}</li>
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

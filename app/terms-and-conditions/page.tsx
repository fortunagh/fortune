import type { Metadata } from "next";

import { LegalPageShell } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms & Conditions for Fortuna Global Holdings website, Client Portal, and SMS program.",
};

export default function TermsAndConditionsPage() {
  return (
    <LegalPageShell title="Terms & Conditions">
      <p>
        These Terms &amp; Conditions (“Terms”) govern your use of the{" "}
        <strong>Fortuna Global Holdings</strong> website, Client Portal, and
        related services. By accessing or using our services, you agree to these
        Terms.
      </p>
      <p>Last updated: November 2026.</p>

      <h2>About Fortuna Global Holdings</h2>
      <p>
        Fortuna Global Holdings provides an invitation-oriented client
        experience, including a Client Portal for onboarding, resources,
        billing notices, and support. Software, brokerage, and third-party
        platforms referenced in the portal are subject to their own terms.
      </p>

      <h2>Accounts and eligibility</h2>
      <ul>
        <li>
          You must provide accurate information when requesting access or using
          the portal.
        </li>
        <li>
          You are responsible for safeguarding login credentials and for
          activity under your account.
        </li>
        <li>
          Access may be invitation-only and may be suspended or terminated if
          these Terms are breached or if required for security or compliance.
        </li>
      </ul>

      <h2>Client Portal and onboarding</h2>
      <p>
        Onboarding steps, fees, agreements, and confirmations presented in the
        portal form part of your relationship with Fortuna Global Holdings.
        Payment processing is handled by Stripe or other designated providers.
        Document signing may be handled by Dropbox Sign or similar services.
      </p>

      <h2>SMS terms</h2>
      <p>
        Fortuna Global Holdings may offer SMS messages related to Client Portal
        onboarding, account notices, reminders, and support. By providing your
        mobile number and opting in (for example via request access or your
        account), you consent to receive such messages from Fortuna Global
        Holdings.
      </p>
      <ul>
        <li>
          Message frequency varies based on your onboarding status and support
          activity.
        </li>
        <li>
          <strong>Message and data rates may apply.</strong>
        </li>
        <li>
          Reply <strong>STOP</strong> to cancel SMS. Reply <strong>HELP</strong>{" "}
          for help.
        </li>
        <li>
          Carriers are not liable for delayed or undelivered messages.
        </li>
        <li>
          Consent to SMS is not a condition of purchasing Fortuna services where
          prohibited by law; however, certain operational notices may still be
          delivered by email or in-portal notification.
        </li>
      </ul>

      <h2>Acceptable use</h2>
      <p>
        You agree not to misuse the site or portal, including by attempting to
        disrupt services, access others’ data without authorization, or use the
        platform for unlawful purposes.
      </p>

      <h2>Intellectual property</h2>
      <p>
        Content, branding, and materials on Fortuna Global Holdings properties
        remain our property or that of our licensors. You may not copy or
        redistribute them without permission, except as needed to use the
        services.
      </p>

      <h2>Disclaimers</h2>
      <p>
        Information on the website and in the portal is provided for
        operational and informational purposes. Nothing on the site constitutes
        financial, investment, or legal advice unless expressly stated in a
        separate written agreement with Fortuna Global Holdings.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, Fortuna Global Holdings is not
        liable for indirect, incidental, or consequential damages arising from
        use of the website, portal, or SMS program.
      </p>

      <h2>Privacy</h2>
      <p>
        Our collection and use of personal information is described in our{" "}
        <a href="/privacy-policy">Privacy Policy</a>.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these Terms from time to time. Continued use after changes
        are posted constitutes acceptance of the updated Terms.
      </p>

      <h2>Contact</h2>
      <p>
        Fortuna Global Holdings
        <br />
        Email:{" "}
        <a href="mailto:support@fortunaglobal.com">support@fortunaglobal.com</a>
        <br />
        Website:{" "}
        <a href="https://www.fortunaglobalholdings.com">
          www.fortunaglobalholdings.com
        </a>
      </p>
    </LegalPageShell>
  );
}

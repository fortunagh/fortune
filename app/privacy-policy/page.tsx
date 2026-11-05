import type { Metadata } from "next";

import { LegalPageShell } from "@/components/landing/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Fortuna Global Holdings, including how we handle account, onboarding, and SMS information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell title="Privacy Policy">
      <p>
        This Privacy Policy describes how <strong>Fortuna Global Holdings</strong>{" "}
        (“Fortuna”, “we”, “us”) collects, uses, and protects information when you
        use our website at{" "}
        <a href="https://www.fortunaglobalholdings.com">
          www.fortunaglobalholdings.com
        </a>
        , the Client Portal, and related services, including SMS communications.
      </p>
      <p>Last updated: November 2026.</p>

      <h2>Information we collect</h2>
      <p>Depending on how you interact with us, we may collect:</p>
      <ul>
        <li>
          Contact and identity details (such as name, email address, and mobile
          phone number in E.164 format)
        </li>
        <li>
          Account and authentication information for the Client Portal
        </li>
        <li>
          Onboarding and program information you submit (including request-access
          forms, questionnaires, support messages, and progress through setup
          steps)
        </li>
        <li>
          Payment and billing metadata processed by our payment providers (we do
          not store full card numbers on our servers)
        </li>
        <li>
          SMS opt-in status, message delivery records, and inbound SMS content
          when you text our program number
        </li>
        <li>
          Technical data such as device/browser type, IP address, and basic
          usage logs needed to secure and operate the service
        </li>
      </ul>

      <h2>How we use information</h2>
      <p>Fortuna Global Holdings uses this information to:</p>
      <ul>
        <li>Provide and improve the Client Portal and onboarding experience</li>
        <li>
          Send transactional SMS and email related to account access,
          onboarding steps, reminders, billing notices, and support replies
        </li>
        <li>Respond to support requests and verify account activity</li>
        <li>Meet legal, security, and compliance obligations</li>
      </ul>

      <h2>SMS and mobile information</h2>
      <p>
        If you provide a mobile number and opt in to SMS (for example through
        request access or your Fortuna account), we may send program messages
        about onboarding and support. Message frequency varies. You can opt out
        by replying <strong>STOP</strong>. Reply <strong>HELP</strong> for help.
      </p>
      <p>
        <strong>
          We do not sell or share your SMS opt-in data or personal information
          with third parties for marketing purposes.
        </strong>
      </p>
      <p>
        We may use trusted service providers (such as hosting, authentication,
        payment, e-signature, and messaging platforms) solely to operate Fortuna
        Global Holdings services. Those providers process data under our
        instructions and applicable agreements.
      </p>

      <h2>Retention and security</h2>
      <p>
        We retain information only as long as needed for the purposes above or
        as required by law. We apply administrative and technical safeguards
        appropriate to the sensitivity of the data.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>Update account profile details in the Client Portal where available</li>
        <li>Opt out of SMS by replying STOP</li>
        <li>
          Contact us to request access, correction, or deletion where applicable
          law allows
        </li>
      </ul>

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

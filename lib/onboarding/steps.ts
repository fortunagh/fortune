/** Canonical onboarding step keys and display metadata (seeded into DB). */

export type ConfirmationKind = "client" | "stripe" | "dropbox_sign" | "system";

export type StepPhase = "access" | "setup" | "demo" | "live" | "billing";

export type OnboardingStepDef = {
  key: string;
  sort: number;
  phase: StepPhase;
  title: string;
  eyebrow: string;
  description: string;
  confirmLabel: string | null;
  confirmationKind: ConfirmationKind;
  /** Previous step keys that must be complete (empty = first unlocked after activation). */
  prerequisites: string[];
};

export const STEP_PHASES: { id: StepPhase; label: string }[] = [
  { id: "access", label: "Access" },
  { id: "setup", label: "Setup" },
  { id: "demo", label: "Demo" },
  { id: "live", label: "Live" },
  { id: "billing", label: "Billing" },
];

export const ONBOARDING_STEPS: OnboardingStepDef[] = [
  {
    key: "request_access",
    sort: 1,
    phase: "access",
    title: "Request access",
    eyebrow: "Access",
    description:
      "Your request was approved and your Fortuna account is active.",
    confirmLabel: null,
    confirmationKind: "system",
    prerequisites: [],
  },
  {
    key: "onboarding_payment",
    sort: 2,
    phase: "access",
    title: "Complete onboarding payment",
    eyebrow: "Access",
    description:
      "Pay the one-time AUD $2,750 onboarding fee to continue setup.",
    confirmLabel: "Pay onboarding fee",
    confirmationKind: "stripe",
    prerequisites: ["request_access"],
  },
  {
    key: "questionnaire",
    sort: 3,
    phase: "setup",
    title: "Complete the onboarding questionnaire",
    eyebrow: "Setup",
    description:
      "Tell us how you will open the account so we can show approved broker options.",
    confirmLabel: "Submit questionnaire",
    confirmationKind: "client",
    prerequisites: ["onboarding_payment"],
  },
  {
    key: "vps_setup",
    sort: 4,
    phase: "setup",
    title: "Set up your VPS",
    eyebrow: "Setup",
    description:
      "Sign up via the ForexVPS affiliate link, follow the guide, then confirm your VPS is ready.",
    confirmLabel: "My VPS is set up",
    confirmationKind: "client",
    prerequisites: ["questionnaire"],
  },
  {
    key: "broker_demo",
    sort: 5,
    phase: "setup",
    title: "Open a broker demo account",
    eyebrow: "Setup",
    description:
      "Open an MT5 demo (USD, 500:1, USD 100,000) with an approved broker using the referral link provided.",
    confirmLabel: "My demo account is open",
    confirmationKind: "client",
    prerequisites: ["vps_setup"],
  },
  {
    key: "licence_portal",
    sort: 6,
    phase: "demo",
    title: "Register in the EA licence portal",
    eyebrow: "Demo",
    description:
      "From inside your VPS browser, create your Fortuna licence portal account.",
    confirmLabel: "I’ve registered in the licence portal",
    confirmationKind: "client",
    prerequisites: ["broker_demo"],
  },
  {
    key: "demo_licence_apply",
    sort: 7,
    phase: "demo",
    title: "Choose an EA and apply for a demo licence",
    eyebrow: "Demo",
    description:
      "Review the EA comparison guide, apply for a Demo licence, then confirm submission.",
    confirmLabel: "I’ve submitted my demo EA licence application",
    confirmationKind: "client",
    prerequisites: ["licence_portal"],
  },
  {
    key: "demo_licence_approved",
    sort: 8,
    phase: "demo",
    title: "Confirm demo licence approval",
    eyebrow: "Demo",
    description:
      "Approval can take up to 24 hours. When the licence portal shows approved, confirm here.",
    confirmLabel: "My demo EA licence is approved",
    confirmationKind: "client",
    prerequisites: ["demo_licence_apply"],
  },
  {
    key: "user_agreement",
    sort: 9,
    phase: "demo",
    title: "Sign the user agreement",
    eyebrow: "Demo",
    description: "Review and sign your Fortuna user agreement to continue.",
    confirmLabel: "Sign agreement",
    confirmationKind: "dropbox_sign",
    prerequisites: ["demo_licence_approved"],
  },
  {
    key: "demo_install",
    sort: 10,
    phase: "demo",
    title: "Install the EA on your demo account",
    eyebrow: "Demo",
    description:
      "Follow the installation guide on your VPS. Confirm when the EA is running on demo.",
    confirmLabel: "EA is running on my demo account",
    confirmationKind: "client",
    prerequisites: ["user_agreement"],
  },
  {
    key: "mt5_mobile",
    sort: 11,
    phase: "demo",
    title: "Practise on demo and monitor with MT5 mobile",
    eyebrow: "Demo",
    description:
      "Use the MT5 mobile app for routine monitoring. Leave MT5 running on the VPS.",
    confirmLabel: "I’ve set up MT5 mobile",
    confirmationKind: "client",
    prerequisites: ["demo_install"],
  },
  {
    key: "demo_readiness",
    sort: 12,
    phase: "demo",
    title: "Complete the demo readiness checklist",
    eyebrow: "Demo",
    description:
      "Available after 28 days of demo practice. Confirm all seven items to unlock live setup.",
    confirmLabel: "Confirm and continue",
    confirmationKind: "client",
    prerequisites: ["mt5_mobile"],
  },
  {
    key: "live_licence_apply",
    sort: 13,
    phase: "live",
    title: "Open a live MT5 account and apply for a live licence",
    eyebrow: "Live",
    description:
      "Open a live MT5 account at your broker, then apply for a Live EA licence.",
    confirmLabel: "I’ve submitted my live EA licence application",
    confirmationKind: "client",
    prerequisites: ["demo_readiness"],
  },
  {
    key: "live_install",
    sort: 14,
    phase: "live",
    title: "Install the live EA and configure Equity Protect",
    eyebrow: "Live",
    description:
      "Confirm live licence approval, install the EA, and configure Equity Protect before Algo Trading.",
    confirmLabel: null,
    confirmationKind: "client",
    prerequisites: ["live_licence_apply"],
  },
  {
    key: "live_activation",
    sort: 15,
    phase: "live",
    title: "Confirm live activation",
    eyebrow: "Live",
    description:
      "When your live EA is active, confirm here. Software usage fees are billed monthly in arrears.",
    confirmLabel: "My live EA is active",
    confirmationKind: "client",
    prerequisites: ["live_install"],
  },
  {
    key: "onboarding_complete",
    sort: 16,
    phase: "billing",
    title: "Onboarding complete",
    eyebrow: "Billing",
    description:
      "Your Fortuna onboarding is complete. Monthly software usage invoices will appear here.",
    confirmLabel: null,
    confirmationKind: "system",
    prerequisites: ["live_activation"],
  },
  {
    key: "usage_billing",
    sort: 17,
    phase: "billing",
    title: "Monthly software usage",
    eyebrow: "Billing",
    description:
      "Invoices for software usage fees are issued after each month ends.",
    confirmLabel: null,
    confirmationKind: "system",
    prerequisites: ["onboarding_complete"],
  },
];

export const DEMO_READINESS_ITEMS = [
  "I can connect to my VPS and check that MT5 is connected to my demo account and that the EA is running.",
  "I know how to create additional demo accounts and open live accounts in my broker’s secure client portal.",
  "I know how to apply for an EA licence in the Fortuna client portal.",
  "I know how to download the EA Installer, run it on my VPS and complete the setup.",
  "I can use the MT5 mobile app to view open positions, review trading history and filter it by date.",
  "I know to use the mobile app for routine monitoring and leave MT5 running on the VPS.",
  "I know how to request software support through the Fortuna portal, and I understand that I’m responsible for operating my trading account.",
] as const;

export const DEFAULT_LINKS = {
  forexVps: "https://www.forexvps.net/?aff=140887",
  licencePortalSignup:
    "https://clients.fortunaglobalholdings.com/signup/19269b45c6374f4dae93fda3f32f7411",
  helloSignTemplate: "https://app.hellosign.com/s/CdRr7SgF",
} as const;

export function getStepDef(key: string): OnboardingStepDef | undefined {
  return ONBOARDING_STEPS.find((s) => s.key === key);
}

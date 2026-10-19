import type { Metadata } from "next";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import "@/components/landing/fortuna.css";

export const metadata: Metadata = {
  title: "Onboarding",
  description:
    "Begin your Fortuna Global Holdings onboarding. Complete each step to request access.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OnboardingPage() {
  return (
    <main
      className="min-h-dvh"
      style={{
        background: "#f5f1ea",
        color: "#101217",
        fontFamily: "'Fortuna Garamond', Georgia, serif",
      }}
    >
      <OnboardingWizard />
    </main>
  );
}

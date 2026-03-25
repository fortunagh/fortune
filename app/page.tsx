import { AccessQualificationSection } from "@/components/landing/access-qualification-section";
import { ExecutionSection } from "@/components/landing/execution-section";
import { Hero } from "@/components/landing/hero";
import { MainCtaSection } from "@/components/landing/main-cta-section";
import { ReservedSection } from "@/components/landing/reserved-section";
import { VaultAccessSection } from "@/components/landing/vault-access-section";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <ReservedSection />
      <ExecutionSection />
      <VaultAccessSection />
      <AccessQualificationSection />
      <MainCtaSection />
    </main>
  );
}

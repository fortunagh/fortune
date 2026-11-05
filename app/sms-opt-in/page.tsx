import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SmsOptInProofForm } from "@/components/landing/sms-opt-in-proof-form";
import { SiteFooter } from "@/components/landing/site-footer";
import "@/components/landing/fortuna.css";

export const metadata: Metadata = {
  title: "SMS Opt-In | Fortuna Global Holdings",
  description:
    "Fortuna Global Holdings SMS opt-in: mobile number, consent checkbox, disclosures, Privacy Policy and Terms.",
};

export default function SmsOptInPage() {
  return (
    <div
      className="min-h-[100dvh] bg-[#f5f1ea] text-[#101217]"
      style={{ fontFamily: "'Fortuna Garamond', Georgia, serif" }}
    >
      <header className="border-b border-[#b9764a40] bg-[#fbf8f3]/95">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <Link href="/" className="inline-block">
            <Image
              src="/fortuna/logo-header.png"
              alt="Fortuna Global Holdings"
              width={180}
              height={46}
              className="h-8 w-auto"
              unoptimized
            />
          </Link>
          <Link
            href="/"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 hover:text-[#101217]"
            style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
          >
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-8 sm:py-14">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a84d0b]"
          style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          Fortuna Global Holdings
        </p>
        <h1
          className="mt-3 text-3xl tracking-tight sm:text-4xl"
          style={{ fontFamily: "'Fortuna Bodoni', Didot, 'Times New Roman', serif" }}
        >
          SMS opt-in
        </h1>
        <p
          className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base"
          style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          Clients may optionally opt in to receive transactional SMS about
          Client Portal onboarding and account support. The consent checkbox
          starts unchecked.
        </p>

        <div className="mt-8 border border-[#b9764a40] bg-[#fbf8f3]/95 p-4 shadow-[0_12px_40px_rgba(80,40,10,0.06)] sm:p-6">
          <SmsOptInProofForm />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

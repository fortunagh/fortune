import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { RequestAccessFormPanel } from "@/components/landing/request-access-form";

export const metadata: Metadata = {
  title: "Register Now",
  description:
    "Register with Fortuna Global Holdings. Access is selective — complete your request to get started.",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#f5f1ea]">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14">
        <header className="flex flex-col items-center gap-4 text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/fortuna/logo-header.png"
              alt="Fortuna Global Holdings — Building Infinite Abundance"
              width={335}
              height={86}
              priority
              className="h-auto w-[min(280px,85vw)]"
            />
          </Link>
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a84d0b]">
              Event registration
            </p>
          </div>
        </header>

        <div className="rounded-2xl border border-[#b9764a40] bg-white p-5 shadow-sm sm:p-8">
          <RequestAccessFormPanel
            title="Register Now"
            description="Complete each step. Fields marked with * are required. Your request will be reviewed before access is granted."
          />
        </div>

        <p className="text-center text-xs text-neutral-500">
          <Link href="/" className="underline-offset-2 hover:underline">
            Return to Fortuna Global Holdings
          </Link>
        </p>
      </div>
    </main>
  );
}

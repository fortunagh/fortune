import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { RequestAccessFormPanel } from "@/components/landing/request-access-form";
import "@/components/landing/fortuna.css";

export const metadata: Metadata = {
  title: "Register Now",
  description:
    "Register with Fortuna Global Holdings. Access is selective — complete your request to get started.",
};

export default function RegisterPage() {
  return (
    <main
      className="relative min-h-dvh overflow-x-hidden"
      style={{
        background: "#f5f1ea",
        color: "#101217",
        fontFamily: "'Fortuna Garamond', Georgia, serif",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: "url('/fortuna/artwork-plate.png')",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          backgroundSize: "min(1400px, 180%) auto",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(168,77,11,0.08),transparent_55%)]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-8 sm:py-12 md:py-14">
        <header className="flex flex-col items-center gap-3 text-center sm:gap-4">
          <Link href="/" className="inline-block">
            <Image
              src="/fortuna/logo-header.png"
              alt="Fortuna Global Holdings — Building Infinite Abundance"
              width={1005}
              height={258}
              priority
              quality={100}
              unoptimized
              className="h-auto w-[min(260px,78vw)] sm:w-[min(300px,70vw)]"
            />
          </Link>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-[11px]"
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              color: "#a84d0b",
            }}
          >
            Event registration
          </p>
          <div
            aria-hidden="true"
            className="h-px w-12 sm:w-14"
            style={{ background: "#a84d0b" }}
          />
        </header>

        <div className="border border-[#b9764a40] bg-[#fbf8f3]/95 p-4 shadow-[0_12px_40px_rgba(80,40,10,0.06)] backdrop-blur-[2px] sm:p-6 md:p-8">
          <RequestAccessFormPanel
            title="Register Now"
            description="Complete each step. Fields marked with * are required. Your request will be reviewed before access is granted."
          />
        </div>

        <p
          className="border-t border-[#b9764a40] pt-5 text-center text-[11px] leading-relaxed sm:pt-6"
          style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            color: "#101217",
          }}
        >
          <Link
            href="/"
            className="underline-offset-[5px] transition hover:underline"
            style={{ color: "#a84d0b" }}
          >
            Return to Fortuna Global Holdings
          </Link>
        </p>
      </div>
    </main>
  );
}

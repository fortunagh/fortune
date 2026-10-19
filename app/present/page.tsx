import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Cinzel, Inter } from "next/font/google";
import { CopyUrlButton } from "./copy-url-button";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Register Now — Stage QR",
  description:
    "Scan to register with Fortuna Global Holdings during the live presentation.",
  robots: {
    index: false,
    follow: false,
  },
};

const registerUrl = "https://www.fortunaglobalholdings.com/register";

export default function PresentPage() {
  return (
    <main
      className={`${inter.className} relative min-h-dvh overflow-x-hidden overflow-y-auto px-4 py-8 text-center sm:px-6 sm:py-10 md:px-10 md:py-14 lg:px-12`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Image
          src="/event/GoldenGlobalFinanceLobby.png"
          alt=""
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center sm:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(245,241,234,0.78)_0%,rgba(245,241,234,0.58)_40%,rgba(245,241,234,0.7)_75%,rgba(245,241,234,0.85)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_38%,rgba(255,255,255,0.4),transparent_72%)]" />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-[6%] left-2 w-px bg-gradient-to-b from-transparent via-[#a84d0b]/55 to-transparent sm:left-4 md:left-8 lg:left-12"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-[6%] right-2 w-px bg-gradient-to-b from-transparent via-[#a84d0b]/55 to-transparent sm:right-4 md:right-8 lg:right-12"
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[40rem] flex-col items-center justify-center px-1 sm:min-h-[calc(100dvh-5rem)] sm:max-w-2xl md:min-h-[calc(100dvh-7rem)]">
        <div className="present-fade-in mb-4 w-full sm:mb-5 md:mb-6">
          <Image
            src="/fortuna/logo-header.png"
            alt="Fortuna Global Holdings"
            width={1005}
            height={258}
            priority
            quality={100}
            unoptimized
            className="mx-auto h-auto w-[min(240px,70vw)] drop-shadow-sm sm:w-[min(300px,55vw)] md:w-[min(340px,42vw)]"
          />
          <p className="mt-2.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#8a6a2a] sm:mt-3 sm:text-[10px] sm:tracking-[0.28em] md:text-[11px]">
            Building a brighter tomorrow
          </p>
        </div>

        <h1
          className={`${cinzel.className} present-fade-in present-delay-1 mb-3 w-full text-[clamp(1.65rem,7vw,3.4rem)] leading-[1.12] tracking-tight sm:mb-4`}
        >
          <span className="block text-[#101217]">Register For</span>
          <span className="mt-0.5 block text-[1.12em] font-medium text-[#e9a544] sm:mt-1 sm:text-[1.15em]">
            The Event
          </span>
        </h1>

        <p className="present-fade-in present-delay-2 mb-5 max-w-[20rem] text-[13px] leading-relaxed text-neutral-700 sm:mb-7 sm:max-w-md sm:text-sm md:mb-8 md:text-base">
          Join global investors, business leaders, and entrepreneurs for an
          exclusive networking experience.
        </p>

        <Link
          href="/register"
          className="present-fade-in present-delay-2 group mb-5 inline-flex w-full max-w-[min(100%,280px)] min-h-11 items-center justify-center gap-2.5 border border-[#a84d0b] bg-transparent px-5 py-3 font-[Arial,Helvetica,sans-serif] text-xs font-medium uppercase tracking-[0.09em] text-[#a84d0b] transition hover:bg-[#a84d0b] hover:text-white sm:mb-6 sm:min-h-12 sm:max-w-[280px] sm:gap-3 sm:px-8 sm:py-3.5 sm:text-sm md:text-base"
        >
          Register Now
          <span
            aria-hidden="true"
            className="transition group-hover:translate-x-0.5"
          >
            ⟶
          </span>
        </Link>

        <p className="present-fade-in present-delay-3 mb-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-500 sm:mb-5 sm:text-[10px] sm:tracking-[0.2em] md:text-[11px]">
          — Or — Scan the QR code below
        </p>

        <div className="present-fade-in present-delay-3 relative mb-3 sm:mb-4">
          <div
            aria-hidden="true"
            className="present-glow absolute -inset-3 rounded-[1.5rem] bg-[#e9a544]/20 blur-xl sm:-inset-4 sm:rounded-[2rem] sm:blur-2xl"
          />
          <div className="relative rounded-xl border border-[#a84d0b]/35 bg-white p-3 shadow-[0_14px_40px_rgba(120,80,20,0.16)] sm:rounded-2xl sm:border-[#a84d0b]/40 sm:p-4 md:p-5">
            <Image
              src="/event/register-qr.png"
              alt="QR code linking to Fortuna registration"
              width={1024}
              height={1024}
              priority
              className="mx-auto h-auto w-[min(52vw,200px)] sm:w-[min(48vw,240px)] md:w-[min(42vw,280px)]"
            />
          </div>
        </div>

        <div className="present-fade-in present-delay-4 flex max-w-full items-start justify-center gap-1 px-1 text-[11px] text-neutral-600 sm:items-center sm:text-xs md:text-sm">
          <span className="min-w-0 break-all text-left sm:text-center">
            {registerUrl}
          </span>
          <CopyUrlButton url={registerUrl} />
        </div>
      </div>

      <style>{`
        @keyframes present-fade-in {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes present-glow {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.95; }
        }
        .present-fade-in {
          animation: present-fade-in 0.65s ease-out both;
        }
        .present-delay-1 { animation-delay: 0.1s; }
        .present-delay-2 { animation-delay: 0.2s; }
        .present-delay-3 { animation-delay: 0.3s; }
        .present-delay-4 { animation-delay: 0.4s; }
        .present-glow {
          animation: present-glow 3s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .present-fade-in,
          .present-glow {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}

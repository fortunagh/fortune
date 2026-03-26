import Image from "next/image";
import Link from "next/link";
import { Cinzel } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

/** Matches `components/landing/hero.tsx`: `hero-banner` bg + gradient, form centered. */
export function AuthVaultShell({ children }: { children: React.ReactNode }) {
  return (
    <section
      className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-white hero-banner"
      aria-label="Fortuna authentication"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/50" />

      {/* No `banner-inner-row` here — globals add extra top padding (56px) meant for the marketing hero */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col items-center justify-center px-5 pb-12 pt-4 md:px-10 md:pb-16 md:pt-6 lg:pt-8">
        <div className="-translate-y-6 flex w-full max-w-md flex-col items-center sm:-translate-y-8 md:-translate-y-10 lg:-translate-y-12">
          <Link href="/" className="inline-flex flex-col items-center gap-1">
            <Image
              src="/logo.png"
              alt="Fortuna Global Holdings — Building infinite abundance"
              width={200}
              height={175}
              priority
              className="h-auto w-[min(48vw,140px)] sm:w-[min(38vw,160px)] md:w-[min(32vw,180px)] lg:w-[200px]"
            />
          </Link>

          <div className="mt-6 w-full text-left sm:mt-8 md:mt-10">
            {children}
          </div>

          <p className="mt-7 w-full text-left sm:mt-8 md:mt-9">
            <Link
              href="/"
              className={`${cinzel.className} text-sm font-medium text-neutral-800 underline-offset-4 transition-colors hover:text-neutral-950 hover:underline`}
            >
              ← Return to Fortuna
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

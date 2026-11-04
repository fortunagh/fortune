import Image from "next/image";
import Link from "next/link";

import "@/components/landing/fortuna.css";
import { fortunaDisplayClass, fortunaUiClass } from "@/lib/fonts/fortuna";
import { cn } from "@/lib/utils";

/** Fortuna auth shell — paper/ink, header logo, no Cinzel / hero-banner. */
export function AuthVaultShell({ children }: { children: React.ReactNode }) {
  return (
    <section
      className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-[hsl(var(--fortuna-paper))] text-[hsl(var(--fortuna-ink))] dark:bg-background dark:text-foreground"
      aria-label="Fortuna authentication"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "url('/fortuna/artwork-plate.png')",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          backgroundSize: "min(1400px, 180%) auto",
        }}
      />
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col items-center justify-center px-5 py-12">
        <Link href="/" className="mb-8 inline-flex flex-col items-center gap-2">
          <Image
            src="/fortuna/logo-header.png"
            alt="Fortuna Global Holdings — Building Infinite Abundance"
            width={280}
            height={72}
            priority
            unoptimized
            className="h-auto w-[min(220px,70vw)]"
          />
          <p
            className={cn(
              fortunaUiClass,
              "text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--fortuna-bronze))]",
            )}
          >
            Private access
          </p>
        </Link>

        <div className="w-full border border-[hsl(var(--fortuna-hairline)/0.4)] bg-[hsl(var(--fortuna-paper)/0.95)] p-6 shadow-none dark:border-border dark:bg-card sm:p-8">
          {children}
        </div>

        <p className="mt-8 w-full text-left">
          <Link
            href="/"
            className={cn(
              fortunaDisplayClass,
              "text-sm text-[hsl(var(--fortuna-ink))] underline-offset-4 transition-colors hover:text-[hsl(var(--fortuna-bronze))] hover:underline dark:text-foreground",
            )}
          >
            ← Return to Fortuna
          </Link>
        </p>
      </div>
    </section>
  );
}

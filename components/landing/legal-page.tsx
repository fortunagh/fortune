import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/landing/site-footer";
import { fortunaDisplayClass, fortunaUiClass } from "@/lib/fonts/fortuna";
import { cn } from "@/lib/utils";

export function LegalPageShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-[#f7f6f2] text-neutral-950">
      <header className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="inline-flex items-center">
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
            className={cn(
              fortunaUiClass,
              "text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 hover:text-neutral-900",
            )}
          >
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <p
          className={cn(
            fortunaUiClass,
            "text-xs font-semibold uppercase tracking-[0.16em] text-[#a8842a]",
          )}
        >
          Fortuna Global Holdings
        </p>
        <h1
          className={cn(
            fortunaDisplayClass,
            "mt-3 text-4xl tracking-tight text-neutral-950 sm:text-5xl",
          )}
        >
          {title}
        </h1>
        <div
          className={cn(
            fortunaUiClass,
            "mt-8 space-y-5 text-base leading-relaxed text-neutral-700 [&_h2]:mt-10 [&_h2]:font-semibold [&_h2]:text-neutral-950 [&_h2]:text-lg [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_a]:text-[#a8842a] [&_a]:underline",
          )}
        >
          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

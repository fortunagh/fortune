import Image from "next/image";
import Link from "next/link";
import { BookOpen, Headset, Layers } from "lucide-react";

import { fortunaDisplayClass, fortunaUiClass } from "@/lib/fonts/fortuna";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Layers,
    title: "Guided Onboarding",
    body: "A step-by-step setup to take you live",
  },
  {
    icon: BookOpen,
    title: "Your Resources",
    body: "Guides, videos, and documentation",
  },
  {
    icon: Headset,
    title: "Dedicated Support",
    body: "Get help from our specialist team",
  },
] as const;

/** Two-column premium auth shell — light mockup. Marketing homepage unchanged. */
export function AuthVaultShell({ children }: { children: React.ReactNode }) {
  return (
    <section
      className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-[#f7f6f2] text-neutral-950"
      aria-label="Fortuna authentication"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(197,157,63,0.18),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-8 -right-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(168,77,11,0.1),transparent_70%)]"
      />

      <div className="relative z-10 mx-auto grid min-h-[100dvh] w-full max-w-6xl gap-10 px-5 py-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-10 lg:py-16">
        <aside className="order-2 flex flex-col justify-center lg:order-1">
          <Link href="/" className="mb-10 inline-flex w-fit">
            <Image
              src="/fortuna/logo-header.png"
              alt="Fortuna Global Holdings"
              width={220}
              height={56}
              priority
              unoptimized
              className="h-auto w-[min(200px,55vw)]"
            />
          </Link>

          <p
            className={cn(
              fortunaUiClass,
              "mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b8922e]",
            )}
          >
            Client Portal
          </p>
          <div className="mb-4 h-px w-10 bg-[#c59d3f]" aria-hidden />
          <h1
            className={cn(
              fortunaDisplayClass,
              "text-4xl leading-[1.1] tracking-tight text-neutral-950 sm:text-5xl",
            )}
          >
            Client Portal
          </h1>
          <p
            className={cn(
              fortunaUiClass,
              "mt-4 max-w-md text-base leading-relaxed text-neutral-600",
            )}
          >
            Access your account, continue your onboarding, and manage your
            journey with Fortuna.
          </p>

          <ul className="mt-10 space-y-5">
            {features.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--portal-gold-soft))] text-[#a8842a]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p
                    className={cn(
                      fortunaUiClass,
                      "text-sm font-semibold text-neutral-900",
                    )}
                  >
                    {title}
                  </p>
                  <p
                    className={cn(
                      fortunaUiClass,
                      "mt-0.5 text-sm text-neutral-500",
                    )}
                  >
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <div className="order-1 flex w-full items-center justify-center lg:order-2">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </section>
  );
}

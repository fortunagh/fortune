import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Cinzel } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const linkClass =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-900 transition-opacity hover:opacity-70 sm:text-xs md:text-[0.8rem]";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className={`${cinzel.className} mx-auto max-w-7xl px-6 py-12 lg:px-10`}>
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-3 md:gap-8">
          <div className="flex justify-center md:justify-start">
            <Image
              src="/logo.png"
              alt="Fortuna Global Holdings"
              width={200}
              height={176}
              className="h-auto w-[min(200px,70vw)]"
            />
          </div>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,#E8C547_0%,#D4AF37_45%,#9a7328_100%)] shadow-sm"
              aria-hidden
            >
              <Mail className="h-5 w-5 text-white" strokeWidth={2} />
            </span>
            <a
              href="mailto:support@fortunaglobal.com"
              className="text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-900 underline-offset-4 transition-opacity hover:opacity-80 sm:text-xs md:text-[0.8rem] uppercase"
            >
              support@fortunaglobal.com
            </a>
          </div>

          <nav
            className="flex flex-col items-center gap-3 md:items-end"
            aria-label="Legal"
          >
            <Link href="/privacy-policy" className={linkClass}>
              Privacy policy
            </Link>
            <Link href="/terms-and-conditions" className={linkClass}>
              Terms &amp; conditions
            </Link>
          </nav>
        </div>

        <div className="mt-10 border-t border-neutral-200 pt-8">
          <p className="text-center text-[10px] font-semibold uppercase leading-relaxed tracking-[0.12em] text-neutral-900 sm:text-[11px] md:text-xs">
            © Copyright Couple Trails 2024. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

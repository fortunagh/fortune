import Image from "next/image";
import { Cinzel, Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export function MainCtaSection() {
  return (
    <section
      className="relative isolate min-h-[min(72vh,820px)] w-full overflow-hidden bg-[#faf9f6]"
      aria-labelledby="main-cta-heading"
    >
      <Image
        src="/mainbg.png"
        alt=""
        fill
        className="object-cover object-center"
        sizes="100vw"
        quality={90}
      />

      <div className="relative z-10 mx-auto flex min-h-[min(72vh,820px)] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center sm:px-8 sm:py-24 md:py-28">
        <h2
          id="main-cta-heading"
          className={`${cinzel.className} max-w-xl text-balance bg-gradient-to-br from-[#1a1a1a] from-30% via-[#2c2418] to-[#9a7328] bg-clip-text text-[1.15rem] font-bold uppercase leading-[1.12] tracking-[0.06em] text-transparent sm:text-xl sm:leading-[1.1] sm:tracking-[0.08em] md:text-2xl lg:text-[1.85rem]`}
        >
          <span className="block">Private consideration.</span>
          <span className="mt-1 block sm:mt-0.5">Limited availability.</span>
        </h2>

        <p
          className={`${inter.className} mt-6 max-w-md text-pretty text-[15px] font-normal leading-[1.65] text-neutral-700 sm:mt-7 sm:max-w-lg sm:text-[16px] md:mt-8 md:text-[17px]`}
        >
          Access to this environment is granted selectively. Submit your
          request to be considered.
        </p>

        <button
          type="button"
          className={`${cinzel.className} group mt-9 min-w-[min(88vw,280px)] rounded-full bg-[linear-gradient(90deg,#D4AF37_0%,#FFD988_46%,#D4AF37_100%)] px-10 py-3.5 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-neutral-900 shadow-sm transition-transform duration-300 ease-out will-change-transform hover:scale-[1.045] hover:shadow-[0_14px_36px_rgba(0,0,0,0.22)] active:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9f6] sm:mt-10 sm:min-w-[300px] sm:px-12 sm:py-4 sm:text-[0.78rem] md:mt-12 md:min-w-[320px] md:text-[0.82rem]`}
        >
          Request access
        </button>
      </div>
    </section>
  );
}

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

const body =
  "An exclusive, invitation-only environment for those who expect performance—not promises. Where institutional-grade execution, disciplined architecture, and consistency converge—secured within a private, controlled framework.";

export function Hero() {
  return (
    <section
      className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-white hero-banner"
      aria-label="Fortuna Global Holdings"
    >
      {/* <Image
        src="/Hero.png"
        alt=""
        fill
        priority
        className="object-cover object-[center_40%] md:object-center"
        sizes="100vw"
      /> */}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/50" />

      <div className=" banner-inner-row  relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col items-center px-5 pb-14 pt-8 text-center md:px-10 md:pb-20 md:pt-12 lg:pt-16">
        <Image
          src="/logo.png"
          alt="Fortuna Global Holdings — Building infinite abundance"
          width={320}
          height={280}
          priority
          className="h-auto w-[min(72vw,220px)] sm:w-[min(60vw,260px)] md:w-[min(48vw,300px)] lg:w-[340px]"
        />

        <h1
          className={`${ cinzel.className } !font-engravers heading-bg mt-8 max-w-[20ch] text-balance bg-gradient-to-b from-[#c6a035] via-[#f3e5a6] to-[#8a6d1e] bg-clip-text px-2 text-[1.25rem] font-semibold uppercase leading-[1.2] tracking-[0.06em] text-transparent sm:mt-10 sm:max-w-none sm:text-[1.75rem] sm:tracking-[0.08em] md:mt-12 md:text-[2.1rem] md:leading-[1.22] lg:text-[2.5rem] xl:text-[2.65rem]`}
        >
          <span className="block higher-heading !text-[24px] font-[Engravers MT] not-italic font-medium md:!text-[36px] lg:!text-[46px] leading-[54px] flex items-center text-center text-[#111111] [text-shadow:0px_4px_4px_rgba(0,0,0,0.25)]">A higher standard of</span>
          <span className="block access-heading !text-[24px] font-[Engravers MT] not-italic font-medium md:!text-[36px] lg:!text-[46px] leading-[54px] flex items-center text-center text-[#111111] [text-shadow:0px_4px_4px_rgba(0,0,0,0.25)] justify-center">access</span>
        </h1>

       
        

        <p
          className={`${inter.className}  `}
        >
          {body}
        </p>

        <button
          type="button"
          className={`${cinzel.className} group mt-9 min-w-[min(88vw,280px)] rounded-full bg-[linear-gradient(90deg,#D4AF37_0%,#FFD988_46%,#D4AF37_100%)] px-10 py-3.5 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-neutral-900 shadow-sm transition-transform duration-300 ease-out will-change-transform hover:scale-[1.045] hover:shadow-[0_14px_36px_rgba(0,0,0,0.22)] active:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:mt-10 sm:min-w-[300px] sm:px-12 sm:py-4 sm:text-[0.78rem] md:mt-12 md:min-w-[320px] md:text-[0.82rem]`}
        >
          Request access
        </button>
      </div>
    </section>
  );
}

import { RequestAccessButton } from "@/components/landing/request-access-dialog";
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
      className="relative isolate w-full overflow-hidden bg-white hero-banner"
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
          className=" fortune-logo h-[303px] object-contain w-[min(72vw,220px)] sm:w-[min(60vw,260px)] md:w-[min(48vw,293px)] lg:w-[293px] lg:w-[392px] lg:h-[405px]"
        />

        <h1
          className={`${ cinzel.className } !font-engravers heading-bg mt-8 max-w-[20ch] text-balance bg-gradient-to-b from-[#c6a035] via-[#f3e5a6] to-[#8a6d1e] bg-clip-text px-2 text-[1.25rem] font-semibold uppercase leading-[1.2] tracking-[0.06em] text-transparent sm:mt-10 sm:max-w-none sm:text-[1.75rem] sm:tracking-[0.08em] md:mt-12 md:text-[2.1rem] md:leading-[1.22] lg:text-[2.5rem] xl:text-[2.65rem]`}
        >
          <span className="block higher-heading !text-[24px] font-[Engravers MT] not-italic font-medium md:!text-[36px] lg:!text-[59px] leading-[54px] flex items-center text-center text-[#111111] leading-normal tracking-normal  [text-shadow:0px_4px_4px_rgba(0,0,0,0.25)]">A higher standard </span>
          <span className="block access-heading !text-[24px] font-[Engravers MT] not-italic font-medium md:!text-[36px] lg:!text-[59px] leading-[54px] flex items-center text-center text-[#111111]  leading-normal tracking-normal [text-shadow:0px_4px_4px_rgba(0,0,0,0.25)] justify-center"> of access</span>
        </h1>

       
        

    

        <RequestAccessButton className="mt-9 sm:mt-10 md:mt-12" />
      </div>
    </section>
  );
}

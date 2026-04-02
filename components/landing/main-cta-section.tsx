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

export function MainCtaSection() {
  return (
    <section
      className="  Private-consideration relative isolate min-h-[min(72vh,820px)] w-full overflow-hidden bg-[#faf9f6]"
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

      <div className="relative z-10 mx-auto flex min-h-[min(72vh,820px)] max-w-6xl flex-col items-center justify-center px-6 py-20 text-center sm:px-8 sm:py-24 md:py-28">
        <h2
          id="main-cta-heading"
          className={`${cinzel.className}  text-[24px] md:font-[Engravers_MT] md:text-[48px] md:leading-[47px] md:font-medium md:text-black`}
        >
          <span className="block">Private consideration</span>
          <span className="mt-1 block sm:mt-0.5">Limited availability</span>
        </h2>

        <p
          className={`${inter.className} mt-[25px] mb-[25px] `}
        >
          Access to this environment is granted selectively. Submit your
          request to be considered.
        </p>

        <RequestAccessButton
          className="mt-0"
          ringOffsetClassName="focus-visible:ring-offset-[#faf9f6]"
        />
      </div>
    </section>
  );
}

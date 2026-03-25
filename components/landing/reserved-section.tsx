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

export function ReservedSection() {
  return (
    <section
      className=" every-thing-main bg-white px-5 py-16 md:px-10 md:py-24 lg:py-28"
      aria-labelledby="reserved-heading"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="reserved-heading"
          className={`${cinzel.className} bg-gradient-to-b from-[#c6a035] via-[#f3e5a6] to-[#8a6d1e] bg-clip-text text-[1.35rem] font-bold uppercase leading-[1.2] tracking-[0.06em] text-transparent sm:text-2xl sm:tracking-[0.08em] md:text-[2rem] md:leading-[1.22] lg:text-[2.35rem]`}
        >
          <span className="block">Not everything is</span>
          <span className="block">built for everyone.</span>
        </h2>

        <div
          className={`${inter.className} mx-auto mt-10 max-w-[38rem] space-y-4 text-pretty text-[15px] leading-[1.6] text-black/80 md:mt-12 md:space-y-5 md:text-[17px] lg:text-[18px]`}
        >
          <p>
            This environment is reserved for individuals who operate with
            intent—and follow through with consistency.
          </p>
          <p>
            The opportunity is reserved for those who understand that
            precision, disciplined execution, and long-term outcomes matter.
          </p>
        </div>
      </div>
    </section>
  );
}

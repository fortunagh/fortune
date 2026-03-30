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
        <p className="pb-[30px] lg:pb-[60px]"> An exclusive, invitation-only environment for those who expect performance—not promises.
          Where institutional-grade execution, disciplined architecture, and consistency converge—secured within a private,
           controlled framework. </p>
        <h2
          id="reserved-heading"
          className={`${cinzel.className} text-[22px] md:font-[Engravers_MT] md:text-[40px] md:leading-[47px] md:font-medium md:text-black`}
        >
          <span className="block">Not everything is</span>
          <span className="block">built for everyone.</span>
        </h2>

        <div
          className={`${inter.className}  para-graph`}
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

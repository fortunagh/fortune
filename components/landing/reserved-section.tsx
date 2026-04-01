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
      <div className="wrapper mx-auto max-w-3xl text-center">
        <p className="top-para-wrapper pb-[30px] lg:pb-[60px]"> An exclusive, invitation-only environment for those who expect performance—not promises.
          Where institutional-grade execution, disciplined architecture, and consistency converge—secured within a private,
           controlled framework. </p>
        <h2
          id="reserved-heading"
          className={`${cinzel.className} text-[22px] md:font-[Engravers_MT] md:text-[36px] md:leading-[38px] md:font-medium md:text-black`}
        >
          <span className="block">Not everything is built for everyone.</span>
        </h2>

        <div
          className={`${inter.className}  para-graph`}
        >
          <p>
           This environment is reserved for individuals who understand that performance is engineered—not assumed.
           Fortunex is designed on the principle that discipline must exist within the system itself—where execution is structured, risk is managed, and outcomes are approached with precision.
          </p>
          <p>
            The opportunity is reserved for those who understand that consistency is not achieved through prediction—but through architecture across varying market conditions.
          </p>
        </div>
      </div>
    </section>
  );
}

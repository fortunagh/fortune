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

const items = [
  {
    icon: "/4.png",
    title: "Private consideration",
    description:
      "Limited availability. Participation is reviewed selectively.",
  },
  {
    icon: "/5.png",
    title: "Invitation only",
    description:
      "Access is granted exclusively through approved invitations.",
  },
  {
    icon: "/6.png",
    title: "Confidential review",
    description: "All submissions are handled with complete discretion.",
  },
] as const;

const ctaButtonClass = `${cinzel.className} group min-w-[min(88vw,280px)] rounded-full bg-[linear-gradient(90deg,#D4AF37_0%,#FFD988_46%,#D4AF37_100%)] px-10 py-3.5 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-neutral-900 shadow-sm transition-transform duration-300 ease-out will-change-transform hover:scale-[1.045] hover:shadow-[0_14px_36px_rgba(0,0,0,0.22)] active:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:min-w-[300px] sm:px-12 sm:py-4 sm:text-[0.78rem] md:min-w-[320px] md:text-[0.82rem]`;

export function AccessQualificationSection() {
  return (
    <section
      className="bg-white px-5 py-16 md:px-10 md:py-24 lg:py-28"
      aria-labelledby="access-qualification-heading"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="access-qualification-heading"
          className={`${cinzel.className} mx-auto max-w-3xl text-balance bg-gradient-to-b from-[#c6a035] via-[#f3e5a6] to-[#8a6d1e] bg-clip-text text-center text-[1.2rem] font-bold uppercase leading-tight tracking-[0.06em] text-transparent sm:text-xl sm:tracking-[0.08em] md:text-2xl lg:text-[1.75rem]`}
        >
          <span className="block sm:inline">Access &amp; qualification</span>
        </h2>

        <ul className="mt-12 grid list-none grid-cols-1 gap-8 sm:mt-14 md:mt-16 md:grid-cols-3 md:gap-8 lg:gap-10">
          {items.map((item) => (
            <li key={item.title}>
              <article className="flex h-full flex-col items-center rounded-xl border border-neutral-200/90 bg-white px-6 py-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:px-8 sm:py-10">
                <Image
                  src={item.icon}
                  alt=""
                  width={80}
                  height={80}
                  className="h-[72px] w-[72px] object-contain sm:h-20 sm:w-20"
                />
                <h3
                  className={`${cinzel.className} mt-6 max-w-[22ch] bg-gradient-to-b from-[#9a7328] via-[#c9a227] to-[#e8c547] bg-clip-text text-xs font-bold uppercase leading-snug tracking-[0.11em] text-transparent sm:max-w-none sm:text-sm md:text-[0.95rem]`}
                >
                  {item.title}
                </h3>
                <p
                  className={`${inter.className} mt-3 max-w-[28ch] text-pretty text-[13px] font-normal leading-relaxed text-neutral-600 sm:max-w-none sm:text-[14px] md:text-[15px]`}
                >
                  {item.description}
                </p>
              </article>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex justify-center sm:mt-14 md:mt-16">
          <button type="button" className={ctaButtonClass}>
            Request access
          </button>
        </div>
      </div>
    </section>
  );
}

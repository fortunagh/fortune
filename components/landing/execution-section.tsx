import Image from "next/image";
import { Cinzel, Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const cards = [
  {
    icon: "/1.png",
    title: "No apps",
    description: "Focused on performance, not promises",
  },
  {
    icon: "/2.png",
    title: "No ads",
    description: "A clear, disciplined environment for execution.",
  },
  {
    icon: "/3.png",
    title: "No noise.",
    description: "Only what matters—nothing unnecessary.",
  },
] as const;

export function ExecutionSection() {
  return (
    <section
      className="bg-white px-5 pb-16 pt-6 md:px-10 md:pb-24 md:pt-8 lg:pb-28"
      aria-labelledby="execution-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex justify-center px-2">
          <Image
            src="/separator.png"
            alt=""
            width={720}
            height={24}
            className="h-auto w-full max-w-2xl object-contain md:max-w-3xl"
          />
        </div>

        <h2
          id="execution-heading"
          className={`${cinzel.className} mx-auto mt-10 max-w-4xl text-balance bg-gradient-to-r from-neutral-950 via-[#b8942a] to-[#f0d78c] bg-clip-text px-2 text-center text-[1.05rem] font-bold uppercase leading-tight tracking-[0.06em] text-transparent sm:mt-12 sm:text-xl sm:tracking-[0.08em] md:text-2xl lg:text-[1.65rem] lg:leading-snug xl:text-[1.85rem]`}
        >
          Execution without compromise
        </h2>

        <p
          className={`${inter.className} mx-auto mt-6 max-w-2xl text-pretty text-center text-[15px] font-medium leading-[1.6] text-black/75 sm:mt-7 sm:text-[16px] md:mt-8 md:max-w-[42rem] md:text-[17px] lg:text-[18px]`}
        >
          A platform grounded in clarity and focus, executed with
          discipline—outcomes are approached with consistency, free from
          narrative, emotion, and unnecessary complexity.
        </p>

        <ul className="mt-12 grid list-none grid-cols-1 gap-6 sm:mt-14 md:mt-16 md:grid-cols-3 md:gap-8">
          {cards.map((card) => (
            <li key={card.title}>
              <article className="flex h-full flex-col items-center rounded-xl border border-neutral-200/90 bg-white px-6 py-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:px-8 sm:py-10">
                <Image
                  src={card.icon}
                  alt=""
                  width={80}
                  height={80}
                  className="h-[72px] w-[72px] object-contain sm:h-20 sm:w-20"
                />
                <h3
                  className={`${cinzel.className} mt-6 text-base font-bold uppercase tracking-[0.08em] text-neutral-950 sm:text-lg`}
                >
                  {card.title}
                </h3>
                <p
                  className={`${inter.className} mt-3 max-w-[22ch] text-[14px] leading-relaxed text-black/65 sm:max-w-none sm:text-[15px]`}
                >
                  {card.description}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

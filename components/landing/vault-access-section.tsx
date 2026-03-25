import Image from "next/image";
import { Cinzel } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export function VaultAccessSection() {
  return (
    <section
      className="relative isolate min-h-[58vh] w-full overflow-hidden bg-[#f4f4f2] md:min-h-[min(78vh,880px)]"
      aria-labelledby="vault-access-heading"
    >
      <Image
        src="/leftvailtbg.png"
        alt=""
        fill
        className="object-cover object-[22%_center] sm:object-[18%_center] md:object-left md:object-center"
        sizes="100vw"
        quality={90}
      />

      <div className="relative z-10 mx-auto grid min-h-[58vh] max-w-7xl md:min-h-[min(78vh,880px)] md:grid-cols-2">
        <div className="hidden min-h-0 md:block" aria-hidden />

        <div className="flex flex-col justify-center px-6 py-14 sm:px-8 sm:py-16 md:bg-transparent md:px-8 md:py-20 md:pl-6 lg:px-12 lg:pl-10 lg:pr-14 xl:pr-20">
          <div className="rounded-2xl bg-white/88 px-5 py-8 shadow-sm backdrop-blur-md sm:px-7 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
            <h2
              id="vault-access-heading"
              className={`${cinzel.className} max-w-lg text-balance bg-gradient-to-br from-[#1a1a1a] from-35% via-[#2a2419] to-[#a67c32] bg-clip-text text-[1.35rem] font-bold uppercase leading-[1.08] tracking-[0.05em] text-transparent sm:text-2xl md:text-[1.65rem] md:leading-[1.06] lg:text-[1.85rem] xl:text-[2rem]`}
            >
              <span className="block">Vault &amp; access</span>
              <span className="block">positioning</span>
            </h2>

            <p
              className={`${cinzel.className} mt-4 max-w-lg text-[0.7rem] font-semibold uppercase leading-snug tracking-[0.12em] text-neutral-900 sm:mt-5 sm:text-xs md:text-[0.8rem] md:tracking-[0.14em]`}
            >
              Access is not open. It is secured.
            </p>

            <p className="mt-5 max-w-md text-pretty text-[15px] font-normal leading-[1.65] text-neutral-600 sm:mt-6 sm:text-[16px] md:mt-7 md:text-[17px]">
              This is a controlled environment—where participation is limited,
              and entry is considered.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

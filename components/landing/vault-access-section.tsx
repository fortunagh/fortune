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
      className="Vault-main relative isolate min-h-[58vh] w-full overflow-hidden bg-[#f4f4f2] md:min-h-[min(78vh,880px)]"
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
              className={`${cinzel.className} text-[22px] text-start md:font-[Engravers_MT] md:text-[40px] md:leading-[47px] md:font-medium md:text-black`}
            >
              <span className="block">Vault &amp; access</span>
              <span className="block">positioning</span>
            </h2>

            <p
              className={`${cinzel.className} " font text-[20px] !mt-[10px] mb-[10px] md:!mt-[30px] md:mb-[30px]  md:!font-[Engravers_MT] md:text-[30px] md:leading-[160%] md:font-medium md:text-black/80`}
            >
              Access is not open. It is secured.
            </p>

            <p className="">
              This is a controlled environment—where participation is limited,
              and entry is considered.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

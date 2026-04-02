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
      className="Vault-main relative isolate w-full overflow-hidden bg-[#f4f4f2] ]"
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

      <div className="access-wrapper relative z-10  mx-auto grid  md:grid-cols-1">
    

        <div className="flex flex-col justify-center px-0 py-14 sm:px-0 sm:py-16 md:px-0 md:bg-transparent md:py-20 md:pl-0 md:pr-0 lg:px-0 lg:pl-0 lg:pr-0 xl:px-0">
          <div className="inner-arapp rounded-2xl bg-white/88 px-5 py-8 shadow-sm backdrop-blur-md sm:px-7 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
            <h2
              id="vault-access-heading"
              className={`${cinzel.className} !mb-[30px] text-[22px] text-start md:font-[Engravers_MT] md:text-[40px] md:leading-[47px] md:font-medium md:text-black`}
            >
              <span className="block text-left">Access is not open. It is secured. </span>
        
            </h2>

            <p className="">
              This is a controlled environment—where participation is limited, and entry is considered.
            </p>
            <p className="mt-5">
              Designed for those who recognise that capital is preserved through discipline, and grown through consistency.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

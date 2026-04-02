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

const items = [
  {
    id: "participation-1",
    icon: "/4.png",
    title: "Participation is assessed.",

  },
  {
    id: "participation-2",
    icon: "/5.png",
    title: "Access is granted selectively, alignment is required.",

  },
  {
    id: "confidential-1",
    icon: "/6.png",
    title: "All requests are reviewed confidentially.",
  },
    {
    id: "confidential-2",
    icon: "/new7.png",
    title: "Admission is controlled.",
  },
] as const;

export function AccessQualificationSection() {
  return (
    <section
      className="Access-main bg-white px-5 py-16 md:px-10 md:py-24 lg:py-28"
      aria-labelledby="access-qualification-heading"
    >
      <div className="mx-auto max-w-7xl">
        <h2
          id="access-qualification-heading"
          className={`${cinzel.className}   text-[22px] text-center md:font-[Engravers_MT] md:text-[34px] md:leading-[47px] md:font-medium md:text-black`}
        >
          <span className="block sm:inline">Access &amp; qualification</span>
        </h2>

        <ul className=" access-grid mt-[20px] grid items-center list-none grid-cols-1 gap-8 sm:mt-14 md:mt-[34px] md:grid-cols-4 md:gap-8 lg:gap-10">
          {items.map((item) => (
            <li key={item.id}>
              <article className=" access-grid-grid flex h-full flex-col items-center rounded-xl border border-neutral-200/90 bg-white px-6 py-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:px-8 sm:py-10">
                <Image
                  src={item.icon}
                  alt=""
                  width={80}
                  height={80}
                  className="h-[72px] w-[72px] object-contain sm:h-20 sm:w-20"
                />
                <h3
                  className={`${cinzel.className} mt-6 max-w-[22ch] bg-gradient-to-b from-[#9a7328] via-[#c9a227] to-[#e8c547] bg-clip-text text-xs font-bold uppercase leading-snug tracking-[0.11em] text-transparent sm:max-w-none sm:text-sm md:text-[0.95rem] font-sixe-custom`}
                >
                  {item.title}
                </h3>
             
              </article>
            </li>
          ))}
        </ul>

        <div className="mt-[25px] flex justify-center sm:mt-14 md:mt-[34px]">
          <RequestAccessButton />
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Register Now — Stage QR",
  description:
    "Scan to register with Fortuna Global Holdings during the live presentation.",
  robots: {
    index: false,
    follow: false,
  },
};

const registerUrl = "https://www.fortunaglobalholdings.com/register";

export default function PresentPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f5f1ea] px-6 py-10 text-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#a84d0b]">
        Fortuna Global Holdings
      </p>
      <h1 className="mb-2 font-serif text-4xl tracking-tight text-neutral-900 sm:text-5xl md:text-6xl">
        Register Now
      </h1>
      <p className="mb-10 max-w-xl text-base text-neutral-600 sm:text-lg">
        Scan the code to open the registration page on your phone.
      </p>

      <div className="rounded-3xl border border-[#b9764a40] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-10">
        <Image
          src="/event/register-qr.png"
          alt="QR code linking to Fortuna registration"
          width={1024}
          height={1024}
          priority
          className="h-auto w-[min(72vw,420px)]"
        />
      </div>

      <p className="mt-8 break-all font-mono text-sm text-neutral-700 sm:text-base md:text-lg">
        {registerUrl}
      </p>
    </main>
  );
}

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
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12 text-center sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[#f5f1ea]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(168,77,11,0.12),transparent_55%),radial-gradient(ellipse_70%_50%_at_50%_100%,rgba(185,118,74,0.1),transparent_50%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "url('/fortuna/artwork-plate.png')",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          backgroundSize: "min(1400px, 160%) auto",
        }}
      />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
        <div className="present-fade-in mb-8 sm:mb-10">
          <Image
            src="/fortuna/logo-header.png"
            alt="Fortuna Global Holdings — Building Infinite Abundance"
            width={1005}
            height={258}
            priority
            quality={100}
            unoptimized
            className="mx-auto h-auto w-[min(360px,78vw)] sm:w-[min(420px,70vw)]"
          />
        </div>

        <div
          aria-hidden="true"
          className="present-fade-in present-delay-1 mb-6 h-px w-16 bg-[#a84d0b]/60 sm:mb-8"
        />

        <h1 className="present-fade-in present-delay-1 mb-3 font-serif text-4xl tracking-tight text-neutral-900 sm:text-5xl md:text-6xl">
          Register Now
        </h1>
        <p className="present-fade-in present-delay-2 mb-8 max-w-lg text-base leading-relaxed text-neutral-600 sm:mb-10 sm:text-lg">
          Scan the code to open the registration page on your phone.
        </p>

        <div className="present-fade-in present-delay-3 relative">
          <div
            aria-hidden="true"
            className="present-pulse absolute -inset-3 rounded-[2rem] bg-[#a84d0b]/10 blur-xl sm:-inset-4"
          />
          <div className="relative rounded-3xl border border-[#b9764a50] bg-white/95 p-5 shadow-[0_24px_80px_rgba(80,40,10,0.12)] backdrop-blur-sm sm:p-8">
            <Image
              src="/event/register-qr.png"
              alt="QR code linking to Fortuna registration"
              width={1024}
              height={1024}
              priority
              className="h-auto w-[min(68vw,380px)]"
            />
          </div>
        </div>

        <p className="present-fade-in present-delay-4 mt-8 break-all font-mono text-sm tracking-wide text-neutral-600 sm:mt-10 sm:text-base md:text-lg">
          {registerUrl}
        </p>
      </div>

      <style>{`
        @keyframes present-fade-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes present-pulse {
          0%, 100% {
            opacity: 0.45;
            transform: scale(0.98);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.02);
          }
        }
        .present-fade-in {
          animation: present-fade-in 0.7s ease-out both;
        }
        .present-delay-1 { animation-delay: 0.12s; }
        .present-delay-2 { animation-delay: 0.22s; }
        .present-delay-3 { animation-delay: 0.34s; }
        .present-delay-4 { animation-delay: 0.46s; }
        .present-pulse {
          animation: present-pulse 3.2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .present-fade-in,
          .present-pulse {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}

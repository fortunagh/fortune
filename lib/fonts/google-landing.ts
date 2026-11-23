import { Cinzel, Inter } from "next/font/google";

/**
 * Single shared next/font instances for landing/present.
 * Next 16 Turbopack breaks when Inter is declared with weight arrays
 * in multiple modules ("queries have exactly one entry").
 */
export const landingInter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const landingCinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

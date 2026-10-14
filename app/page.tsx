import type { Metadata } from "next";

import { FortunaHome } from "@/components/landing/fortuna-home";

export const metadata: Metadata = {
  title: {
    absolute: "Fortuna Global Holdings — Building Infinite Abundance",
  },
  description:
    "Opportunity is the vehicle. Abundance is the vision. Impact is the legacy. Fortuna Global Holdings — Building Infinite Abundance.",
  openGraph: {
    title: "Fortuna Global Holdings — Building Infinite Abundance",
    description:
      "Opportunity is the vehicle. Abundance is the vision. Impact is the legacy.",
  },
  twitter: {
    title: "Fortuna Global Holdings — Building Infinite Abundance",
    description:
      "Opportunity is the vehicle. Abundance is the vision. Impact is the legacy.",
  },
};

export default function Home() {
  return <FortunaHome />;
}

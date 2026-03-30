"use client";

import { SiteFooter } from "@/components/landing/site-footer";
import { usePathname } from "next/navigation";

export function ConditionalSiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/auth")) return null;
  if (pathname.startsWith("/dashboard")) return null;
  return <SiteFooter />;
}

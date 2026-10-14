"use client";

import { SiteFooter } from "@/components/landing/site-footer";
import { usePathname } from "next/navigation";

export function ConditionalSiteFooter() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  if (pathname.startsWith("/auth")) return null;
  if (pathname.startsWith("/dashboard")) return null;
  if (pathname.startsWith("/present")) return null;
  if (pathname.startsWith("/register")) return null;
  return <SiteFooter />;
}

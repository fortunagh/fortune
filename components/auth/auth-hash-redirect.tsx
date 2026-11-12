"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Supabase invite/recovery links sometimes land on Site URL (/) with tokens
 * or errors in the hash. Forward those to the set-password / error pages.
 */
export function AuthHashRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;

    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const error = params.get("error");
    const errorCode = params.get("error_code");
    const errorDescription = params.get("error_description");
    const accessToken = params.get("access_token");
    const type = params.get("type");

    const isAuthCallback =
      Boolean(accessToken) ||
      type === "invite" ||
      type === "recovery" ||
      type === "signup" ||
      type === "magiclink" ||
      Boolean(error);

    if (!isAuthCallback) return;

    // Already on the right page — leave hash for Supabase client to parse.
    if (
      pathname.startsWith("/auth/update-password") ||
      pathname.startsWith("/auth/error") ||
      pathname.startsWith("/auth/confirm")
    ) {
      return;
    }

    if (error || errorCode) {
      const q = new URLSearchParams();
      if (errorDescription) q.set("error", errorDescription.replace(/\+/g, " "));
      else if (errorCode) q.set("error", errorCode);
      else if (error) q.set("error", error);
      router.replace(`/auth/error?${q.toString()}`);
      return;
    }

    // Preserve the hash so update-password can establish the session.
    router.replace(`/auth/update-password${hash}`);
  }, [pathname, router]);

  return null;
}

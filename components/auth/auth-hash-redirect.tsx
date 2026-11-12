"use client";

import { useEffect } from "react";

/**
 * Supabase invite/recovery links sometimes land on Site URL (/) with tokens
 * or errors in the hash. Forward those to the set-password / error pages.
 * Uses window.location only so it does not block static prerender.
 */
export function AuthHashRedirect() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;

    const pathname = window.location.pathname;
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
      window.location.replace(`/auth/error?${q.toString()}`);
      return;
    }

    window.location.replace(`/auth/update-password${hash}`);
  }, []);

  return null;
}

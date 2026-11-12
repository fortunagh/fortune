"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  authCardClass,
  authCardDescriptionClass,
  authCardTitleClass,
  authErrorTextClass,
} from "@/components/auth/auth-ui-classes";
import { createClient } from "@/lib/supabase/client";

function ActivateInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) setError("Missing invitation token.");
  }, [token]);

  async function activate() {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/auth/login?next=/auth/activate?token=${token}`);
        return;
      }
      const res = await fetch("/api/onboarding/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Activation failed");
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Activation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className={authCardClass}>
      <CardHeader>
        <CardTitle className={authCardTitleClass}>Activate access</CardTitle>
        <CardDescription className={authCardDescriptionClass}>
          Confirm your invitation to open the Fortuna onboarding portal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className={authErrorTextClass}>{error}</p> : null}
        <Button
          type="button"
          variant="fortuna"
          size="lg"
          className="w-full"
          disabled={!token || busy}
          onClick={activate}
        >
          {busy ? "Activating…" : "Activate my Fortuna account"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={<p className="text-sm">Loading…</p>}>
      <ActivateInner />
    </Suspense>
  );
}

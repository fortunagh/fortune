"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { fortunaUiClass } from "@/lib/fonts/fortuna";
import { cn } from "@/lib/utils";

export function LiveInstallActions({
  payload,
}: {
  payload: Record<string, unknown>;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const liveApproved = Boolean(payload.live_licence_approved);
  const eaInstalled = Boolean(payload.ea_installed);
  const equityProtect = Boolean(payload.equity_protect);

  async function confirm(partial: Record<string, boolean>) {
    setBusy(Object.keys(partial)[0] ?? "save");
    setError(null);
    try {
      const res = await fetch("/api/onboarding/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepKey: "live_install",
          payload: {
            live_licence_approved: liveApproved,
            ea_installed: eaInstalled,
            equity_protect: equityProtect,
            ...partial,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save");
      router.refresh();
      if (
        (partial.live_licence_approved || liveApproved) &&
        (partial.ea_installed || eaInstalled) &&
        (partial.equity_protect || equityProtect)
      ) {
        router.push("/dashboard");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={cn(fortunaUiClass, "space-y-3")}>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        type="button"
        variant={liveApproved ? "secondary" : "fortuna"}
        className="w-full sm:w-auto"
        disabled={liveApproved || busy !== null}
        onClick={() => confirm({ live_licence_approved: true })}
      >
        {liveApproved
          ? "Live licence confirmed"
          : busy === "live_licence_approved"
            ? "Saving…"
            : "My live EA licence is approved"}
      </Button>
      <Button
        type="button"
        variant={eaInstalled ? "secondary" : "fortuna"}
        className="w-full sm:w-auto"
        disabled={!liveApproved || eaInstalled || busy !== null}
        onClick={() => confirm({ ea_installed: true })}
      >
        {eaInstalled
          ? "EA installed"
          : busy === "ea_installed"
            ? "Saving…"
            : "I’ve installed the EA on my live account"}
      </Button>
      <Button
        type="button"
        variant={equityProtect ? "secondary" : "fortuna"}
        className="w-full sm:w-auto"
        disabled={!liveApproved || equityProtect || busy !== null}
        onClick={() => confirm({ equity_protect: true })}
      >
        {equityProtect
          ? "Equity Protect configured"
          : busy === "equity_protect"
            ? "Saving…"
            : "I’ve configured Equity Protect on my live account"}
      </Button>
    </div>
  );
}

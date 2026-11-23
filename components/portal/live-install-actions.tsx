"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useNavProgress } from "@/components/portal/navigation-progress";
import { fortunaUiClass } from "@/lib/fonts/fortuna";
import { cn } from "@/lib/utils";

export function LiveInstallActions({
  payload,
}: {
  payload: Record<string, unknown>;
}) {
  const router = useRouter();
  const { start: startNav, done: doneNav } = useNavProgress();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const inflight = React.useRef(false);

  const liveApproved = Boolean(payload.live_licence_approved);
  const eaInstalled = Boolean(payload.ea_installed);
  const equityProtect = Boolean(payload.equity_protect);

  async function confirm(partial: Record<string, boolean>) {
    if (inflight.current) return;
    inflight.current = true;
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
      const allDone =
        (partial.live_licence_approved || liveApproved) &&
        (partial.ea_installed || eaInstalled) &&
        (partial.equity_protect || equityProtect);
      if (allDone) {
        startNav();
        const next =
          typeof json.nextStepKey === "string" && json.nextStepKey
            ? json.nextStepKey
            : "live_activation";
        router.push(`/dashboard/steps/${next}`);
      }
      router.refresh();
      inflight.current = false;
      setBusy(null);
    } catch (e) {
      doneNav();
      setError(e instanceof Error ? e.message : "Error");
      inflight.current = false;
      setBusy(null);
    }
  }

  function label(
    done: boolean,
    busyKey: string,
    doneText: string,
    idleText: string,
  ) {
    if (done) return doneText;
    if (busy === busyKey) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving…
        </>
      );
    }
    return idleText;
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
        {label(
          liveApproved,
          "live_licence_approved",
          "Live licence confirmed",
          "My live EA licence is approved",
        )}
      </Button>
      <Button
        type="button"
        variant={eaInstalled ? "secondary" : "fortuna"}
        className="w-full sm:w-auto"
        disabled={!liveApproved || eaInstalled || busy !== null}
        onClick={() => confirm({ ea_installed: true })}
      >
        {label(
          eaInstalled,
          "ea_installed",
          "EA installed",
          "I’ve installed the EA on my live account",
        )}
      </Button>
      <Button
        type="button"
        variant={equityProtect ? "secondary" : "fortuna"}
        className="w-full sm:w-auto"
        disabled={!liveApproved || equityProtect || busy !== null}
        onClick={() => confirm({ equity_protect: true })}
      >
        {label(
          equityProtect,
          "equity_protect",
          "Equity Protect configured",
          "I’ve configured Equity Protect on my live account",
        )}
      </Button>
    </div>
  );
}

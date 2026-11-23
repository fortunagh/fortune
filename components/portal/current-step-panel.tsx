"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getStepDef } from "@/lib/onboarding/steps";
import { fortunaUiClass } from "@/lib/fonts/fortuna";
import { cn } from "@/lib/utils";
import { useNavProgress } from "@/components/portal/navigation-progress";

import {
  BronzeRule,
  Eyebrow,
  NoticeBlock,
  PortalCard,
  PortalSubtitle,
  PortalTitle,
} from "./portal-primitives";

export function CurrentStepPanel({
  stepKey,
  firstName,
  demoDays,
  readinessReady,
}: {
  stepKey: string | null;
  firstName?: string | null;
  demoDays?: number;
  readinessReady?: boolean;
}) {
  const def = stepKey ? getStepDef(stepKey) : null;

  return (
    <PortalCard className="p-6 sm:p-8">
      <Eyebrow>{def?.eyebrow ?? "Onboarding"}</Eyebrow>
      <PortalTitle className="mt-3">
        {firstName ? `Welcome, ${firstName}` : "Welcome"}
      </PortalTitle>
      <BronzeRule className="mt-4" />
      <PortalSubtitle className="mt-4">
        {def?.description ??
          "Your Fortuna onboarding will appear here once your account is activated."}
      </PortalSubtitle>

      {def ? (
        <div className="mt-6 space-y-4">
          <p
            className={cn(
              fortunaUiClass,
              "text-xs font-semibold uppercase tracking-[0.14em] text-foreground",
            )}
          >
            Current step · {def.title}
          </p>
          {stepKey === "demo_readiness" && !readinessReady ? (
            <NoticeBlock>
              Demo practice day {demoDays ?? 0} of 28. The readiness checklist
              unlocks when the timer completes.
            </NoticeBlock>
          ) : null}
          {stepKey === "live_install" ? (
            <NoticeBlock variant="warning">
              <strong>Important — Set and verify Equity Protect before enabling Algo Trading.</strong>{" "}
              You are responsible for risk settings. Fortuna provides software
              installation support.
            </NoticeBlock>
          ) : null}
          {stepKey === "live_activation" || stepKey === "usage_billing" ? (
            <NoticeBlock>
              Software usage fees are billed monthly in arrears. After each
              month ends, Fortuna will issue an invoice for that month’s usage
              fees.
            </NoticeBlock>
          ) : null}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild variant="fortuna">
              <Link href={`/dashboard/steps/${def.key}`}>Continue</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-none">
              <Link href={`/dashboard/support?step=${def.key}`}>
                I need help
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </PortalCard>
  );
}

export function StepActionBar({
  stepKey,
  confirmLabel,
  confirmationKind,
  disabled,
  extraPayload,
}: {
  stepKey: string;
  confirmLabel: string | null;
  confirmationKind: string;
  disabled?: boolean;
  extraPayload?: Record<string, unknown>;
}) {
  const router = useRouter();
  const { start: startNav, done: doneNav } = useNavProgress();
  const [busy, setBusy] = React.useState(false);
  const [waitingSign, setWaitingSign] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inflight = React.useRef(false);

  async function confirm(payload: Record<string, unknown> = {}) {
    if (inflight.current || disabled) return;
    inflight.current = true;
    setBusy(true);
    setError(null);
    try {
      if (confirmationKind === "stripe") {
        startNav();
        const res = await fetch("/api/onboarding/checkout", { method: "POST" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Checkout failed");
        if (json.url) {
          window.location.href = json.url;
          return;
        }
        throw new Error("No checkout URL");
      }
      if (confirmationKind === "dropbox_sign") {
        const res = await fetch("/api/onboarding/agreement", { method: "POST" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Could not start signing");
        if (json.signUrl) {
          window.open(json.signUrl, "_blank", "noopener,noreferrer");
        }
        setWaitingSign(true);
        router.refresh();
        return;
      }

      startNav();
      const res = await fetch("/api/onboarding/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepKey,
          payload: { ...extraPayload, ...payload },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not confirm");
      const next =
        typeof json.nextStepKey === "string" && json.nextStepKey
          ? json.nextStepKey
          : null;
      router.push(next ? `/dashboard/steps/${next}` : "/dashboard");
      router.refresh();
    } catch (e) {
      doneNav();
      setError(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
      inflight.current = false;
    }
  }

  const label = waitingSign
    ? "Waiting for signature…"
    : busy
      ? "Working…"
      : confirmLabel;

  return (
    <div className="space-y-3">
      {error ? (
        <p className={cn(fortunaUiClass, "text-sm text-destructive")}>{error}</p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {confirmLabel ? (
          <Button
            type="button"
            variant="fortuna"
            disabled={disabled || busy || waitingSign}
            onClick={() => confirm()}
          >
            {busy || waitingSign ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {label}
          </Button>
        ) : null}
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={`/dashboard/support?step=${stepKey}`}>I need help</Link>
        </Button>
      </div>
    </div>
  );
}

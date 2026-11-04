"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminStepOverride({
  userId,
  steps,
}: {
  userId: string;
  steps: string[];
}) {
  const router = useRouter();
  const [stepKey, setStepKey] = React.useState(steps[0] ?? "");
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  async function run() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/onboarding/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, stepKey }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Override failed");
      setMessage("Step completed via admin override.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3 border border-border p-4">
      <div className="min-w-[200px] flex-1 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em]">
          Complete step
        </p>
        <Select value={stepKey} onValueChange={setStepKey}>
          <SelectTrigger className="rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {steps.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        variant="fortuna"
        disabled={busy || !stepKey}
        onClick={run}
      >
        {busy ? "Saving…" : "Force complete"}
      </Button>
      {message ? (
        <p className="w-full text-sm text-muted-foreground">{message}</p>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useNavProgress } from "@/components/portal/navigation-progress";
import { fortunaUiClass } from "@/lib/fonts/fortuna";
import { cn } from "@/lib/utils";

export function DemoReadinessForm({ items }: { items: string[] }) {
  const router = useRouter();
  const { start: startNav, done: doneNav } = useNavProgress();
  const [checked, setChecked] = React.useState<boolean[]>(() =>
    items.map(() => false),
  );
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inflight = React.useRef(false);

  const allChecked = checked.every(Boolean);

  async function submit(action: "continue" | "practise") {
    if (action === "practise") {
      startNav();
      router.push("/dashboard");
      return;
    }
    if (!allChecked || inflight.current) {
      setError("Confirm all seven items to continue.");
      return;
    }
    inflight.current = true;
    setBusy(true);
    setError(null);
    try {
      startNav();
      const res = await fetch("/api/onboarding/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepKey: "demo_readiness",
          payload: {
            checklist: items.map((label, i) => ({
              label,
              checked: checked[i],
            })),
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not confirm");
      const next =
        typeof json.nextStepKey === "string" && json.nextStepKey
          ? json.nextStepKey
          : "live_licence_apply";
      router.push(`/dashboard/steps/${next}`);
      router.refresh();
    } catch (e) {
      doneNav();
      setError(e instanceof Error ? e.message : "Error");
      setBusy(false);
      inflight.current = false;
    }
  }

  return (
    <div className={cn(fortunaUiClass, "space-y-4")}>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <Checkbox
              id={`ready-${i}`}
              checked={checked[i]}
              onCheckedChange={(c) =>
                setChecked((prev) => {
                  const next = [...prev];
                  next[i] = c === true;
                  return next;
                })
              }
            />
            <Label
              htmlFor={`ready-${i}`}
              className="text-sm font-normal leading-snug"
            >
              {item}
            </Label>
          </li>
        ))}
      </ul>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="fortuna"
          disabled={busy || !allChecked}
          onClick={() => submit("continue")}
        >
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {busy ? "Working…" : "Confirm and continue"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          disabled={busy}
          onClick={() => submit("practise")}
        >
          Keep practising
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/dashboard/support?step=demo_readiness">I need help</Link>
        </Button>
      </div>
    </div>
  );
}

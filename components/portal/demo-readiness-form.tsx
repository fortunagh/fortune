"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { fortunaUiClass } from "@/lib/fonts/fortuna";
import { cn } from "@/lib/utils";

export function DemoReadinessForm({ items }: { items: string[] }) {
  const router = useRouter();
  const [checked, setChecked] = React.useState<boolean[]>(
    () => items.map(() => false),
  );
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const allChecked = checked.every(Boolean);

  async function submit(action: "continue" | "practise") {
    if (action === "practise") {
      router.push("/dashboard");
      return;
    }
    if (!allChecked) {
      setError("Confirm all seven items to continue.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepKey: "demo_readiness",
          payload: { checklist: items.map((label, i) => ({ label, checked: checked[i] })) },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not confirm");
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
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
            <Label htmlFor={`ready-${i}`} className="text-sm leading-snug font-normal">
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
          Confirm and continue
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-none"
          disabled={busy}
          onClick={() => submit("practise")}
        >
          Keep practising
        </Button>
        <Button asChild variant="ghost" className="rounded-none">
          <a href="/dashboard/support?step=demo_readiness">I need help</a>
        </Button>
      </div>
    </div>
  );
}

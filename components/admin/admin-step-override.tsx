"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  steps: { key: string; title: string }[];
}) {
  const router = useRouter();
  const [stepKey, setStepKey] = React.useState(steps[0]?.key ?? "");
  const [busy, setBusy] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  async function run() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/onboarding/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, stepKey }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Override failed");
      toast.success("Step marked complete");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Override failed");
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  }

  const selectedTitle =
    steps.find((s) => s.key === stepKey)?.title ?? stepKey;

  return (
    <>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[200px] flex-1 space-y-1.5">
          <p className="text-xs font-medium text-neutral-500">Complete step</p>
          <Select value={stepKey} onValueChange={setStepKey}>
            <SelectTrigger className="h-8 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {steps.map((s) => (
                <SelectItem key={s.key} value={s.key}>
                  {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="fortuna"
          size="sm"
          disabled={busy || !stepKey}
          onClick={() => setConfirmOpen(true)}
        >
          Force complete
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Force complete this step?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks “{selectedTitle}” complete for the client and may unlock
              the next step without their confirmation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={run} disabled={busy}>
              {busy ? "Saving…" : "Force complete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

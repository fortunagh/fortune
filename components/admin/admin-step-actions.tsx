"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { CheckCircle2, RotateCcw } from "lucide-react";

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

type Action = "complete" | "undo";

export function AdminStepActions({
  userId,
  stepKey,
  stepTitle,
  status,
  canUndo,
  canComplete,
}: {
  userId: string;
  stepKey: string;
  stepTitle: string;
  status: string;
  canUndo: boolean;
  canComplete: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [pending, setPending] = React.useState<Action | null>(null);

  async function run() {
    if (!pending) return;
    setBusy(true);
    try {
      const url =
        pending === "complete"
          ? "/api/admin/onboarding/override"
          : "/api/admin/onboarding/undo";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, stepKey }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Action failed");
      toast.success(
        pending === "complete"
          ? `Marked “${stepTitle}” complete`
          : `Undid “${stepTitle}” — later steps locked`,
      );
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  if (!canComplete && !canUndo) {
    return (
      <span className="text-[11px] text-neutral-400 capitalize">{status}</span>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        {canComplete ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 gap-1 rounded-lg px-2 text-[11px]"
            disabled={busy}
            onClick={() => setPending("complete")}
          >
            <CheckCircle2 className="h-3 w-3" />
            Complete
          </Button>
        ) : null}
        {canUndo ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 gap-1 rounded-lg px-2 text-[11px] text-amber-900 hover:bg-amber-50 hover:text-amber-950"
            disabled={busy}
            onClick={() => setPending("undo")}
          >
            <RotateCcw className="h-3 w-3" />
            Undo
          </Button>
        ) : null}
      </div>

      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setPending(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending === "complete"
                ? "Force complete this step?"
                : "Undo this step?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending === "complete"
                ? `Marks “${stepTitle}” complete and may unlock the next step without the client’s confirmation.`
                : `Reopens “${stepTitle}” as the current step and locks every later step. Related timers and questionnaire answers after this point are cleared.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={run} disabled={busy}>
              {busy
                ? "Saving…"
                : pending === "complete"
                  ? "Force complete"
                  : "Undo step"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

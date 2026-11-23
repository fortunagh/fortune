"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";

type Mode = "reset" | "wipe" | null;

export function AdminClientDanger({
  userId,
  email,
  requiresOnboardingFee,
}: {
  userId: string;
  email: string | null;
  requiresOnboardingFee: boolean;
}) {
  const router = useRouter();
  const [confirmEmail, setConfirmEmail] = React.useState("");
  const [clearRelated, setClearRelated] = React.useState(true);
  const [requireFee, setRequireFee] = React.useState(requiresOnboardingFee);
  const [busy, setBusy] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>(null);

  const expected = (email ?? "").trim().toLowerCase();
  const typed = confirmEmail.trim().toLowerCase();
  const matches = Boolean(expected && typed === expected);

  async function run() {
    if (!matches || !mode) return;
    setBusy(true);
    try {
      if (mode === "reset") {
        const res = await fetch("/api/admin/clients/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            confirmEmail: typed,
            clearRelatedData: clearRelated,
            requiresOnboardingFee: requireFee,
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "Reset failed");
        toast.success("Onboarding data reset. Client login kept.");
        router.refresh();
      } else {
        const res = await fetch("/api/admin/clients/wipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, confirmEmail: typed }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "Wipe failed");
        toast.success(`Wiped ${expected}. Email can register again.`);
        router.push("/dashboard/admin/clients");
        router.refresh();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
      setMode(null);
    }
  }

  if (!email) {
    return (
      <p className="text-sm text-neutral-500">
        No email on this account — cannot reset or wipe safely.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="danger-confirm-email" className="text-xs">
            Type <span className="font-semibold text-neutral-900">{email}</span>{" "}
            to enable actions
          </Label>
          <Input
            id="danger-confirm-email"
            type="email"
            autoComplete="off"
            placeholder={email}
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            className="max-w-md rounded-xl"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4">
            <p className="text-sm font-semibold text-amber-950">
              Reset onboarding data
            </p>
            <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
              Keeps the login. Clears journey progress
              {clearRelated
                ? ", payments, agreements, notifications, and deliveries"
                : ""}
              , then rebuilds from the start.
            </p>
            <label className="mt-3 flex items-start gap-2 text-xs text-amber-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={clearRelated}
                onChange={(e) => setClearRelated(e.target.checked)}
              />
              Also wipe payments, agreements, notifications & deliveries
            </label>
            <label className="mt-2 flex items-start gap-2 text-xs text-amber-950">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={requireFee}
                onChange={(e) => setRequireFee(e.target.checked)}
              />
              Require onboarding fee again after reset
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 border-amber-300 text-amber-950 hover:bg-amber-100"
              disabled={busy || !matches}
              onClick={() => setMode("reset")}
            >
              Reset onboarding data
            </Button>
          </div>

          <div className="rounded-xl border border-red-200/80 bg-red-50/40 p-4">
            <p className="text-sm font-semibold text-red-950">
              Wipe client entirely
            </p>
            <p className="mt-1 text-xs leading-relaxed text-red-900/80">
              Permanently deletes Auth user, profile, journey, request-access
              rows, and invitations so this email can register from scratch.
            </p>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="mt-3"
              disabled={busy || !matches}
              onClick={() => setMode("wipe")}
            >
              Wipe test client
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog
        open={mode !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setMode(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {mode === "wipe"
                ? `Wipe ${email} permanently?`
                : `Reset onboarding for ${email}?`}
            </AlertDialogTitle>
            <AlertDialogDescription className={cn(mode === "wipe" && "text-red-700")}>
              {mode === "wipe"
                ? "This cannot be undone. Login and all related records for this email will be removed."
                : "Journey will restart. The client can still sign in with the same password."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={run}
              disabled={busy}
              className={
                mode === "wipe" ? "bg-red-600 hover:bg-red-700" : undefined
              }
            >
              {busy
                ? mode === "wipe"
                  ? "Wiping…"
                  : "Resetting…"
                : mode === "wipe"
                  ? "Yes, wipe client"
                  : "Yes, reset data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

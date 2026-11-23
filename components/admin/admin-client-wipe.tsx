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

export function AdminClientWipe({
  userId,
  email,
}: {
  userId: string;
  email: string | null;
}) {
  const router = useRouter();
  const [confirmEmail, setConfirmEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const expected = (email ?? "").trim().toLowerCase();
  const typed = confirmEmail.trim().toLowerCase();
  const matches = Boolean(expected && typed === expected);

  async function run() {
    if (!matches) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/clients/wipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, confirmEmail: typed }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Wipe failed");
      toast.success(`Wiped ${expected}. You can register that email again.`);
      router.push("/dashboard/admin/clients");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Wipe failed");
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  }

  if (!email) {
    return (
      <p className="text-sm text-neutral-500">
        No email on this account — cannot wipe safely.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <p className="text-sm text-neutral-600">
          Permanently delete this Auth user, onboarding progress, payments,
          support threads, request-access rows, and invitations for{" "}
          <span className="font-medium text-neutral-900">{email}</span>. Use
          for test accounts so the same email can start from Request Access
          again.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="wipe-confirm-email" className="text-xs">
            Type the client email to confirm
          </Label>
          <Input
            id="wipe-confirm-email"
            type="email"
            autoComplete="off"
            placeholder={email}
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            className="max-w-md rounded-xl"
          />
        </div>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={busy || !matches}
          onClick={() => setConfirmOpen(true)}
        >
          Wipe test client
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Wipe {email} permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The login, journey steps, and related
              records for this email will be removed so you can re-test from
              scratch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={run}
              disabled={busy}
              className="bg-red-600 hover:bg-red-700"
            >
              {busy ? "Wiping…" : "Yes, wipe client"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

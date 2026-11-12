"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import {
  ClientCombobox,
  type ClientOption,
} from "@/components/admin/client-combobox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminIssueInvoiceForm({
  clients,
}: {
  clients: ClientOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [userId, setUserId] = React.useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="fortuna" size="sm">
          Issue invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Issue usage invoice</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-neutral-500">
          Choose who should receive the invoice. Stripe emails their account
          login address (shown next to each name).
        </p>
        {clients.length === 0 ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            No billable clients yet. Activate an onboarding case first.
          </p>
        ) : null}
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!userId) {
              toast.error("Select a client");
              return;
            }
            setBusy(true);
            const fd = new FormData(e.currentTarget);
            try {
              const res = await fetch("/api/admin/billing/issue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId,
                  lots: Number(fd.get("lots")),
                  periodStart: fd.get("periodStart"),
                  periodEnd: fd.get("periodEnd"),
                  amountCents: fd.get("amountCents")
                    ? Number(fd.get("amountCents"))
                    : undefined,
                  currency: fd.get("currency") || "usd",
                }),
              });
              const json = await res.json();
              if (!res.ok) throw new Error(json.error || "Failed");
              toast.success("Invoice issued");
              setOpen(false);
              setUserId("");
              router.refresh();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Error");
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="space-y-1.5">
            <Label>Client</Label>
            <ClientCombobox
              options={clients}
              value={userId}
              onChange={setUserId}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Round-turn lots</Label>
              <Input
                name="lots"
                type="number"
                step="0.01"
                min="0"
                className="h-8"
                placeholder="e.g. 10"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Amount cents (optional)</Label>
              <Input name="amountCents" type="number" className="h-8" />
            </div>
            <div className="space-y-1.5">
              <Label>Period start</Label>
              <Input
                name="periodStart"
                type="date"
                required
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Period end</Label>
              <Input name="periodEnd" type="date" required className="h-8" />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Input
                name="currency"
                defaultValue="usd"
                className="h-8"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="fortuna" size="sm" disabled={busy}>
              {busy ? "Issuing…" : "Issue invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

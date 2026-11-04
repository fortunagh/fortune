"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminIssueInvoiceForm({ userIds }: { userIds: string[] }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  return (
    <form
      className="grid gap-3 border border-border p-5 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage(null);
        const fd = new FormData(e.currentTarget);
        try {
          const res = await fetch("/api/admin/billing/issue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: fd.get("userId"),
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
          setMessage("Invoice issued.");
          router.refresh();
        } catch (err) {
          setMessage(err instanceof Error ? err.message : "Error");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3 className="sm:col-span-2 text-xs font-semibold uppercase tracking-[0.14em]">
        Issue usage invoice
      </h3>
      <div className="space-y-1 sm:col-span-2">
        <Label>User id</Label>
        <Input
          name="userId"
          required
          className="rounded-none font-mono text-xs"
          list="completed-users"
          placeholder="uuid"
        />
        <datalist id="completed-users">
          {userIds.map((id) => (
            <option key={id} value={id} />
          ))}
        </datalist>
      </div>
      <div className="space-y-1">
        <Label>Round-turn lots</Label>
        <Input
          name="lots"
          type="number"
          step="0.01"
          min="0"
          className="rounded-none"
          placeholder="e.g. 10"
        />
      </div>
      <div className="space-y-1">
        <Label>Amount cents (optional override)</Label>
        <Input name="amountCents" type="number" className="rounded-none" />
      </div>
      <div className="space-y-1">
        <Label>Period start</Label>
        <Input name="periodStart" type="date" required className="rounded-none" />
      </div>
      <div className="space-y-1">
        <Label>Period end</Label>
        <Input name="periodEnd" type="date" required className="rounded-none" />
      </div>
      <div className="space-y-1">
        <Label>Currency</Label>
        <Input name="currency" defaultValue="usd" className="rounded-none" />
      </div>
      <div className="flex items-end">
        <Button type="submit" variant="fortuna" disabled={busy}>
          {busy ? "Issuing…" : "Issue invoice"}
        </Button>
      </div>
      {message ? (
        <p className="sm:col-span-2 text-sm text-muted-foreground">{message}</p>
      ) : null}
    </form>
  );
}

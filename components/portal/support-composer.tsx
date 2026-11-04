"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fortunaUiClass } from "@/lib/fonts/fortuna";
import { cn } from "@/lib/utils";

export function SupportComposer({ stepKey }: { stepKey: string | null }) {
  const router = useRouter();
  const [body, setBody] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(false);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, stepKey }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not send");
      setBody("");
      setOk(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={cn(fortunaUiClass, "space-y-4")}>
      <p className="text-sm text-muted-foreground">
        Describe the software issue. Do not include passwords, account numbers,
        or identity documents.
        {stepKey ? (
          <span className="mt-1 block text-xs uppercase tracking-[0.12em] text-primary">
            Current step: {stepKey}
          </span>
        ) : null}
      </p>
      <Textarea
        className="min-h-32 rounded-none"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        minLength={10}
        placeholder="How can we help with software setup?"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {ok ? (
        <p className="text-sm text-primary">Request sent. Fortuna will follow up.</p>
      ) : null}
      <Button type="submit" variant="fortuna" disabled={busy}>
        {busy ? "Sending…" : "Send support request"}
      </Button>
    </form>
  );
}

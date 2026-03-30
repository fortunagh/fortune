"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as React from "react";

export function InviteUserForm() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Invite failed" });
        return;
      }
      setMessage({
        type: "ok",
        text: "Invitation sent. They will receive an email to set a password.",
      });
      setEmail("");
    } catch {
      setMessage({ type: "err", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-md space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div>
        <h2 className="text-lg font-semibold">Invite a user</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sends a Supabase invite email so they can set a password and sign in as
          a customer. Promote them to admin in the database if needed.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="invite-email">Email</Label>
        <Input
          id="invite-email"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      {message && (
        <p
          className={
            message.type === "ok"
              ? "text-sm text-emerald-700 dark:text-emerald-400"
              : "text-sm text-destructive"
          }
          role="status"
        >
          {message.text}
        </p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Sending…" : "Send invite"}
      </Button>
    </form>
  );
}

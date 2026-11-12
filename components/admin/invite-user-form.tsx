"use client";

import { toast } from "sonner";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InviteUserForm({
  onSuccess,
  compact = false,
}: {
  onSuccess?: () => void;
  compact?: boolean;
}) {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
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
        toast.error(data.error ?? "Invite failed");
        return;
      }
      toast.success("Invitation sent");
      setEmail("");
      onSuccess?.();
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "space-y-4" : "space-y-4"}>
      {!compact ? (
        <div>
          <h2 className="text-base font-semibold">Invite a user</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Sends a set-password email so they can sign in as a customer.
          </p>
        </div>
      ) : (
        <p className="text-sm text-neutral-500">
          Sends a set-password email so they can sign in as a customer.
        </p>
      )}
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
          className="h-8"
        />
      </div>
      <Button type="submit" variant="fortuna" size="sm" disabled={loading}>
        {loading ? "Sending…" : "Send invite"}
      </Button>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fortunaUiClass } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

export function AdminNotificationSettings({
  initialEmails,
}: {
  initialEmails: string[];
}) {
  const [emails, setEmails] = useState<string[]>(
    initialEmails.length ? initialEmails : [""],
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEmails(initialEmails.length ? initialEmails : [""]);
  }, [initialEmails]);

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const cleaned = emails.map((e) => e.trim()).filter(Boolean);
      const res = await fetch("/api/admin/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: cleaned }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        emails?: string[];
      };
      if (!res.ok) throw new Error(data.error || "Could not save");
      setEmails(data.emails?.length ? data.emails : [""]);
      setMessage("Notification emails saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <Label className={cn(fortunaUiClass, "text-xs uppercase tracking-[0.14em]")}>
          Notification emails
        </Label>
        <p className="mt-1 text-sm text-neutral-600">
          These addresses receive an email whenever someone submits Request
          access / Register Now.
        </p>
      </div>

      <div className="space-y-2">
        {emails.map((email, index) => (
          <div key={`email-${index}`} className="flex gap-2">
            <Input
              type="email"
              value={email}
              placeholder="you@fortunaglobalholdings.com"
              className="rounded-xl"
              onChange={(e) => {
                const next = [...emails];
                next[index] = e.target.value;
                setEmails(next);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 rounded-xl"
              disabled={emails.length <= 1}
              onClick={() => setEmails(emails.filter((_, i) => i !== index))}
              aria-label="Remove email"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={() => setEmails([...emails, ""])}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add email
        </Button>
        <Button
          type="button"
          variant="fortuna"
          disabled={saving}
          onClick={save}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>

      {message ? (
        <p className="text-sm text-emerald-700">{message}</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminNotificationSettings({
  initialEmails,
}: {
  initialEmails: string[];
}) {
  const [emails, setEmails] = useState<string[]>(
    initialEmails.length ? initialEmails : [""],
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEmails(initialEmails.length ? initialEmails : [""]);
  }, [initialEmails]);

  async function save() {
    setSaving(true);
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
      toast.success("Notification emails saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-neutral-900">
          Notification emails
        </Label>
        <p className="mt-1 text-sm text-neutral-500">
          These addresses get an email when someone submits request access.
        </p>
      </div>

      <div className="space-y-2">
        {emails.map((email, index) => (
          <div key={index} className="flex gap-2">
            <Input
              type="email"
              value={email}
              placeholder="you@fortunaglobalholdings.com"
              className="h-8"
              onChange={(e) => {
                const next = [...emails];
                next[index] = e.target.value;
                setEmails(next);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="shrink-0"
              disabled={emails.length <= 1}
              onClick={() => setEmails(emails.filter((_, i) => i !== index))}
              aria-label="Remove email"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEmails([...emails, ""])}
        >
          <Plus className="size-3.5" />
          Add email
        </Button>
        <Button
          type="button"
          variant="fortuna"
          size="sm"
          disabled={saving}
          onClick={save}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

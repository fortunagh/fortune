"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Resource = {
  id: string;
  title: string;
  kind: string;
  external_url: string | null;
  published: boolean;
  related_step_keys: string[] | null;
};

type Broker = {
  id: string;
  name: string;
  referral_url: string | null;
  secure_portal_url: string | null;
  active: boolean;
};

export function AdminContentForms({
  resources,
  brokers,
  reminderRules,
  steps,
}: {
  resources: Resource[];
  brokers: Broker[];
  reminderRules: Array<{
    id: string;
    step_key: string;
    delay_hours: number;
    enabled: boolean;
  }>;
  steps: Array<{ key: string; title: string }>;
}) {
  const router = useRouter();
  const [message, setMessage] = React.useState<string | null>(null);

  async function post(path: string, body: unknown) {
    setMessage(null);
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
    setMessage("Saved.");
    router.refresh();
  }

  return (
    <div className="space-y-10">
      {message ? <p className="text-sm text-primary">{message}</p> : null}

      <section className="space-y-4 rounded-xl border border-neutral-200 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em]">
          Add resource
        </h3>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            try {
              await post("/api/admin/content/resource", {
                title: fd.get("title"),
                kind: fd.get("kind"),
                externalUrl: fd.get("externalUrl"),
                relatedStepKeys: String(fd.get("relatedStepKeys") || "")
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
                published: fd.get("published") === "on",
              });
              e.currentTarget.reset();
            } catch (err) {
              setMessage(err instanceof Error ? err.message : "Error");
            }
          }}
        >
          <div className="space-y-1">
            <Label>Title</Label>
            <Input name="title" required className="rounded-xl" />
          </div>
          <div className="space-y-1">
            <Label>Kind</Label>
            <select
              name="kind"
              defaultValue="pdf"
              className="flex h-9 w-full rounded-xl border border-input bg-transparent px-3 text-sm"
            >
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>External URL</Label>
            <Input name="externalUrl" className="rounded-xl" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Related step keys (comma-separated)</Label>
            <Input
              name="relatedStepKeys"
              placeholder="vps_setup,demo_install"
              className="rounded-xl"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" /> Published
          </label>
          <Button type="submit" variant="fortuna">
            Add resource
          </Button>
        </form>

        <ul className="space-y-2 text-sm">
          {resources.map((r) => (
            <li key={r.id} className="border-b border-neutral-100 py-2">
              {r.title} · {r.kind} · {r.published ? "published" : "draft"}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 rounded-xl border border-neutral-200 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em]">
          Add broker
        </h3>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            try {
              await post("/api/admin/content/broker", {
                name: fd.get("name"),
                referralUrl: fd.get("referralUrl"),
                securePortalUrl: fd.get("securePortalUrl"),
              });
              e.currentTarget.reset();
            } catch (err) {
              setMessage(err instanceof Error ? err.message : "Error");
            }
          }}
        >
          <div className="space-y-1 sm:col-span-2">
            <Label>Name</Label>
            <Input name="name" required className="rounded-xl" />
          </div>
          <div className="space-y-1">
            <Label>Referral URL</Label>
            <Input name="referralUrl" className="rounded-xl" />
          </div>
          <div className="space-y-1">
            <Label>Secure portal URL</Label>
            <Input name="securePortalUrl" className="rounded-xl" />
          </div>
          <Button type="submit" variant="fortuna">
            Add broker
          </Button>
        </form>
        <ul className="space-y-2 text-sm">
          {brokers.map((b) => (
            <li key={b.id} className="border-b border-neutral-100 py-2">
              {b.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-xl border border-neutral-200 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em]">
          Reminder rules
        </h3>
        <ul className="space-y-2 text-sm">
          {reminderRules.map((r) => (
            <li key={r.id}>
              {r.step_key}: {r.delay_hours}h ·{" "}
              {r.enabled ? "enabled" : "disabled"}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Edit delays in Supabase or via SQL. Cron hits{" "}
          <code>/api/cron/reminders</code>.
        </p>
      </section>

      <section className="space-y-3 rounded-xl border border-neutral-200 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em]">
          Step catalogue
        </h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {steps.map((s) => (
            <li key={s.key}>
              <span className="font-mono text-xs text-foreground">{s.key}</span>{" "}
              — {s.title}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

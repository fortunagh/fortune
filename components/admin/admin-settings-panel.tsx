"use client";

import { Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type BillingDefaults = {
  currency: string;
  ratePerLotUsd: number;
  invoiceDueDays: number;
};

type SupportDefaults = {
  autoMarkInProgressOnReply: boolean;
  replyEmailEnabled: boolean;
};

type SectionId = "notifications" | "billing" | "support" | "account";

function SettingsRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 border-b border-neutral-100 py-5 last:border-0 sm:grid-cols-[minmax(0,240px)_1fr] sm:gap-8">
      <div>
        <p className="text-sm font-medium text-neutral-900">{title}</p>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function AdminSettingsPanel({
  initialEmails,
  initialBilling,
  initialSupport,
  adminEmail,
}: {
  initialEmails: string[];
  initialBilling: BillingDefaults;
  initialSupport: SupportDefaults;
  adminEmail: string;
}) {
  const [section, setSection] = React.useState<SectionId>("notifications");
  const [emails, setEmails] = React.useState(
    initialEmails.length ? initialEmails : [""],
  );
  const [billing, setBilling] = React.useState(initialBilling);
  const [support, setSupport] = React.useState(initialSupport);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    setEmails(initialEmails.length ? initialEmails : [""]);
    setBilling(initialBilling);
    setSupport(initialSupport);
    setDirty(false);
  }, [initialEmails, initialBilling, initialSupport]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationEmails: emails,
          billing,
          support,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        notificationEmails?: string[];
        billing?: BillingDefaults;
        support?: SupportDefaults;
      };
      if (!res.ok) throw new Error(data.error || "Could not save");
      setEmails(
        data.notificationEmails?.length ? data.notificationEmails : [""],
      );
      if (data.billing) setBilling(data.billing);
      if (data.support) setSupport(data.support);
      setDirty(false);
      toast.success("Settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  const nav: { id: SectionId; label: string }[] = [
    { id: "notifications", label: "Notifications" },
    { id: "billing", label: "Billing" },
    { id: "support", label: "Support" },
    { id: "account", label: "Account" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
      <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {nav.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            className={cn(
              "rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
              section === item.id
                ? "bg-white text-neutral-950 shadow-sm ring-1 ring-neutral-200"
                : "text-neutral-500 hover:bg-white/60 hover:text-neutral-900",
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="rounded-xl border border-neutral-200/80 bg-white px-4 sm:px-6">
        {section === "notifications" ? (
          <SettingsRow
            title="Request access alerts"
            description="These addresses get an email when someone submits the public request-access form."
          >
            <div className="space-y-2">
              {emails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    placeholder="ops@fortunaglobalholdings.com"
                    className="h-9"
                    onChange={(e) => {
                      const next = [...emails];
                      next[index] = e.target.value;
                      setEmails(next);
                      setDirty(true);
                    }}
                  />
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40"
                    disabled={emails.length <= 1}
                    onClick={() => {
                      setEmails(emails.filter((_, i) => i !== index));
                      setDirty(true);
                    }}
                    aria-label="Remove email"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8a6d1f] hover:underline"
                onClick={() => {
                  setEmails([...emails, ""]);
                  setDirty(true);
                }}
              >
                <Plus className="size-3.5" />
                Add address
              </button>
            </div>
          </SettingsRow>
        ) : null}

        {section === "billing" ? (
          <>
            <SettingsRow
              title="Invoice recipients"
              description="Usage invoices are always sent to the selected client’s login email in Billing. There is no separate billing contact yet."
            >
              <p className="rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                Issue from Billing → choose client → invoice email goes to that
                account address.
              </p>
            </SettingsRow>
            <SettingsRow
              title="Default currency"
              description="Pre-filled when issuing a usage invoice."
            >
              <Input
                value={billing.currency}
                className="h-9 max-w-[140px] uppercase"
                onChange={(e) => {
                  setBilling({ ...billing, currency: e.target.value });
                  setDirty(true);
                }}
              />
            </SettingsRow>
            <SettingsRow
              title="Rate per round-turn lot"
              description="Used when you enter lots and leave amount blank."
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500">USD</span>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={billing.ratePerLotUsd}
                  className="h-9 max-w-[140px]"
                  onChange={(e) => {
                    setBilling({
                      ...billing,
                      ratePerLotUsd: Number(e.target.value) || 0,
                    });
                    setDirty(true);
                  }}
                />
              </div>
            </SettingsRow>
            <SettingsRow
              title="Payment due window"
              description="Days after issue before the invoice is marked due."
            >
              <Input
                type="number"
                min={1}
                max={90}
                value={billing.invoiceDueDays}
                className="h-9 max-w-[140px]"
                onChange={(e) => {
                  setBilling({
                    ...billing,
                    invoiceDueDays: Number(e.target.value) || 14,
                  });
                  setDirty(true);
                }}
              />
            </SettingsRow>
          </>
        ) : null}

        {section === "support" ? (
          <>
            <SettingsRow
              title="Email replies"
              description="When you send a support reply, also email the client."
            >
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={support.replyEmailEnabled}
                  onCheckedChange={(c) => {
                    setSupport({
                      ...support,
                      replyEmailEnabled: c === true,
                    });
                    setDirty(true);
                  }}
                />
                Email client on reply
              </label>
            </SettingsRow>
            <SettingsRow
              title="Status on reply"
              description="Automatically move open tickets to In progress when you reply."
            >
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={support.autoMarkInProgressOnReply}
                  onCheckedChange={(c) => {
                    setSupport({
                      ...support,
                      autoMarkInProgressOnReply: c === true,
                    });
                    setDirty(true);
                  }}
                />
                Mark in progress after reply
              </label>
            </SettingsRow>
          </>
        ) : null}

        {section === "account" ? (
          <SettingsRow
            title="Signed-in admin"
            description="This is the account currently managing the console."
          >
            <div className="space-y-1">
              <Label className="text-xs text-neutral-500">Email</Label>
              <p className="text-sm font-medium text-neutral-900">{adminEmail}</p>
            </div>
          </SettingsRow>
        ) : null}

        {(section === "notifications" ||
          section === "billing" ||
          section === "support") && (
          <div className="flex items-center justify-between gap-3 border-t border-neutral-100 py-4">
            <p className="text-xs text-neutral-400">
              {dirty ? "Unsaved changes" : "All changes saved"}
            </p>
            <Button
              type="button"
              variant={dirty ? "fortuna" : "outline"}
              size="sm"
              disabled={saving || !dirty}
              onClick={save}
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

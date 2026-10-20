"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  RequestAccessStatus,
  RequestAccessSubmissionRow,
} from "@/lib/types/request-access-submission";
import { geistSans } from "@/lib/fonts/geist-admin";
import { cn } from "@/lib/utils";
import { Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const STATUS_OPTIONS: RequestAccessStatus[] = [
  "pending",
  "contacted",
  "approved",
  "declined",
];

function statusBadgeVariant(
  s: RequestAccessStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (s) {
    case "approved":
      return "default";
    case "declined":
      return "destructive";
    case "contacted":
      return "secondary";
    default:
      return "outline";
  }
}

function DetailField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-500 dark:text-neutral-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-normal normal-case leading-relaxed tracking-normal text-neutral-900 dark:text-neutral-100">
        {children}
      </dd>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-neutral-50/80 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-amber-900/80 dark:text-amber-200/80">
        {title}
      </h3>
      <dl className="grid gap-4 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

export function RequestAccessAdminTable({
  initialRows,
}: {
  initialRows: RequestAccessSubmissionRow[];
}) {
  const router = useRouter();
  const [rows, setRows] =
    React.useState<RequestAccessSubmissionRow[]>(initialRows);
  const [viewing, setViewing] =
    React.useState<RequestAccessSubmissionRow | null>(null);
  const [status, setStatus] = React.useState<RequestAccessStatus>("pending");
  const [notes, setNotes] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  function openView(row: RequestAccessSubmissionRow) {
    setViewing(row);
    setStatus(row.status ?? "pending");
    setNotes(row.admin_notes ?? "");
  }

  async function saveEdit() {
    if (!viewing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/request-access/${viewing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          admin_notes: notes.trim() === "" ? null : notes.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        row?: RequestAccessSubmissionRow;
        error?: string;
      };
      if (!res.ok) {
        alert(data.error ?? "Could not save");
        return;
      }
      if (data.row) {
        setRows((prev) =>
          prev.map((r) =>
            r.id === data.row!.id
              ? (data.row as RequestAccessSubmissionRow)
              : r,
          ),
        );
        setViewing(data.row as RequestAccessSubmissionRow);
      }
      setViewing(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this submission permanently?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/request-access/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        alert(data.error ?? "Could not delete");
        return;
      }
      setRows((prev) => prev.filter((r) => r.id !== id));
      if (viewing?.id === id) setViewing(null);
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="w-full overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm [-webkit-overflow-scrolling:touch] dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-950/50">
              <th className="whitespace-nowrap px-3 py-2.5 font-semibold">
                Received
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-semibold">
                Status
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-semibold">
                Name
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-semibold">
                Email
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-semibold">
                Phone
              </th>
              <th className="whitespace-nowrap px-3 py-2.5 font-semibold">
                City
              </th>
              <th className="px-3 py-2.5 font-semibold">Interest</th>
              <th className="whitespace-nowrap px-3 py-2.5 font-semibold text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="cursor-pointer border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50/90 dark:border-neutral-800 dark:hover:bg-neutral-800/40"
                onClick={() => openView(row)}
              >
                <td className="whitespace-nowrap px-3 py-2 align-top text-muted-foreground">
                  {formatDate(row.created_at)}
                </td>
                <td className="px-3 py-2 align-top">
                  <Badge variant={statusBadgeVariant(row.status ?? "pending")}>
                    {row.status ?? "pending"}
                  </Badge>
                </td>
                <td className="px-3 py-2 align-top">
                  {row.first_name} {row.last_name}
                </td>
                <td className="max-w-[160px] break-all px-3 py-2 align-top text-xs">
                  {row.email}
                </td>
                <td className="max-w-[120px] break-all px-3 py-2 align-top text-xs text-muted-foreground">
                  {row.phone_e164 ?? row.mobile_number}
                </td>
                <td className="px-3 py-2 align-top">{row.city}</td>
                <td className="max-w-[220px] px-3 py-2 align-top text-xs leading-relaxed text-muted-foreground">
                  {row.platform_interest.slice(0, 120)}
                  {row.platform_interest.length > 120 ? "…" : ""}
                </td>
                <td
                  className="whitespace-nowrap px-3 py-2 align-top text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openView(row)}
                      aria-label="View full registration"
                      title="View full registration"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      disabled={deletingId === row.id}
                      onClick={() => remove(row.id)}
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent
          className={cn(
            geistSans.className,
            "max-h-[90dvh] overflow-y-auto font-normal antialiased sm:max-w-2xl",
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight normal-case">
              Full registration
            </DialogTitle>
            <DialogDescription className="text-sm font-normal normal-case tracking-normal">
              Everything submitted on the form, plus workflow status and
              internal notes.
            </DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="grid gap-4 py-1">
              <DetailSection title="Info">
                <DetailField label="Name">
                  {viewing.first_name} {viewing.last_name}
                </DetailField>
                <DetailField label="Received">
                  {formatDate(viewing.created_at)}
                </DetailField>
                <DetailField label="Referral / source" className="sm:col-span-2">
                  <span className="whitespace-pre-wrap">
                    {viewing.referral_source}
                  </span>
                </DetailField>
              </DetailSection>

              <DetailSection title="Contact">
                <DetailField label="Email">
                  <a
                    href={`mailto:${viewing.email}`}
                    className="break-all underline-offset-2 hover:underline"
                  >
                    {viewing.email}
                  </a>
                </DetailField>
                <DetailField label="City">{viewing.city}</DetailField>
                <DetailField label="Phone (E.164)">
                  <span className="break-all">
                    {viewing.phone_e164 ?? "—"}
                  </span>
                </DetailField>
                <DetailField label="Country + national number">
                  <span className="break-all">
                    {viewing.phone_country_iso2.toUpperCase()} ·{" "}
                    {viewing.mobile_number}
                  </span>
                </DetailField>
              </DetailSection>

              <DetailSection title="Schedule">
                <DetailField label="Time zone">
                  {viewing.timezone.replace(/_/g, " ")}
                </DetailField>
                <DetailField label="Preferred contact">
                  <span className="capitalize">
                    {viewing.preferred_contact_method}
                  </span>
                </DetailField>
                <DetailField
                  label="Best times to reach"
                  className="sm:col-span-2"
                >
                  <span className="whitespace-pre-wrap">
                    {viewing.best_contact_times}
                  </span>
                </DetailField>
              </DetailSection>

              <DetailSection title="Details">
                <DetailField
                  label="Occupation / business"
                  className="sm:col-span-2"
                >
                  <span className="whitespace-pre-wrap">
                    {viewing.occupation_or_business}
                  </span>
                </DetailField>
                <DetailField
                  label="Platform interest"
                  className="sm:col-span-2"
                >
                  <span className="whitespace-pre-wrap">
                    {viewing.platform_interest}
                  </span>
                </DetailField>
              </DetailSection>

              <section className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-amber-900/80 dark:text-amber-200/80">
                  Review
                </h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="submission-status">Status</Label>
                    <Select
                      value={status}
                      onValueChange={(v) =>
                        setStatus(v as RequestAccessStatus)
                      }
                    >
                      <SelectTrigger id="submission-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={geistSans.className}>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="submission-notes">Admin notes</Label>
                    <Textarea
                      id="submission-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Internal notes (not shown to the applicant)"
                      className="min-h-[100px] resize-y"
                    />
                  </div>
                </div>
              </section>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewing(null)}
            >
              Close
            </Button>
            <Button type="button" onClick={saveEdit} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

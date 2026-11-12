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
import { Textarea } from "@/components/ui/textarea";
import type {
  RequestAccessStatus,
  RequestAccessSubmissionRow,
} from "@/lib/types/request-access-submission";
import { fortunaUiClass } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";
import { Check, Eye, Trash2, X } from "lucide-react";
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
      <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-relaxed text-neutral-900">
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
    <section className="rounded-2xl border border-black/[0.06] bg-[#fbf8f3]/80 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#8a6d1f]">
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
  const [notes, setNotes] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  function openView(row: RequestAccessSubmissionRow) {
    setViewing(row);
    setNotes(row.admin_notes ?? "");
    setActionError(null);
  }

  async function patchRow(
    id: string,
    body: {
      status?: RequestAccessStatus;
      admin_notes?: string | null;
      sendInvitation?: boolean;
    },
  ) {
    setBusyId(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/request-access/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as {
        row?: RequestAccessSubmissionRow;
        error?: string;
        warning?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not update");
      }
      if (data.warning) {
        setActionError(data.warning);
      }
      if (data.row) {
        setRows((prev) =>
          prev.map((r) =>
            r.id === data.row!.id
              ? (data.row as RequestAccessSubmissionRow)
              : r,
          ),
        );
        if (viewing?.id === id) {
          setViewing(data.row as RequestAccessSubmissionRow);
        }
      }
      router.refresh();
      return data.row;
    } finally {
      setBusyId(null);
    }
  }

  async function accept(row: RequestAccessSubmissionRow) {
    if (
      !confirm(
        `Approve ${row.first_name} ${row.last_name}? They will receive a set-password email.`,
      )
    ) {
      return;
    }
    try {
      await patchRow(row.id, {
        status: "approved",
        sendInvitation: true,
        admin_notes: notes.trim() === "" ? undefined : notes.trim(),
      });
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Approve failed");
      alert(e instanceof Error ? e.message : "Approve failed");
    }
  }

  async function reject(row: RequestAccessSubmissionRow) {
    if (!confirm(`Reject ${row.first_name} ${row.last_name}?`)) return;
    try {
      await patchRow(row.id, {
        status: "declined",
        sendInvitation: false,
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Reject failed");
    }
  }

  async function saveNotes() {
    if (!viewing) return;
    try {
      await patchRow(viewing.id, {
        admin_notes: notes.trim() === "" ? null : notes.trim(),
      });
      setViewing(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not save notes");
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
      <div className="w-full overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-sm">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] bg-[#fbf8f3]">
              <th className="whitespace-nowrap px-4 py-3 font-semibold">
                Received
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">
                Status
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">
                Name
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">
                Email
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">
                Phone
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">
                City
              </th>
              <th className="px-4 py-3 font-semibold">Interest</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-sm text-neutral-500"
                >
                  No submissions yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const status = (row.status ?? "pending") as RequestAccessStatus;
                const pending =
                  status === "pending" || status === "contacted";
                const busy = busyId === row.id;
                return (
                  <tr
                    key={row.id}
                    className="border-b border-black/[0.04] last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-3 align-middle text-neutral-500">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <Badge
                        variant={statusBadgeVariant(status)}
                        className="rounded-full capitalize"
                      >
                        {status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 align-middle font-medium">
                      {row.first_name} {row.last_name}
                    </td>
                    <td className="max-w-[180px] break-all px-4 py-3 align-middle text-xs">
                      {row.email}
                    </td>
                    <td className="max-w-[130px] break-all px-4 py-3 align-middle text-xs text-neutral-500">
                      {row.phone_e164 ?? row.mobile_number}
                    </td>
                    <td className="px-4 py-3 align-middle">{row.city}</td>
                    <td className="max-w-[220px] px-4 py-3 align-middle text-xs leading-relaxed text-neutral-500">
                      {row.platform_interest.slice(0, 100)}
                      {row.platform_interest.length > 100 ? "…" : ""}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-middle text-right">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => openView(row)}
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          View
                        </Button>
                        {pending ? (
                          <>
                            <Button
                              type="button"
                              variant="fortuna"
                              size="sm"
                              disabled={busy}
                              onClick={() => accept(row)}
                            >
                              <Check className="mr-1 h-3.5 w-3.5" />
                              Accept
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-xl border-red-200 text-red-700 hover:bg-red-50"
                              disabled={busy}
                              onClick={() => reject(row)}
                            >
                              <X className="mr-1 h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </>
                        ) : status === "approved" ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            disabled={busy}
                            onClick={() => accept(row)}
                            title="Send a fresh set-password email"
                          >
                            Resend invite
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          disabled={deletingId === row.id}
                          onClick={() => remove(row.id)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Full registration
            </DialogTitle>
            <DialogDescription>
              Review the application. Use Accept or Reject on the table, or
              here.
            </DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="grid gap-4 py-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={statusBadgeVariant(
                    (viewing.status ?? "pending") as RequestAccessStatus,
                  )}
                  className="rounded-full capitalize"
                >
                  {viewing.status ?? "pending"}
                </Badge>
                <span className={cn(fortunaUiClass, "text-xs text-neutral-500")}>
                  {formatDate(viewing.created_at)}
                </span>
              </div>

              <DetailSection title="Info">
                <DetailField label="Name">
                  {viewing.first_name} {viewing.last_name}
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
                <DetailField label="Phone">
                  <span className="break-all">
                    {viewing.phone_e164 ?? viewing.mobile_number}
                  </span>
                </DetailField>
                <DetailField label="Preferred contact">
                  <span className="capitalize">
                    {viewing.preferred_contact_method}
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

              <section className="rounded-2xl border border-black/[0.06] p-4">
                <Label htmlFor="submission-notes">Admin notes</Label>
                <Textarea
                  id="submission-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes (not shown to the applicant)"
                  className="mt-2 min-h-[100px] resize-y rounded-xl"
                />
              </section>

              {actionError ? (
                <p className="text-sm text-amber-800">{actionError}</p>
              ) : null}
            </div>
          )}
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setViewing(null)}
            >
              Close
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={!viewing || busyId === viewing?.id}
                onClick={saveNotes}
              >
                Save notes
              </Button>
              {viewing &&
              ((viewing.status ?? "pending") === "pending" ||
                (viewing.status ?? "pending") === "contacted") ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-red-200 text-red-700"
                    disabled={busyId === viewing.id}
                    onClick={() => reject(viewing)}
                  >
                    Reject
                  </Button>
                  <Button
                    type="button"
                    variant="fortuna"
                    disabled={busyId === viewing.id}
                    onClick={() => accept(viewing)}
                  >
                    Accept &amp; email invite
                  </Button>
                </>
              ) : viewing?.status === "approved" ? (
                <Button
                  type="button"
                  variant="fortuna"
                  disabled={busyId === viewing.id}
                  onClick={() => accept(viewing)}
                >
                  Resend set-password email
                </Button>
              ) : null}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

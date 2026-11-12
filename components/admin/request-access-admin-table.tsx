"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { fortunaUiClass } from "@/components/portal/portal-ui";
import type {
  RequestAccessStatus,
  RequestAccessSubmissionRow,
} from "@/lib/types/request-access-submission";
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

type ConfirmKind = "accept" | "reject" | "resend" | "delete" | null;

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
  const [confirm, setConfirm] = React.useState<{
    kind: ConfirmKind;
    row: RequestAccessSubmissionRow | null;
  }>({ kind: null, row: null });
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
      if (!res.ok) throw new Error(data.error ?? "Could not update");
      if (data.warning) setActionError(data.warning);
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

  async function runConfirm() {
    const { kind, row } = confirm;
    if (!kind || !row) return;
    setConfirm({ kind: null, row: null });
    try {
      if (kind === "accept" || kind === "resend") {
        await patchRow(row.id, {
          status: "approved",
          sendInvitation: true,
          admin_notes: notes.trim() === "" ? undefined : notes.trim(),
        });
      } else if (kind === "reject") {
        await patchRow(row.id, {
          status: "declined",
          sendInvitation: false,
        });
      } else if (kind === "delete") {
        setBusyId(row.id);
        const res = await fetch(`/api/admin/request-access/${row.id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(data.error ?? "Could not delete");
        }
        setRows((prev) => prev.filter((r) => r.id !== row.id));
        if (viewing?.id === row.id) setViewing(null);
        router.refresh();
        setBusyId(null);
      }
    } catch (e) {
      setBusyId(null);
      setActionError(e instanceof Error ? e.message : "Action failed");
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

  const confirmCopy = {
    accept: {
      title: "Accept this request?",
      description:
        "They will be approved and receive a set-password email to create their account.",
      action: "Accept & send email",
    },
    reject: {
      title: "Reject this request?",
      description: "The application will be marked declined. No invite email is sent.",
      action: "Reject",
    },
    resend: {
      title: "Resend set-password email?",
      description:
        "A fresh invite email will be sent. Old links will stop working.",
      action: "Resend invite",
    },
    delete: {
      title: "Delete this submission?",
      description: "This permanently removes the registration record.",
      action: "Delete",
    },
  } as const;

  return (
    <>
      <div className="rounded-2xl border border-black/[0.06] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-[#fbf8f3]">
              <TableHead>Applicant</TableHead>
              <TableHead className="hidden sm:table-cell">Received</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-neutral-500"
                >
                  No submissions yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const status = (row.status ??
                  "pending") as RequestAccessStatus;
                const pending =
                  status === "pending" || status === "contacted";
                const busy = busyId === row.id;
                return (
                  <TableRow key={row.id}>
                    <TableCell className="min-w-0">
                      <div className="font-medium text-neutral-950">
                        {row.first_name} {row.last_name}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-neutral-500">
                        {row.email}
                      </div>
                      <div className="mt-1 text-xs text-neutral-400 sm:hidden">
                        {formatDate(row.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-neutral-500 sm:table-cell">
                      {formatDate(row.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusBadgeVariant(status)}
                        className="rounded-full capitalize"
                      >
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
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
                              onClick={() =>
                                setConfirm({ kind: "accept", row })
                              }
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
                              onClick={() =>
                                setConfirm({ kind: "reject", row })
                              }
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
                            onClick={() =>
                              setConfirm({ kind: "resend", row })
                            }
                          >
                            Resend
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          disabled={busy}
                          onClick={() => setConfirm({ kind: "delete", row })}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {actionError && !viewing ? (
        <p className="mt-3 text-sm text-amber-800">{actionError}</p>
      ) : null}

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Full registration
            </DialogTitle>
            <DialogDescription>
              All submitted details. Accept or reject from here or the table.
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
                <DetailField label="Time zone">{viewing.timezone}</DetailField>
                <DetailField label="Best times">
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
                    onClick={() =>
                      setConfirm({ kind: "reject", row: viewing })
                    }
                  >
                    Reject
                  </Button>
                  <Button
                    type="button"
                    variant="fortuna"
                    disabled={busyId === viewing.id}
                    onClick={() =>
                      setConfirm({ kind: "accept", row: viewing })
                    }
                  >
                    Accept
                  </Button>
                </>
              ) : viewing?.status === "approved" ? (
                <Button
                  type="button"
                  variant="fortuna"
                  disabled={busyId === viewing.id}
                  onClick={() => setConfirm({ kind: "resend", row: viewing })}
                >
                  Resend invite
                </Button>
              ) : null}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirm.kind !== null}
        onOpenChange={(open) => {
          if (!open) setConfirm({ kind: null, row: null });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm.kind ? confirmCopy[confirm.kind].title : ""}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm.kind && confirm.row
                ? `${confirmCopy[confirm.kind].description} (${confirm.row.first_name} ${confirm.row.last_name})`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={
                confirm.kind === "reject" || confirm.kind === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : undefined
              }
              onClick={runConfirm}
            >
              {confirm.kind ? confirmCopy[confirm.kind].action : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

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
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
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

export function RequestAccessAdminTable({
  initialRows,
}: {
  initialRows: RequestAccessSubmissionRow[];
}) {
  const router = useRouter();
  const [rows, setRows] =
    React.useState<RequestAccessSubmissionRow[]>(initialRows);
  const [editing, setEditing] = React.useState<RequestAccessSubmissionRow | null>(
    null,
  );
  const [status, setStatus] = React.useState<RequestAccessStatus>("pending");
  const [notes, setNotes] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  function openEdit(row: RequestAccessSubmissionRow) {
    setEditing(row);
    setStatus(row.status ?? "pending");
    setNotes(row.admin_notes ?? "");
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/request-access/${editing.id}`, {
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
          prev.map((r) => (r.id === data.row!.id ? (data.row as RequestAccessSubmissionRow) : r)),
        );
      }
      setEditing(null);
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
                className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
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
                <td className="whitespace-nowrap px-3 py-2 align-top text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(row)}
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      disabled={deletingId === row.id}
                      onClick={() => remove(row.id)}
                      aria-label="Delete"
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

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage submission</DialogTitle>
            <DialogDescription>
              Update workflow status and internal notes. Submitter:{" "}
              <span className="font-medium text-foreground">
                {editing?.email}
              </span>
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as RequestAccessStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Admin notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes (not shown to the applicant)"
                  className="min-h-[100px] resize-y"
                />
              </div>
              <div
                className={cn(
                  "rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs leading-relaxed dark:border-neutral-800 dark:bg-neutral-950/50",
                )}
              >
                <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Full message
                </p>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                  {editing.platform_interest}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(null)}
            >
              Cancel
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

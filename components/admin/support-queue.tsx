"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { AdminSupportStatus } from "@/components/admin/admin-support-status";
import { AdminStatus } from "@/components/admin/ui/admin-status";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableEmpty,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
  AdminTableShell,
} from "@/components/admin/ui/admin-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { getStepDef } from "@/lib/onboarding/steps";

export type SupportQueueRow = {
  id: string;
  user_id: string;
  body: string;
  status: string;
  step_key: string | null;
  created_at: string;
  admin_notes: string | null;
  clientName: string;
  clientEmail: string | null;
};

export function SupportQueue({ rows }: { rows: SupportQueueRow[] }) {
  const router = useRouter();
  const [active, setActive] = React.useState<SupportQueueRow | null>(null);
  const [reply, setReply] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    setReply(active?.admin_notes ?? "");
  }, [active]);

  async function sendReply(sendEmail: boolean) {
    if (!active || !reply.trim()) {
      toast.error("Write a reply first");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/support/${active.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reply: reply.trim(),
          sendEmail,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        warning?: string;
        request?: SupportQueueRow;
      };
      if (!res.ok) throw new Error(json.error || "Could not save reply");
      if (json.warning) toast.warning(json.warning);
      else
        toast.success(
          sendEmail ? "Reply emailed to client" : "Reply saved",
        );
      if (json.request) {
        setActive({
          ...active,
          admin_notes: json.request.admin_notes ?? reply.trim(),
          status: json.request.status ?? active.status,
        });
      }
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save reply");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AdminTableShell>
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow className="hover:bg-transparent">
              <AdminTableHead>Client</AdminTableHead>
              <AdminTableHead className="hidden md:table-cell">
                Step
              </AdminTableHead>
              <AdminTableHead>Preview</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead className="hidden sm:table-cell">
                Received
              </AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {rows.length === 0 ? (
              <AdminTableEmpty colSpan={5}>No support requests.</AdminTableEmpty>
            ) : (
              rows.map((row) => {
                const stepTitle =
                  getStepDef(row.step_key ?? "")?.title ?? row.step_key ?? "—";
                return (
                  <AdminTableRow
                    key={row.id}
                    clickable
                    onClick={() => setActive(row)}
                  >
                    <AdminTableCell>
                      <p className="font-medium text-neutral-950">
                        {row.clientName}
                      </p>
                      <p className="text-xs text-neutral-500 md:hidden">
                        {stepTitle}
                      </p>
                    </AdminTableCell>
                    <AdminTableCell className="hidden max-w-[180px] truncate text-neutral-600 md:table-cell">
                      {stepTitle}
                    </AdminTableCell>
                    <AdminTableCell className="max-w-[280px]">
                      <p className="line-clamp-2 text-neutral-700">{row.body}</p>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminStatus status={row.status} />
                    </AdminTableCell>
                    <AdminTableCell className="hidden whitespace-nowrap text-xs text-neutral-500 sm:table-cell">
                      {new Date(row.created_at).toLocaleString()}
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })
            )}
          </AdminTableBody>
        </AdminTable>
      </AdminTableShell>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="flex flex-col gap-4 overflow-y-auto sm:max-w-md">
          {active ? (
            <>
              <SheetHeader>
                <SheetTitle>{active.clientName}</SheetTitle>
                <SheetDescription>
                  {[
                    active.clientEmail,
                    new Date(active.created_at).toLocaleString(),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-wrap items-center gap-2">
                <AdminStatus status={active.status} />
                <span className="text-xs text-neutral-500">
                  {getStepDef(active.step_key ?? "")?.title ??
                    active.step_key ??
                    "No step"}
                </span>
              </div>

              <div className="rounded-lg border border-neutral-100 bg-neutral-50/80 p-3">
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                  Client message
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
                  {active.body}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-reply">Reply to client</Label>
                <Textarea
                  id="support-reply"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={5}
                  placeholder="Write your reply. This is emailed to the client and shown in their portal."
                  className="resize-y text-sm"
                />
                <p className="text-xs text-neutral-500">
                  Sends to {active.clientEmail ?? "the client’s account email"}.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="fortuna"
                    size="sm"
                    disabled={busy || !reply.trim()}
                    onClick={() => sendReply(true)}
                  >
                    {busy ? "Sending…" : "Send reply"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy || !reply.trim()}
                    onClick={() => sendReply(false)}
                  >
                    Save only
                  </Button>
                </div>
              </div>

              <div className="space-y-2 border-t border-neutral-100 pt-4">
                <p className="text-xs font-medium text-neutral-500">Status</p>
                <AdminSupportStatus id={active.id} status={active.status} />
              </div>

              <Link
                href={`/dashboard/admin/clients/${active.user_id}`}
                className="text-sm font-medium text-[#8a6d1f] hover:underline"
              >
                Open client workspace →
              </Link>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

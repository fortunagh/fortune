"use client";

import Link from "next/link";
import * as React from "react";

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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getStepDef } from "@/lib/onboarding/steps";

export type SupportQueueRow = {
  id: string;
  user_id: string;
  body: string;
  status: string;
  step_key: string | null;
  created_at: string;
  clientName: string;
  clientEmail: string | null;
};

export function SupportQueue({ rows }: { rows: SupportQueueRow[] }) {
  const [active, setActive] = React.useState<SupportQueueRow | null>(null);

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
                  {[active.clientEmail, new Date(active.created_at).toLocaleString()]
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
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
                {active.body}
              </p>
              <div className="space-y-2 border-t border-neutral-100 pt-4">
                <p className="text-xs font-medium text-neutral-500">
                  Update status
                </p>
                <AdminSupportStatus id={active.id} status={active.status} />
              </div>
              <Button asChild variant="outline" size="sm" className="w-fit">
                <Link href={`/dashboard/admin/clients/${active.user_id}`}>
                  Open client workspace
                </Link>
              </Button>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

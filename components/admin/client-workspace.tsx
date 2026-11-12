"use client";

import Link from "next/link";
import { AdminStatus } from "@/components/admin/ui/admin-status";
import { AdminStepOverride } from "@/components/admin/admin-step-override";
import { AdminSupportStatus } from "@/components/admin/admin-support-status";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/billing/usage";

type StepState = {
  step_key: string;
  status: string;
  completed_at: string | null;
};

type SupportRow = {
  id: string;
  body: string;
  status: string;
  step_key: string | null;
  created_at: string;
};

type PaymentRow = {
  id: string;
  kind: string;
  amount_cents: number;
  currency: string;
  status: string;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
};

type AuditRow = {
  id: string;
  action: string;
  from_status: string | null;
  to_status: string | null;
  created_at: string;
  entity_type: string;
};

export function ClientWorkspace({
  userId,
  name,
  email,
  phone,
  caseStatus,
  caseId,
  currentStepKey,
  steps,
  states,
  support,
  payments,
  audit,
}: {
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  caseStatus: string;
  caseId: string;
  currentStepKey: string | null;
  steps: { key: string; title: string }[];
  states: StepState[];
  support: SupportRow[];
  payments: PaymentRow[];
  audit: AuditRow[];
}) {
  const stateByKey = new Map(states.map((s) => [s.step_key, s]));

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/dashboard/admin/clients"
          className="text-xs font-medium text-neutral-500 hover:text-[#8a6d1f]"
        >
          ← Clients
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl">
              {name}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              {[email, phone].filter(Boolean).join(" · ") || "No contact info"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AdminStatus status={caseStatus} />
            <span className="text-xs text-neutral-400">
              Case {caseId.slice(0, 8)}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200/80 bg-white p-3">
        <ol className="flex min-w-max gap-2">
          {steps.map((step, index) => {
            const st = stateByKey.get(step.key);
            const done =
              st?.status === "completed" ||
              st?.status === "skipped" ||
              !!st?.completed_at;
            const current = step.key === currentStepKey;
            return (
              <li
                key={step.key}
                className={cn(
                  "flex w-36 flex-col gap-1 rounded-lg border px-2.5 py-2",
                  done && "border-emerald-200 bg-emerald-50/60",
                  current && !done && "border-[#c59d3f]/50 bg-[hsl(var(--portal-gold-soft))]",
                  !done && !current && "border-neutral-100 bg-neutral-50/50",
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                  {index + 1}
                </span>
                <span className="text-xs font-medium leading-snug text-neutral-900">
                  {step.title}
                </span>
                <span className="text-[10px] capitalize text-neutral-500">
                  {done ? "Done" : current ? "Current" : st?.status ?? "Pending"}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="rounded-xl border border-neutral-200/80 bg-white p-4">
        <p className="mb-3 text-xs font-medium text-neutral-500">Admin override</p>
        <AdminStepOverride userId={userId} steps={steps} />
      </div>

      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <AdminTableShell>
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow className="hover:bg-transparent">
                  <AdminTableHead>Step</AdminTableHead>
                  <AdminTableHead>Status</AdminTableHead>
                  <AdminTableHead>Completed</AdminTableHead>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {steps.map((step) => {
                  const st = stateByKey.get(step.key);
                  return (
                    <AdminTableRow key={step.key}>
                      <AdminTableCell className="font-medium">
                        {step.title}
                      </AdminTableCell>
                      <AdminTableCell>
                        <AdminStatus status={st?.status ?? "pending"} />
                      </AdminTableCell>
                      <AdminTableCell className="text-xs text-neutral-500">
                        {st?.completed_at
                          ? new Date(st.completed_at).toLocaleString()
                          : "—"}
                      </AdminTableCell>
                    </AdminTableRow>
                  );
                })}
              </AdminTableBody>
            </AdminTable>
          </AdminTableShell>
        </TabsContent>

        <TabsContent value="support">
          <AdminTableShell>
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow className="hover:bg-transparent">
                  <AdminTableHead>Message</AdminTableHead>
                  <AdminTableHead>Status</AdminTableHead>
                  <AdminTableHead>Received</AdminTableHead>
                  <AdminTableHead>Update</AdminTableHead>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {support.length === 0 ? (
                  <AdminTableEmpty colSpan={4}>No support tickets.</AdminTableEmpty>
                ) : (
                  support.map((r) => (
                    <AdminTableRow key={r.id}>
                      <AdminTableCell className="max-w-[280px]">
                        <p className="line-clamp-2">{r.body}</p>
                      </AdminTableCell>
                      <AdminTableCell>
                        <AdminStatus status={r.status} />
                      </AdminTableCell>
                      <AdminTableCell className="whitespace-nowrap text-xs text-neutral-500">
                        {new Date(r.created_at).toLocaleString()}
                      </AdminTableCell>
                      <AdminTableCell>
                        <AdminSupportStatus id={r.id} status={r.status} />
                      </AdminTableCell>
                    </AdminTableRow>
                  ))
                )}
              </AdminTableBody>
            </AdminTable>
          </AdminTableShell>
        </TabsContent>

        <TabsContent value="payments">
          <AdminTableShell>
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow className="hover:bg-transparent">
                  <AdminTableHead>Kind</AdminTableHead>
                  <AdminTableHead>Amount</AdminTableHead>
                  <AdminTableHead>Status</AdminTableHead>
                  <AdminTableHead>When</AdminTableHead>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {payments.length === 0 ? (
                  <AdminTableEmpty colSpan={4}>No payments.</AdminTableEmpty>
                ) : (
                  payments.map((p) => (
                    <AdminTableRow key={p.id}>
                      <AdminTableCell>{p.kind}</AdminTableCell>
                      <AdminTableCell>
                        {formatMoney(p.amount_cents, p.currency)}
                      </AdminTableCell>
                      <AdminTableCell>
                        <AdminStatus status={p.status} />
                      </AdminTableCell>
                      <AdminTableCell className="text-xs text-neutral-500">
                        {new Date(p.created_at).toLocaleString()}
                      </AdminTableCell>
                    </AdminTableRow>
                  ))
                )}
              </AdminTableBody>
            </AdminTable>
          </AdminTableShell>
        </TabsContent>

        <TabsContent value="audit">
          <AdminTableShell>
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow className="hover:bg-transparent">
                  <AdminTableHead>When</AdminTableHead>
                  <AdminTableHead>Action</AdminTableHead>
                  <AdminTableHead>Change</AdminTableHead>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {audit.length === 0 ? (
                  <AdminTableEmpty colSpan={3}>No audit rows.</AdminTableEmpty>
                ) : (
                  audit.map((a) => (
                    <AdminTableRow key={a.id}>
                      <AdminTableCell className="whitespace-nowrap text-xs text-neutral-500">
                        {new Date(a.created_at).toLocaleString()}
                      </AdminTableCell>
                      <AdminTableCell>{a.action}</AdminTableCell>
                      <AdminTableCell className="text-xs text-neutral-600">
                        {a.from_status ?? "∅"} → {a.to_status ?? "∅"}
                      </AdminTableCell>
                    </AdminTableRow>
                  ))
                )}
              </AdminTableBody>
            </AdminTable>
          </AdminTableShell>
        </TabsContent>
      </Tabs>
    </div>
  );
}

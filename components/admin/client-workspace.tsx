"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Clock3,
  CreditCard,
  Mail,
  Phone,
  Shield,
  UserRound,
} from "lucide-react";

import { AdminClientDanger } from "@/components/admin/admin-client-danger";
import { AdminStepActions } from "@/components/admin/admin-step-actions";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STEP_PHASES, type StepPhase } from "@/lib/onboarding/steps";
import { formatMoney } from "@/lib/billing/usage";
import { cn } from "@/lib/utils";

type StepState = {
  step_key: string;
  status: string;
  completed_at: string | null;
  unlocked_at: string | null;
  confirmation_source: string | null;
  payload: Record<string, unknown>;
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

type QuestionnaireSummary = {
  review_status: string | null;
  account_opening_method: string | null;
  tax_residency_country: string | null;
  passport_issuing_country: string | null;
  can_provide_proof_of_address: boolean | null;
  submitted_at: string | null;
} | null;

type StepMeta = {
  key: string;
  title: string;
  phase: StepPhase;
  sort: number;
};

function isDone(st: StepState | undefined) {
  return (
    st?.status === "completed" ||
    st?.status === "skipped" ||
    !!st?.completed_at
  );
}

function MetaChip({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white px-3 py-2.5 shadow-[0_1px_0_rgba(16,18,23,0.03)]">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-1 text-sm font-medium text-neutral-900">{value}</p>
    </div>
  );
}

export function ClientWorkspace({
  userId,
  name,
  email,
  phone,
  caseStatus,
  caseId,
  currentStepKey,
  requiresOnboardingFee,
  demoTimerStartedAt,
  readinessUnlockedAt,
  liveActivatedAt,
  demoDays,
  steps,
  states,
  support,
  payments,
  audit,
  questionnaire,
}: {
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  caseStatus: string;
  caseId: string;
  currentStepKey: string | null;
  requiresOnboardingFee: boolean;
  demoTimerStartedAt: string | null;
  readinessUnlockedAt: string | null;
  liveActivatedAt: string | null;
  demoDays: number;
  steps: StepMeta[];
  states: StepState[];
  support: SupportRow[];
  payments: PaymentRow[];
  audit: AuditRow[];
  questionnaire: QuestionnaireSummary;
}) {
  const stateByKey = new Map(states.map((s) => [s.step_key, s]));
  const completedCount = states.filter((s) => isDone(s)).length;
  const total = steps.length;
  const pct = total ? Math.round((completedCount / total) * 100) : 0;
  const currentTitle =
    steps.find((s) => s.key === currentStepKey)?.title ?? "—";

  const openSupport = support.filter(
    (s) => s.status === "open" || s.status === "in_progress",
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <div className="space-y-4">
        <Link
          href="/dashboard/admin/clients"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-[#8a6d1f]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Clients
        </Link>

        <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-white via-white to-[hsl(var(--portal-gold-soft))]/40 shadow-[0_10px_40px_rgba(16,18,23,0.04)]">
          <div className="border-b border-neutral-100/80 px-5 py-5 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
                    {name}
                  </h1>
                  <AdminStatus status={caseStatus} />
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
                  {email ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-neutral-400" />
                      {email}
                    </span>
                  ) : null}
                  {phone ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-neutral-400" />
                      {phone}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5 text-neutral-400">
                    <UserRound className="h-3.5 w-3.5" />
                    {userId.slice(0, 8)}…
                  </span>
                </div>
              </div>
              <div className="min-w-[180px] flex-1 sm:max-w-xs">
                <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-neutral-500">
                  <span>Journey</span>
                  <span>
                    {completedCount}/{total} · {pct}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-[#c59d3f] transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-neutral-600">
                  Current:{" "}
                  <span className="font-medium text-neutral-900">
                    {currentTitle}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
            <MetaChip
              icon={CreditCard}
              label="Onboarding fee"
              value={requiresOnboardingFee ? "Required" : "Waived"}
            />
            <MetaChip
              icon={Clock3}
              label="Demo practice"
              value={
                demoTimerStartedAt
                  ? `Day ${demoDays} of 28`
                  : "Not started"
              }
            />
            <MetaChip
              icon={Shield}
              label="Readiness"
              value={
                readinessUnlockedAt
                  ? `Unlocked ${new Date(readinessUnlockedAt).toLocaleDateString()}`
                  : "Locked"
              }
            />
            <MetaChip
              icon={UserRound}
              label="Live / case"
              value={
                liveActivatedAt
                  ? `Live ${new Date(liveActivatedAt).toLocaleDateString()}`
                  : `Case ${caseId.slice(0, 8)}`
              }
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-neutral-200/80 bg-white shadow-[0_10px_40px_rgba(16,18,23,0.03)]">
          <div className="border-b border-neutral-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-neutral-950">
              Onboarding journey
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              Force complete or undo any step. Undo reopens that step and locks
              everything after it.
            </p>
          </div>
          <div className="divide-y divide-neutral-100">
            {STEP_PHASES.map((phase) => {
              const phaseSteps = steps.filter((s) => s.phase === phase.id);
              if (phaseSteps.length === 0) return null;
              return (
                <div key={phase.id} className="px-3 py-3 sm:px-4">
                  <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    {phase.label}
                  </p>
                  <ul className="space-y-1.5">
                    {phaseSteps.map((step) => {
                      const st = stateByKey.get(step.key);
                      const done = isDone(st);
                      const current = step.key === currentStepKey;
                      const canComplete = !done && step.key !== "request_access";
                      const canUndo =
                        step.key !== "request_access" &&
                        (done ||
                          current ||
                          st?.status === "available" ||
                          st?.status === "in_progress" ||
                          st?.status === "awaiting" ||
                          !!st?.unlocked_at);

                      return (
                        <li
                          key={step.key}
                          className={cn(
                            "flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2.5",
                            done && "border-emerald-100 bg-emerald-50/40",
                            current &&
                              !done &&
                              "border-[#c59d3f]/45 bg-[hsl(var(--portal-gold-soft))]",
                            !done &&
                              !current &&
                              "border-transparent bg-neutral-50/60",
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-semibold tabular-nums text-neutral-400">
                                {String(step.sort).padStart(2, "0")}
                              </span>
                              <p className="text-sm font-medium text-neutral-900">
                                {step.title}
                              </p>
                              <AdminStatus status={st?.status ?? "locked"} />
                              {current ? (
                                <span className="rounded-full bg-[#c59d3f]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#8a6d1f]">
                                  Current
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-[11px] text-neutral-500">
                              {st?.completed_at
                                ? `Completed ${new Date(st.completed_at).toLocaleString()}${
                                    st.confirmation_source
                                      ? ` · ${st.confirmation_source}`
                                      : ""
                                  }`
                                : st?.unlocked_at
                                  ? `Unlocked ${new Date(st.unlocked_at).toLocaleString()}`
                                  : "Locked"}
                            </p>
                          </div>
                          <AdminStepActions
                            userId={userId}
                            stepKey={step.key}
                            stepTitle={step.title}
                            status={st?.status ?? "locked"}
                            canComplete={canComplete}
                            canUndo={Boolean(canUndo && (done || current))}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_10px_40px_rgba(16,18,23,0.03)]">
            <h2 className="text-sm font-semibold text-neutral-950">
              Snapshot
            </h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Open support</dt>
                <dd className="font-medium text-neutral-900">{openSupport}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Payments</dt>
                <dd className="font-medium text-neutral-900">
                  {payments.length}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Questionnaire</dt>
                <dd className="font-medium capitalize text-neutral-900">
                  {questionnaire?.review_status?.replace(/_/g, " ") ??
                    "Not submitted"}
                </dd>
              </div>
            </dl>
            {questionnaire ? (
              <div className="mt-4 space-y-2 rounded-xl bg-neutral-50 px-3 py-3 text-xs text-neutral-600">
                <p>
                  Structure:{" "}
                  <span className="font-medium text-neutral-900">
                    {questionnaire.account_opening_method ?? "—"}
                  </span>
                </p>
                <p>
                  Tax residency:{" "}
                  <span className="font-medium text-neutral-900">
                    {questionnaire.tax_residency_country ?? "—"}
                  </span>
                </p>
                <p>
                  Passport:{" "}
                  <span className="font-medium text-neutral-900">
                    {questionnaire.passport_issuing_country ?? "—"}
                  </span>
                </p>
                <p>
                  Proof of address:{" "}
                  <span className="font-medium text-neutral-900">
                    {questionnaire.can_provide_proof_of_address == null
                      ? "—"
                      : questionnaire.can_provide_proof_of_address
                        ? "Yes"
                        : "No"}
                  </span>
                </p>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-red-200/70 bg-white p-5 shadow-[0_10px_40px_rgba(16,18,23,0.03)]">
            <h2 className="text-sm font-semibold text-red-950">Danger zone</h2>
            <p className="mt-1 text-xs text-neutral-500">
              Soft reset keeps the login. Full wipe deletes the account so the
              email can re-register.
            </p>
            <div className="mt-4">
              <AdminClientDanger
                userId={userId}
                email={email}
                requiresOnboardingFee={requiresOnboardingFee}
              />
            </div>
          </section>
        </aside>
      </div>

      <Tabs defaultValue="support" className="space-y-3">
        <TabsList>
          <TabsTrigger value="support">
            Support{support.length ? ` (${support.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="payments">
            Payments{payments.length ? ` (${payments.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

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
                      <AdminTableCell className="max-w-[320px]">
                        <p className="line-clamp-2">{r.body}</p>
                        {r.step_key ? (
                          <p className="mt-1 text-[11px] text-neutral-400">
                            Step: {r.step_key}
                          </p>
                        ) : null}
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
                      <AdminTableCell>
                        <span className="font-medium">{a.action}</span>
                        <span className="ml-2 text-[11px] text-neutral-400">
                          {a.entity_type}
                        </span>
                      </AdminTableCell>
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

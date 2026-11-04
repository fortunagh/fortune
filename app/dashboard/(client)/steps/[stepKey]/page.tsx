import Link from "next/link";
import { notFound } from "next/navigation";

import { QuestionnaireForm } from "@/components/portal/questionnaire-form";
import { StepActionBar } from "@/components/portal/current-step-panel";
import { JourneyTimeline } from "@/components/portal/journey-timeline";
import {
  PageHeader,
  SoftNotice,
  WidgetCard,
} from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import {
  demoDaysElapsed,
  getCaseForUser,
  readinessUnlocked,
} from "@/lib/onboarding/case";
import {
  DEMO_READINESS_ITEMS,
  DEFAULT_LINKS,
  getStepDef,
} from "@/lib/onboarding/steps";
import { createClient } from "@/lib/supabase/server";
import { LiveInstallActions } from "@/components/portal/live-install-actions";
import { DemoReadinessForm } from "@/components/portal/demo-readiness-form";
import { ResourceList } from "@/components/portal/resource-list";
import { requireRequest } from "@/lib/onboarding/connection";

export default async function StepPage({
  params,
}: {
  params: Promise<{ stepKey: string }>;
}) {
  await requireRequest();
  const { stepKey } = await params;
  const def = getStepDef(stepKey);
  if (!def) notFound();

  const session = await getSessionProfile();
  if (!session?.user) return null;

  const supabase = await createClient();
  const { caseRow, states } = await getCaseForUser(supabase, session.user.id);
  if (!caseRow) notFound();

  const state = states.find((s) => s.step_key === stepKey);
  const locked = !state || state.status === "locked";
  const completed = state?.status === "completed";

  const { data: brokers } = await supabase
    .from("brokers")
    .select("id, name, referral_url, secure_portal_url")
    .eq("active", true)
    .order("sort_order");

  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("published", true)
    .contains("related_step_keys", [stepKey]);

  const demoDays = demoDaysElapsed(caseRow.demo_timer_started_at);
  const ready = readinessUnlocked(
    caseRow.demo_timer_started_at,
    caseRow.readiness_unlocked_at,
  );

  const railStates = states.map((s) => ({
    key: s.step_key,
    status: s.status,
    completedAt: s.completed_at,
  }));

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="hidden lg:block">
        <WidgetCard>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            My Journey
          </p>
          <JourneyTimeline
            states={railStates}
            currentKey={caseRow.current_step_key}
          />
        </WidgetCard>
      </aside>

      <div className="space-y-5">
        <PageHeader
          eyebrow={def.eyebrow}
          title={def.title}
          description={def.description}
        />

        {locked ? (
          <SoftNotice>
            This step is locked until previous milestones are complete.
          </SoftNotice>
        ) : null}

        {completed ? (
          <SoftNotice variant="success">This step is complete.</SoftNotice>
        ) : null}

        {stepKey === "questionnaire" && !completed && !locked ? (
          <WidgetCard>
            <QuestionnaireForm
              brokers={(brokers ?? []).map((b) => ({
                id: b.id,
                name: b.name,
              }))}
            />
          </WidgetCard>
        ) : null}

        {(stepKey === "broker_demo" || stepKey === "live_licence_apply") &&
        (brokers?.length ?? 0) > 0 ? (
          <WidgetCard className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Approved brokers
            </p>
            <ul className="space-y-3">
              {(brokers ?? []).map((b) => (
                <li
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-sm font-medium text-neutral-900">
                    {b.name}
                  </span>
                  <div className="flex gap-2">
                    {b.referral_url ? (
                      <Button asChild size="sm" variant="fortuna">
                        <a href={b.referral_url} target="_blank" rel="noreferrer">
                          Referral link
                        </a>
                      </Button>
                    ) : null}
                    {b.secure_portal_url ? (
                      <Button asChild size="sm" variant="outline" className="rounded-xl">
                        <a
                          href={b.secure_portal_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Secure portal
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
            {(brokers ?? []).every((b) => !b.referral_url) ? (
              <SoftNotice>
                Fortuna has not published broker referral links yet.
              </SoftNotice>
            ) : null}
          </WidgetCard>
        ) : null}

        {stepKey === "demo_readiness" && !completed && !locked ? (
          <WidgetCard>
            {!ready ? (
              <SoftNotice variant="warning">
                Day {demoDays} of 28. Keep practising — the checklist unlocks
                after 28 days from demo install.
              </SoftNotice>
            ) : (
              <DemoReadinessForm items={[...DEMO_READINESS_ITEMS]} />
            )}
          </WidgetCard>
        ) : null}

        {stepKey === "live_install" && !completed && !locked ? (
          <WidgetCard className="space-y-4">
            <SoftNotice variant="warning">
              <strong>
                Before you turn on Algo Trading in MT5 on your live account, set,
                save and verify your Equity Protect parameters.
              </strong>{" "}
              Enabling Algo Trading activates the EA and allows it to place live
              trades automatically. You are responsible for risk settings.
            </SoftNotice>
            <LiveInstallActions
              payload={(state?.payload as Record<string, unknown>) ?? {}}
            />
          </WidgetCard>
        ) : null}

        {(resources?.length ?? 0) > 0 ? (
          <WidgetCard>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Guides
            </p>
            <ResourceList resources={resources ?? []} />
          </WidgetCard>
        ) : (
          <SoftNotice>
            Guides for this step will appear here when Fortuna publishes them.
          </SoftNotice>
        )}

        {stepKey === "vps_setup" ? (
          <SoftNotice>
            Affiliate signup:{" "}
            <a
              className="font-medium text-[#a8842a] underline"
              href={DEFAULT_LINKS.forexVps}
              target="_blank"
              rel="noreferrer"
            >
              ForexVPS
            </a>
            . VPS setup PDF/video are admin-uploadable resources.
          </SoftNotice>
        ) : null}

        {!locked &&
        !completed &&
        stepKey !== "questionnaire" &&
        stepKey !== "demo_readiness" &&
        stepKey !== "live_install" ? (
          <WidgetCard>
            <StepActionBar
              stepKey={stepKey}
              confirmLabel={def.confirmLabel}
              confirmationKind={def.confirmationKind}
              disabled={stepKey === "demo_readiness" && !ready}
            />
          </WidgetCard>
        ) : null}

        <Button asChild variant="ghost" className="rounded-xl px-0 text-neutral-600">
          <Link href="/dashboard">← Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

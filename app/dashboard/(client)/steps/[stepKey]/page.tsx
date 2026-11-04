import Link from "next/link";
import { notFound } from "next/navigation";

import { QuestionnaireForm } from "@/components/portal/questionnaire-form";
import { StepActionBar } from "@/components/portal/current-step-panel";
import { ProgressRail } from "@/components/portal/progress-rail";
import {
  BronzeRule,
  Eyebrow,
  NoticeBlock,
  PortalCard,
  PortalSubtitle,
  PortalTitle,
} from "@/components/portal/portal-primitives";
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

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">
        <Eyebrow>Progress</Eyebrow>
        <BronzeRule className="my-3" />
        <ProgressRail
          currentKey={caseRow.current_step_key}
          states={states.map((s) => ({
            key: s.step_key,
            status: s.status,
            completedAt: s.completed_at,
          }))}
        />
      </aside>

      <div className="space-y-6">
        <div>
          <Eyebrow>{def.eyebrow}</Eyebrow>
          <PortalTitle className="mt-2">{def.title}</PortalTitle>
          <BronzeRule className="mt-4" />
          <PortalSubtitle className="mt-4">{def.description}</PortalSubtitle>
        </div>

        {locked ? (
          <NoticeBlock>
            This step is locked until previous milestones are complete.
          </NoticeBlock>
        ) : null}

        {completed ? (
          <NoticeBlock>This step is complete.</NoticeBlock>
        ) : null}

        {stepKey === "questionnaire" && !completed && !locked ? (
          <PortalCard className="p-6">
            <QuestionnaireForm
              brokers={(brokers ?? []).map((b) => ({
                id: b.id,
                name: b.name,
              }))}
            />
          </PortalCard>
        ) : null}

        {(stepKey === "broker_demo" || stepKey === "live_licence_apply") &&
        (brokers?.length ?? 0) > 0 ? (
          <PortalCard className="space-y-3 p-6">
            <Eyebrow>Approved brokers</Eyebrow>
            <ul className="space-y-3 pt-2">
              {(brokers ?? []).map((b) => (
                <li
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3"
                >
                  <span className="font-[Arial,Helvetica,sans-serif] text-sm font-medium">
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
                      <Button asChild size="sm" variant="outline" className="rounded-none">
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
              <NoticeBlock>
                Fortuna has not published broker referral links yet.
              </NoticeBlock>
            ) : null}
          </PortalCard>
        ) : null}

        {stepKey === "demo_readiness" && !completed && !locked ? (
          <PortalCard className="p-6">
            {!ready ? (
              <NoticeBlock>
                Day {demoDays} of 28. Keep practising — the checklist unlocks
                after 28 days from demo install.
              </NoticeBlock>
            ) : (
              <DemoReadinessForm items={[...DEMO_READINESS_ITEMS]} />
            )}
          </PortalCard>
        ) : null}

        {stepKey === "live_install" && !completed && !locked ? (
          <PortalCard className="space-y-4 p-6">
            <NoticeBlock variant="warning">
              <strong>
                Before you turn on Algo Trading in MT5 on your live account, set,
                save and verify your Equity Protect parameters.
              </strong>{" "}
              Enabling Algo Trading activates the EA and allows it to place live
              trades automatically. You are responsible for risk settings.
            </NoticeBlock>
            <LiveInstallActions
              payload={(state?.payload as Record<string, unknown>) ?? {}}
            />
          </PortalCard>
        ) : null}

        {(resources?.length ?? 0) > 0 ? (
          <PortalCard className="p-6">
            <Eyebrow>Guides</Eyebrow>
            <div className="mt-4">
              <ResourceList resources={resources ?? []} />
            </div>
          </PortalCard>
        ) : (
          <NoticeBlock>
            Guides for this step will appear here when Fortuna publishes them.
          </NoticeBlock>
        )}

        {stepKey === "vps_setup" ? (
          <NoticeBlock>
            Affiliate signup:{" "}
            <a
              className="underline"
              href={DEFAULT_LINKS.forexVps}
              target="_blank"
              rel="noreferrer"
            >
              ForexVPS
            </a>
            . VPS setup PDF/video are admin-uploadable resources.
          </NoticeBlock>
        ) : null}

        {!locked &&
        !completed &&
        stepKey !== "questionnaire" &&
        stepKey !== "demo_readiness" &&
        stepKey !== "live_install" ? (
          <StepActionBar
            stepKey={stepKey}
            confirmLabel={def.confirmLabel}
            confirmationKind={def.confirmationKind}
            disabled={stepKey === "demo_readiness" && !ready}
          />
        ) : null}

        <Button asChild variant="ghost" className="rounded-none px-0">
          <Link href="/dashboard">← Back to overview</Link>
        </Button>
      </div>
    </div>
  );
}

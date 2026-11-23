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

const LICENCE_PORTAL_SIGNIN =
  "https://clients.fortunaglobalholdings.com/login";

export default async function StepPage({
  params,
  searchParams,
}: {
  params: Promise<{ stepKey: string }>;
  searchParams: Promise<{ paid?: string; cancelled?: string }>;
}) {
  await requireRequest();
  const { stepKey } = await params;
  const { paid, cancelled } = await searchParams;
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

  const { data: questionnaire } =
    stepKey === "questionnaire"
      ? await supabase
          .from("questionnaire_responses")
          .select(
            "account_opening_method, entity_type, tax_residency_country, passport_issuing_country, ultimate_beneficial_owner, review_status, updated_at",
          )
          .eq("user_id", session.user.id)
          .maybeSingle()
      : { data: null };

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

  const hasGuides = (resources?.length ?? 0) > 0;

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

        {paid === "1" && !completed ? (
          <SoftNotice variant="success">
            Payment received. Your portal updates when Stripe confirms the
            charge — refresh in a moment if this step still looks unpaid.
          </SoftNotice>
        ) : null}
        {cancelled === "1" && !completed ? (
          <SoftNotice variant="warning">
            Checkout was cancelled. You can try paying again when ready.
          </SoftNotice>
        ) : null}

        {locked ? (
          <SoftNotice>
            This step is locked until previous milestones are complete.
          </SoftNotice>
        ) : null}

        {completed && stepKey !== "questionnaire" ? (
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

        {stepKey === "questionnaire" && completed ? (
          <WidgetCard className="space-y-3">
            <SoftNotice variant="success">
              Questionnaire submitted
              {questionnaire?.updated_at
                ? ` on ${new Date(questionnaire.updated_at).toLocaleDateString()}`
                : ""}
              . Your answers are on file
              {questionnaire?.review_status
                ? ` (status: ${questionnaire.review_status.replace(/_/g, " ")})`
                : ""}
              .
            </SoftNotice>
            {questionnaire ? (
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-neutral-500">
                    Account opening
                  </dt>
                  <dd className="mt-1 text-neutral-900">
                    {questionnaire.account_opening_method ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-neutral-500">
                    Entity type
                  </dt>
                  <dd className="mt-1 text-neutral-900">
                    {questionnaire.entity_type ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-neutral-500">
                    Tax residency
                  </dt>
                  <dd className="mt-1 text-neutral-900">
                    {questionnaire.tax_residency_country ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-neutral-500">
                    Passport country
                  </dt>
                  <dd className="mt-1 text-neutral-900">
                    {questionnaire.passport_issuing_country ?? "—"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-neutral-600">
                Submitted — answers on file. Contact support if you need a
                correction.
              </p>
            )}
          </WidgetCard>
        ) : null}

        {stepKey === "vps_setup" && !locked ? (
          <WidgetCard className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              What is a VPS?
            </p>
            <p className="text-sm leading-relaxed text-neutral-700">
              A VPS (Virtual Private Server) is a remote Windows computer that
              stays online so MetaTrader 5 and your Fortuna EA can run 24/7 —
              not your laptop.
            </p>
            <p className="text-sm text-neutral-600">
              Click the ForexVPS signup link below, follow the video guide, then
              confirm when your VPS is ready.
            </p>
            <Button asChild variant="fortuna" size="sm">
              <a
                href={DEFAULT_LINKS.forexVps}
                target="_blank"
                rel="noreferrer"
              >
                Click the ForexVPS signup link
              </a>
            </Button>
          </WidgetCard>
        ) : null}

        {stepKey === "broker_demo" && !locked ? (
          <WidgetCard className="space-y-3">
            <p className="text-sm leading-relaxed text-neutral-700">
              Choose a broker from your approved options and use its signup
              link. It is important to use the link provided so your account is
              grouped correctly with the broker for EA operations.
            </p>
            <p className="text-sm text-neutral-600">
              Open a <strong>demo</strong> account on <strong>MT5</strong> with{" "}
              <strong>USD</strong> as the account currency,{" "}
              <strong>500:1</strong> leverage and a{" "}
              <strong>USD 100,000</strong> demo balance. Keep your account
              number and exact demo server handy.
            </p>
          </WidgetCard>
        ) : null}

        {stepKey === "licence_portal" && !locked ? (
          <WidgetCard className="space-y-3">
            <p className="text-sm leading-relaxed text-neutral-700">
              Connect to your VPS and open a web browser inside it, such as
              Microsoft Edge or Google Chrome. Paste the signup link into the
              address bar. If you are copying from a Mac, use{" "}
              <strong>Command+C</strong> on your Mac and{" "}
              <strong>Control+V</strong> inside the Windows VPS.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="fortuna" size="sm">
                <a
                  href={DEFAULT_LINKS.licencePortalSignup}
                  target="_blank"
                  rel="noreferrer"
                >
                  Register in the Fortuna licence portal
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <a href={LICENCE_PORTAL_SIGNIN} target="_blank" rel="noreferrer">
                  Licence portal sign-in
                </a>
              </Button>
            </div>
          </WidgetCard>
        ) : null}

        {stepKey === "demo_licence_apply" && !locked ? (
          <WidgetCard className="space-y-3">
            <p className="text-sm leading-relaxed text-neutral-700">
              Review the EA comparison guide to choose the EA you want to use.
              Sign in to the licence portal and follow the licence application
              section of the setup guide. Select <strong>Demo</strong> and use
              the account number and exact demo server from your broker.
            </p>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <a href={LICENCE_PORTAL_SIGNIN} target="_blank" rel="noreferrer">
                Licence portal sign-in
              </a>
            </Button>
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
                        <a
                          href={b.referral_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Signup link
                        </a>
                      </Button>
                    ) : null}
                    {b.secure_portal_url ? (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                      >
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
                Broker signup links are not published yet. Contact support if
                you need help.
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

        {hasGuides ? (
          <WidgetCard>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Guides
            </p>
            <ResourceList resources={resources ?? []} />
          </WidgetCard>
        ) : !locked &&
          stepKey !== "questionnaire" &&
          stepKey !== "onboarding_payment" &&
          stepKey !== "request_access" ? (
          <SoftNotice>
            Guides for this step are being prepared. You can still follow the
            instructions above and confirm when ready.
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

        <Button
          asChild
          variant="ghost"
          className="rounded-xl px-0 text-neutral-600"
        >
          <Link href="/dashboard">← Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

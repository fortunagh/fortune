import Link from "next/link";
import { ExternalLink, Target } from "lucide-react";

import { AssistantPanel } from "@/components/portal/assistant-panel";
import { JourneyTimeline } from "@/components/portal/journey-timeline";
import { ResourceList } from "@/components/portal/resource-list";
import { StepActionBar } from "@/components/portal/current-step-panel";
import {
  PortalMuted,
  PortalPageTitle,
  ProgressBar,
  WidgetCard,
  fortunaDisplayClass,
  fortunaUiClass,
} from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import {
  bootstrapOnboardingCase,
  demoDaysElapsed,
  getCaseForUser,
  readinessUnlocked,
} from "@/lib/onboarding/case";
import { requireRequest } from "@/lib/onboarding/connection";
import { getStepDef, ONBOARDING_STEPS } from "@/lib/onboarding/steps";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { cn } from "@/lib/utils";

export default async function ClientHomePage() {
  await requireRequest();
  const session = await getSessionProfile();
  if (!session?.user) return null;

  const supabase = await createClient();
  let { caseRow, states } = await getCaseForUser(supabase, session.user.id);

  if (!caseRow) {
    try {
      const admin = createServiceRoleClient();
      await bootstrapOnboardingCase(admin, session.user.id);
      ({ caseRow, states } = await getCaseForUser(supabase, session.user.id));
    } catch {
      /* empty */
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", session.user.id)
    .maybeSingle();

  if (!caseRow) {
    return (
      <WidgetCard className="mx-auto max-w-lg text-center">
        <PortalPageTitle className="text-2xl">Activation pending</PortalPageTitle>
        <PortalMuted className="mt-2">
          Your onboarding case will appear after your Fortuna invitation is
          activated.
        </PortalMuted>
      </WidgetCard>
    );
  }

  const firstName =
    profile?.first_name ||
    session.user.email?.split("@")[0] ||
    "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const completed = states.filter((s) => s.status === "completed").length;
  const total = ONBOARDING_STEPS.length;
  const pct = Math.round((completed / total) * 100);
  const currentKey = caseRow.current_step_key;
  const def = currentKey ? getStepDef(currentKey) : null;
  const currentIndex = currentKey
    ? ONBOARDING_STEPS.findIndex((s) => s.key === currentKey)
    : -1;
  const nextDef =
    currentIndex >= 0 && currentIndex < ONBOARDING_STEPS.length - 1
      ? ONBOARDING_STEPS[currentIndex + 1]
      : null;

  const demoDays = demoDaysElapsed(caseRow.demo_timer_started_at);
  const ready = readinessUnlocked(
    caseRow.demo_timer_started_at,
    caseRow.readiness_unlocked_at,
  );

  const { data: brokers } = await supabase
    .from("brokers")
    .select("id, name, referral_url, secure_portal_url")
    .eq("active", true)
    .order("sort_order")
    .limit(6);

  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("published", true)
    .order("sort_order")
    .limit(4);

  const railStates = states.map((s) => ({
    key: s.step_key,
    status: s.status,
    completedAt: s.completed_at,
  }));

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <PortalPageTitle>
            {greeting}, {firstName}.
          </PortalPageTitle>
          <PortalMuted className="mt-2">
            Continue your onboarding journey with Fortuna.
          </PortalMuted>
        </div>
        {def ? (
          <Button asChild variant="fortuna" className="w-full sm:w-auto">
            <Link href={`/dashboard/steps/${def.key}`}>Continue Setup →</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <WidgetCard className="md:col-span-2">
          <p className={cn(fortunaUiClass, "text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500")}>
            Overall progress
          </p>
          <p className={cn(fortunaDisplayClass, "mt-2 text-4xl text-neutral-950")}>
            {pct}%
          </p>
          <ProgressBar value={pct} className="mt-4" />
          <p className="mt-2 text-sm text-neutral-500">
            {completed} of {total} steps completed
          </p>
        </WidgetCard>
        <WidgetCard>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--portal-gold-soft))] text-[#a8842a]">
              <Target className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className={cn(fortunaUiClass, "text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500")}>
                Current step
              </p>
              <p className="mt-1 text-base font-semibold text-neutral-950">
                {def?.title ?? "—"}
              </p>
            </div>
          </div>
        </WidgetCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <WidgetCard className="lg:col-span-3">
          <p className={cn(fortunaUiClass, "mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500")}>
            Onboarding journey
          </p>
          <JourneyTimeline
            states={railStates}
            currentKey={currentKey}
            limit={8}
          />
          <Button asChild variant="outline" className="mt-2 w-full rounded-xl">
            <Link href={currentKey ? `/dashboard/steps/${currentKey}` : "/dashboard"}>
              View all {total} steps
            </Link>
          </Button>
        </WidgetCard>

        <WidgetCard className="lg:col-span-5">
          {def ? (
            <div className="space-y-4">
              <span className="inline-flex rounded-full bg-[hsl(var(--portal-gold-soft))] px-3 py-1 text-xs font-semibold text-[#8a6d1f]">
                Step {def.sort} of {total}
              </span>
              <h2 className={cn(fortunaDisplayClass, "text-2xl text-neutral-950")}>
                {def.title}
              </h2>
              <p className="text-sm leading-relaxed text-neutral-600">
                {def.description}
              </p>
              {def.key === "demo_readiness" && !ready ? (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Demo practice day {demoDays} of 28.
                </p>
              ) : null}

              {(brokers?.length ?? 0) > 0 &&
              (def.key === "broker_demo" ||
                def.key === "live_licence_apply") ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                    Approved brokers
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(brokers ?? []).map((b) => (
                      <a
                        key={b.id}
                        href={b.referral_url || b.secure_portal_url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-800 hover:border-[#c59d3f]/50"
                      >
                        {b.name}
                        <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              {(brokers?.length ?? 0) === 0 &&
              (def.key === "broker_demo" ||
                def.key === "live_licence_apply") ? (
                <p className="text-sm text-neutral-500">
                  Fortuna has not published broker links yet.
                </p>
              ) : null}

              <StepActionBar
                stepKey={def.key}
                confirmLabel={def.confirmLabel}
                confirmationKind={def.confirmationKind}
                disabled={def.key === "demo_readiness" && !ready}
              />
            </div>
          ) : (
            <PortalMuted>No active step.</PortalMuted>
          )}
        </WidgetCard>

        <div className="space-y-4 lg:col-span-4">
          <WidgetCard>
            <p className={cn(fortunaUiClass, "mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500")}>
              Fortuna Assistant
            </p>
            <AssistantPanel stepKey={currentKey} />
          </WidgetCard>
          <WidgetCard>
            <p className={cn(fortunaUiClass, "mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500")}>
              Resources
            </p>
            {(resources?.length ?? 0) > 0 ? (
              <ResourceList resources={resources ?? []} />
            ) : (
              <PortalMuted>No guides published yet.</PortalMuted>
            )}
            <Link
              href="/dashboard/resources"
              className="mt-3 inline-block text-sm font-medium text-[#b8922e] hover:underline"
            >
              View all resources →
            </Link>
          </WidgetCard>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <WidgetCard>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Next milestone
          </p>
          <p className="mt-2 text-base font-semibold text-neutral-950">
            {nextDef?.title ?? "Onboarding complete"}
          </p>
        </WidgetCard>
        <WidgetCard>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Demo practice
          </p>
          <p className="mt-2 text-base font-semibold text-neutral-950">
            {caseRow.demo_timer_started_at
              ? `Day ${demoDays} of 28`
              : "Not started"}
          </p>
        </WidgetCard>
        <WidgetCard className="flex flex-col justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Need support?
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              Software help without sharing credentials.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <Link
              href={`/dashboard/support${currentKey ? `?step=${currentKey}` : ""}`}
            >
              Create support ticket →
            </Link>
          </Button>
        </WidgetCard>
      </div>
    </div>
  );
}

import Link from "next/link";

import { CurrentStepPanel } from "@/components/portal/current-step-panel";
import { ProgressRail } from "@/components/portal/progress-rail";
import {
  BronzeRule,
  Eyebrow,
  PortalCard,
  PortalEmpty,
} from "@/components/portal/portal-primitives";
import { demoDaysElapsed, getCaseForUser } from "@/lib/onboarding/case";
import { readinessUnlocked } from "@/lib/onboarding/case";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { bootstrapOnboardingCase } from "@/lib/onboarding/case";
import { requireRequest } from "@/lib/onboarding/connection";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export default async function ClientHomePage() {
  await requireRequest();
  const session = await getSessionProfile();
  if (!session?.user) return null;

  const supabase = await createClient();
  let { caseRow, states } = await getCaseForUser(supabase, session.user.id);

  if (!caseRow) {
    // Activated users without a case yet (e.g. invited before migration)
    try {
      const admin = createServiceRoleClient();
      await bootstrapOnboardingCase(admin, session.user.id);
      ({ caseRow, states } = await getCaseForUser(supabase, session.user.id));
    } catch {
      /* show empty */
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", session.user.id)
    .maybeSingle();

  if (!caseRow) {
    return (
      <PortalEmpty
        title="Activation pending"
        description="Your onboarding case will appear after your Fortuna invitation is activated."
      />
    );
  }

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
        <CurrentStepPanel
          stepKey={caseRow.current_step_key}
          firstName={profile?.first_name}
          demoDays={demoDays}
          readinessReady={ready}
        />

        <PortalCard className="p-5 lg:hidden">
          <Eyebrow>Progress</Eyebrow>
          <div className="mt-4">
            <ProgressRail
              currentKey={caseRow.current_step_key}
              states={states.map((s) => ({
                key: s.step_key,
                status: s.status,
                completedAt: s.completed_at,
              }))}
            />
          </div>
        </PortalCard>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="rounded-none">
            <Link href="/dashboard/resources">Resources</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-none">
            <Link href="/dashboard/assistant">Ask assistant</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

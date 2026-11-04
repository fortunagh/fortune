import Link from "next/link";
import { redirect } from "next/navigation";

import { JourneyTimeline } from "@/components/portal/journey-timeline";
import {
  PageHeader,
  ProgressBar,
  WidgetCard,
} from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { getCaseForUser } from "@/lib/onboarding/case";
import { requireRequest } from "@/lib/onboarding/connection";
import { ONBOARDING_STEPS } from "@/lib/onboarding/steps";
import { createClient } from "@/lib/supabase/server";

export default async function JourneyPage() {
  await requireRequest();
  const session = await getSessionProfile();
  if (!session?.user) return null;

  const supabase = await createClient();
  const { caseRow, states } = await getCaseForUser(supabase, session.user.id);
  if (!caseRow) redirect("/dashboard");

  const completed = states.filter((s) => s.status === "completed").length;
  const total = ONBOARDING_STEPS.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          eyebrow="Onboarding"
          title="My Journey"
          description={`${completed} of ${total} steps completed`}
        />
        {caseRow.current_step_key ? (
          <Button asChild variant="fortuna" className="w-full sm:w-auto">
            <Link href={`/dashboard/steps/${caseRow.current_step_key}`}>
              Continue current step →
            </Link>
          </Button>
        ) : null}
      </div>

      <WidgetCard>
        <ProgressBar value={pct} />
        <p className="mt-2 text-sm text-neutral-500">{pct}% complete</p>
      </WidgetCard>

      <WidgetCard>
        <JourneyTimeline
          states={states.map((s) => ({
            key: s.step_key,
            status: s.status,
            completedAt: s.completed_at,
          }))}
          currentKey={caseRow.current_step_key}
        />
      </WidgetCard>
    </div>
  );
}

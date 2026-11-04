import type { SupabaseClient } from "@supabase/supabase-js";

import { ONBOARDING_STEPS } from "./steps";
import type { OnboardingCaseRow, StepStateRow } from "./types";

type AdminClient = SupabaseClient;

/** Create onboarding case + step states for a newly activated user. */
export async function bootstrapOnboardingCase(
  admin: AdminClient,
  userId: string,
): Promise<OnboardingCaseRow> {
  const { data: existing } = await admin
    .from("onboarding_cases")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return existing as OnboardingCaseRow;

  const { data: caseRow, error } = await admin
    .from("onboarding_cases")
    .insert({
      user_id: userId,
      current_step_key: "onboarding_payment",
      status: "active",
    })
    .select("*")
    .single();

  if (error || !caseRow) {
    throw new Error(error?.message ?? "Could not create onboarding case");
  }

  const states = ONBOARDING_STEPS.map((step) => {
    if (step.key === "request_access") {
      return {
        case_id: caseRow.id,
        step_key: step.key,
        status: "completed",
        unlocked_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        confirmation_source: "system",
        payload: {},
      };
    }
    if (step.key === "onboarding_payment") {
      return {
        case_id: caseRow.id,
        step_key: step.key,
        status: "available",
        unlocked_at: new Date().toISOString(),
        confirmation_source: null,
        payload: {},
      };
    }
    return {
      case_id: caseRow.id,
      step_key: step.key,
      status: "locked",
      confirmation_source: null,
      payload: {},
    };
  });

  const { error: statesError } = await admin
    .from("onboarding_step_states")
    .insert(states);

  if (statesError) {
    throw new Error(statesError.message);
  }

  return caseRow as OnboardingCaseRow;
}

export async function getCaseForUser(
  client: AdminClient,
  userId: string,
): Promise<{
  caseRow: OnboardingCaseRow | null;
  states: StepStateRow[];
}> {
  const { data: caseRow } = await client
    .from("onboarding_cases")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!caseRow) return { caseRow: null, states: [] };

  const { data: states } = await client
    .from("onboarding_step_states")
    .select("*")
    .eq("case_id", caseRow.id);

  return {
    caseRow: caseRow as OnboardingCaseRow,
    states: (states ?? []) as StepStateRow[],
  };
}

export function demoDaysElapsed(demoTimerStartedAt: string | null): number {
  if (!demoTimerStartedAt) return 0;
  const start = new Date(demoTimerStartedAt).getTime();
  const ms = Date.now() - start;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function readinessUnlocked(
  demoTimerStartedAt: string | null,
  readinessUnlockedAt: string | null,
): boolean {
  if (readinessUnlockedAt) return true;
  return demoDaysElapsed(demoTimerStartedAt) >= 28;
}

import type { SupabaseClient } from "@supabase/supabase-js";

import { ONBOARDING_STEPS } from "./steps";
import type { OnboardingCaseRow, StepStateRow } from "./types";

type AdminClient = SupabaseClient;

export type BootstrapOptions = {
  /** Default true. When false, payment step is completed as waived. */
  requiresOnboardingFee?: boolean;
};

/** Create onboarding case + step states for a newly activated user. */
export async function bootstrapOnboardingCase(
  admin: AdminClient,
  userId: string,
  options: BootstrapOptions = {},
): Promise<OnboardingCaseRow> {
  const requiresOnboardingFee = options.requiresOnboardingFee !== false;

  const { data: existing } = await admin
    .from("onboarding_cases")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return existing as OnboardingCaseRow;

  const now = new Date().toISOString();
  const currentStepKey = requiresOnboardingFee
    ? "onboarding_payment"
    : "questionnaire";

  let caseRow: OnboardingCaseRow | null = null;
  {
    const withFee = await admin
      .from("onboarding_cases")
      .insert({
        user_id: userId,
        current_step_key: currentStepKey,
        status: "active",
        requires_onboarding_fee: requiresOnboardingFee,
      })
      .select("*")
      .single();

    if (
      withFee.error &&
      /requires_onboarding_fee/i.test(
        `${withFee.error.message} ${withFee.error.details ?? ""}`,
      )
    ) {
      const fallback = await admin
        .from("onboarding_cases")
        .insert({
          user_id: userId,
          current_step_key: currentStepKey,
          status: "active",
        })
        .select("*")
        .single();
      if (fallback.error || !fallback.data) {
        throw new Error(
          fallback.error?.message ?? "Could not create onboarding case",
        );
      }
      caseRow = fallback.data as OnboardingCaseRow;
    } else if (withFee.error || !withFee.data) {
      throw new Error(
        withFee.error?.message ?? "Could not create onboarding case",
      );
    } else {
      caseRow = withFee.data as OnboardingCaseRow;
    }
  }

  if (!caseRow) {
    throw new Error("Could not create onboarding case");
  }

  const states = ONBOARDING_STEPS.map((step) => {
    if (step.key === "request_access") {
      return {
        case_id: caseRow.id,
        step_key: step.key,
        status: "completed",
        unlocked_at: now,
        completed_at: now,
        confirmation_source: "system",
        payload: {},
      };
    }
    if (step.key === "onboarding_payment") {
      if (requiresOnboardingFee) {
        return {
          case_id: caseRow.id,
          step_key: step.key,
          status: "available",
          unlocked_at: now,
          confirmation_source: null,
          payload: {},
        };
      }
      return {
        case_id: caseRow.id,
        step_key: step.key,
        status: "completed",
        unlocked_at: now,
        completed_at: now,
        confirmation_source: "admin",
        payload: {
          fee_waived: true,
          waive_reason: "existing_client_or_admin_waive_on_accept",
        },
      };
    }
    if (step.key === "questionnaire" && !requiresOnboardingFee) {
      return {
        case_id: caseRow.id,
        step_key: step.key,
        status: "available",
        unlocked_at: now,
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

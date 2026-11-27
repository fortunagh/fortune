import type { SupabaseClient } from "@supabase/supabase-js";

import { enqueueStepCommunications } from "@/lib/notifications/enqueue";
import {
  ONBOARDING_STEPS,
  firstActionableStepKey,
  isStepFinished,
} from "./steps";
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
  // Waiving payment must not skip VPS or the questionnaire — broker demo
  // depends on questionnaire answers.
  const currentStepKey = requiresOnboardingFee
    ? "onboarding_payment"
    : "vps_setup";

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
    if (step.key === "vps_setup" && !requiresOnboardingFee) {
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

  // Kick off Email/SMS sequence for the first unlocked actionable step
  // (payment, or VPS when fee is waived).
  try {
    await enqueueStepCommunications(admin, {
      userId,
      stepKey: currentStepKey,
      idempotencyKey: `step_unlocked:${caseRow.id}:${currentStepKey}`,
    });
  } catch (e) {
    console.error("bootstrap step notification", e);
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

export type ResetOnboardingOptions = {
  /** Keep Auth login + profile. Default true. */
  keepAccount?: boolean;
  /** Also delete payments, agreements, notifications, deliveries. Default true. */
  clearRelatedData?: boolean;
  /** Re-require onboarding fee after reset. Default = previous case flag. */
  requiresOnboardingFee?: boolean;
};

/**
 * Soft wipe: clear journey (+ optional related rows) and re-bootstrap.
 * Does not delete the Auth user — use admin wipe for that.
 */
export async function resetOnboardingData(
  admin: AdminClient,
  userId: string,
  options: ResetOnboardingOptions = {},
): Promise<OnboardingCaseRow> {
  const clearRelatedData = options.clearRelatedData !== false;

  const { data: existing } = await admin
    .from("onboarding_cases")
    .select("id, requires_onboarding_fee")
    .eq("user_id", userId)
    .maybeSingle();

  const requiresOnboardingFee =
    options.requiresOnboardingFee ??
    (existing?.requires_onboarding_fee !== false);

  if (existing) {
    await admin.from("onboarding_cases").delete().eq("id", existing.id);
  }

  if (clearRelatedData) {
    await Promise.all([
      admin.from("payments").delete().eq("user_id", userId),
      admin.from("agreements").delete().eq("user_id", userId),
      admin.from("notifications").delete().eq("user_id", userId),
      admin.from("deliveries").delete().eq("user_id", userId),
      admin.from("assistant_threads").delete().eq("user_id", userId),
    ]);
  }

  return bootstrapOnboardingCase(admin, userId, { requiresOnboardingFee });
}

/**
 * If current_step_key jumped past unfinished required steps (e.g. waived
 * payment landed on broker demo), snap back to the first incomplete step.
 */
export async function reconcileOnboardingProgress(
  admin: AdminClient,
  userId: string,
): Promise<{ caseRow: OnboardingCaseRow; states: StepStateRow[] } | null> {
  const loaded = await getCaseForUser(admin, userId);
  if (!loaded.caseRow) return null;
  if (loaded.states.length === 0) {
    return { caseRow: loaded.caseRow, states: loaded.states };
  }

  let { caseRow, states } = loaded;
  const now = new Date().toISOString();

  let waived = caseRow.requires_onboarding_fee === false;
  if (!waived) {
    try {
      const { data: userData } = await admin.auth.admin.getUserById(userId);
      if (userData.user?.user_metadata?.waive_onboarding_fee === true) {
        waived = true;
      }
    } catch {
      /* ignore */
    }
  }
  if (!waived) {
    const { data: sub } = await admin
      .from("request_access_submissions")
      .select("waive_onboarding_fee")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (sub?.waive_onboarding_fee === true) waived = true;
  }

  const requiresFee = !waived;

  const payment = states.find((s) => s.step_key === "onboarding_payment");
  if (
    !requiresFee &&
    payment &&
    !isStepFinished(payment.status)
  ) {
    await admin
      .from("onboarding_step_states")
      .update({
        status: "completed",
        completed_at: payment.completed_at ?? now,
        unlocked_at: payment.unlocked_at ?? now,
        confirmation_source: payment.confirmation_source ?? "admin",
        payload: {
          ...(payment.payload ?? {}),
          fee_waived: true,
          waive_reason: "reconcile_existing_client_waive",
        },
      })
      .eq("id", payment.id);
    payment.status = "completed";
    payment.completed_at = payment.completed_at ?? now;

    if (caseRow.requires_onboarding_fee !== false) {
      const { error: feeErr } = await admin
        .from("onboarding_cases")
        .update({ requires_onboarding_fee: false })
        .eq("id", caseRow.id);
      if (!feeErr) {
        caseRow = { ...caseRow, requires_onboarding_fee: false };
      }
    }
  }

  const actionable = firstActionableStepKey(states);
  if (!actionable) return { caseRow, states };

  const sorted = [...ONBOARDING_STEPS].sort((a, b) => a.sort - b.sort);
  const actionIdx = sorted.findIndex((s) => s.key === actionable);

  const target = states.find((s) => s.step_key === actionable);
  if (
    target &&
    (target.status === "locked" ||
      (target.status !== "available" &&
        target.status !== "in_progress" &&
        target.status !== "awaiting" &&
        !isStepFinished(target.status)))
  ) {
    await admin
      .from("onboarding_step_states")
      .update({
        status: actionable === "demo_readiness" ? "awaiting" : "available",
        unlocked_at: target.unlocked_at ?? now,
        completed_at: null,
      })
      .eq("id", target.id);
    target.status = "available";
  }

  for (let i = actionIdx + 1; i < sorted.length; i++) {
    const later = states.find((s) => s.step_key === sorted[i].key);
    if (!later) continue;
    if (isStepFinished(later.status)) continue;
    if (later.status === "locked") continue;
    await admin
      .from("onboarding_step_states")
      .update({
        status: "locked",
        unlocked_at: null,
        completed_at: null,
      })
      .eq("id", later.id);
    later.status = "locked";
    later.unlocked_at = null;
    later.completed_at = null;
  }

  if (caseRow.current_step_key !== actionable) {
    await admin
      .from("onboarding_cases")
      .update({
        current_step_key: actionable,
        status: "active",
        completed_at: null,
      })
      .eq("id", caseRow.id);
    caseRow = {
      ...caseRow,
      current_step_key: actionable,
      status: "active",
      completed_at: null,
    };
  }

  return { caseRow, states };
}

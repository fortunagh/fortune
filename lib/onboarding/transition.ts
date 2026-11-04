import type { SupabaseClient } from "@supabase/supabase-js";

import { enqueueNextStepNotification } from "@/lib/notifications/enqueue";
import { getStepDef, ONBOARDING_STEPS } from "./steps";
import { readinessUnlocked } from "./case";
import type { OnboardingCaseRow, StepStateRow, TransitionSource } from "./types";

type AdminClient = SupabaseClient;

export type TransitionResult =
  | { ok: true; caseRow: OnboardingCaseRow; states: StepStateRow[] }
  | { ok: false; error: string; status?: number };

async function writeAudit(
  admin: AdminClient,
  actorId: string | null,
  entityId: string,
  action: string,
  fromStatus: string | null,
  toStatus: string | null,
  meta: Record<string, unknown> = {},
) {
  await admin.from("audit_log").insert({
    actor_id: actorId,
    entity_type: "onboarding_step_state",
    entity_id: entityId,
    action,
    from_status: fromStatus,
    to_status: toStatus,
    meta,
  });
}

function nextStepKey(completedKey: string): string | null {
  const idx = ONBOARDING_STEPS.findIndex((s) => s.key === completedKey);
  if (idx < 0 || idx >= ONBOARDING_STEPS.length - 1) return null;
  return ONBOARDING_STEPS[idx + 1].key;
}

/**
 * Sole writer of step completion + unlock. Call with service-role client.
 */
export async function completeStep(options: {
  admin: AdminClient;
  userId: string;
  stepKey: string;
  source: TransitionSource;
  actorId?: string | null;
  payload?: Record<string, unknown>;
  /** Admin override skips prerequisite and timer gates */
  force?: boolean;
}): Promise<TransitionResult> {
  const {
    admin,
    userId,
    stepKey,
    source,
    actorId = userId,
    payload = {},
    force = false,
  } = options;

  const def = getStepDef(stepKey);
  if (!def) return { ok: false, error: "Unknown step", status: 400 };

  if (!force) {
    if (def.confirmationKind === "client" && source !== "client" && source !== "admin") {
      return { ok: false, error: "This step requires client confirmation", status: 400 };
    }
    if (def.confirmationKind === "stripe" && source !== "stripe" && source !== "admin") {
      return { ok: false, error: "This step advances on Stripe payment", status: 400 };
    }
    if (
      def.confirmationKind === "dropbox_sign" &&
      source !== "dropbox_sign" &&
      source !== "admin"
    ) {
      return {
        ok: false,
        error: "This step advances when the agreement is signed",
        status: 400,
      };
    }
  }

  const { data: caseRow, error: caseErr } = await admin
    .from("onboarding_cases")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (caseErr || !caseRow) {
    return { ok: false, error: "Onboarding case not found", status: 404 };
  }

  const typedCase = caseRow as OnboardingCaseRow;

  const { data: statesData } = await admin
    .from("onboarding_step_states")
    .select("*")
    .eq("case_id", typedCase.id);

  const states = (statesData ?? []) as StepStateRow[];
  const current = states.find((s) => s.step_key === stepKey);
  if (!current) return { ok: false, error: "Step state missing", status: 404 };

  if (current.status === "completed") {
    return { ok: true, caseRow: typedCase, states };
  }

  if (!force) {
    if (current.status === "locked") {
      return { ok: false, error: "Step is locked", status: 403 };
    }

    for (const pre of def.prerequisites) {
      const preState = states.find((s) => s.step_key === pre);
      if (!preState || preState.status !== "completed") {
        return { ok: false, error: `Prerequisite not complete: ${pre}`, status: 403 };
      }
    }

    if (stepKey === "demo_readiness") {
      const unlocked = readinessUnlocked(
        typedCase.demo_timer_started_at,
        typedCase.readiness_unlocked_at,
      );
      if (!unlocked) {
        return {
          ok: false,
          error: "Demo readiness unlocks after 28 days of practice",
          status: 403,
        };
      }
    }

    if (stepKey === "live_install") {
      const liveApproved = Boolean(
        (current.payload as { live_licence_approved?: boolean })?.live_licence_approved ||
          (payload as { live_licence_approved?: boolean })?.live_licence_approved,
      );
      const eaInstalled = Boolean(
        (current.payload as { ea_installed?: boolean })?.ea_installed ||
          (payload as { ea_installed?: boolean })?.ea_installed,
      );
      const equityProtect = Boolean(
        (current.payload as { equity_protect?: boolean })?.equity_protect ||
          (payload as { equity_protect?: boolean })?.equity_protect,
      );

      const merged = {
        ...(current.payload ?? {}),
        ...payload,
        live_licence_approved: liveApproved,
        ea_installed: eaInstalled,
        equity_protect: equityProtect,
      };

      if (!liveApproved || !eaInstalled || !equityProtect) {
        await admin
          .from("onboarding_step_states")
          .update({
            status: "in_progress",
            payload: merged,
          })
          .eq("id", current.id);

        const { data: refreshed } = await admin
          .from("onboarding_step_states")
          .select("*")
          .eq("case_id", typedCase.id);

        return {
          ok: true,
          caseRow: typedCase,
          states: (refreshed ?? []) as StepStateRow[],
        };
      }
    }
  }

  const now = new Date().toISOString();
  const mergedPayload = { ...(current.payload ?? {}), ...payload };

  await admin
    .from("onboarding_step_states")
    .update({
      status: "completed",
      completed_at: now,
      confirmation_source: source,
      payload: mergedPayload,
    })
    .eq("id", current.id);

  await writeAudit(
    admin,
    actorId ?? null,
    current.id,
    "complete_step",
    current.status,
    "completed",
    { stepKey, source },
  );

  const caseUpdates: Record<string, unknown> = {};

  if (stepKey === "demo_install") {
    caseUpdates.demo_timer_started_at = now;
  }
  if (stepKey === "demo_readiness") {
    caseUpdates.readiness_unlocked_at = now;
  }
  if (stepKey === "live_activation") {
    caseUpdates.live_activated_at = now;
  }
  if (stepKey === "onboarding_complete" || stepKey === "live_activation") {
    if (stepKey === "live_activation") {
      // Completing live activation also completes onboarding_complete system step
    }
  }

  const upcoming = nextStepKey(stepKey);
  if (upcoming) {
    caseUpdates.current_step_key = upcoming;
    await admin
      .from("onboarding_step_states")
      .update({
        status: upcoming === "demo_readiness" &&
          !readinessUnlocked(
            (caseUpdates.demo_timer_started_at as string) ??
              typedCase.demo_timer_started_at,
            typedCase.readiness_unlocked_at,
          )
          ? "awaiting"
          : "available",
        unlocked_at: now,
      })
      .eq("case_id", typedCase.id)
      .eq("step_key", upcoming);
  } else {
    caseUpdates.status = "completed";
    caseUpdates.completed_at = now;
  }

  // After live activation, auto-complete onboarding_complete
  if (stepKey === "live_activation") {
    const completeState = states.find((s) => s.step_key === "onboarding_complete");
    if (completeState) {
      await admin
        .from("onboarding_step_states")
        .update({
          status: "completed",
          completed_at: now,
          confirmation_source: "system",
          unlocked_at: now,
        })
        .eq("id", completeState.id);
    }
    await admin
      .from("onboarding_step_states")
      .update({
        status: "available",
        unlocked_at: now,
      })
      .eq("case_id", typedCase.id)
      .eq("step_key", "usage_billing");
    caseUpdates.current_step_key = "usage_billing";
    caseUpdates.completed_at = now;
    caseUpdates.status = "completed";
  }

  if (Object.keys(caseUpdates).length) {
    await admin.from("onboarding_cases").update(caseUpdates).eq("id", typedCase.id);
  }

  const { data: freshCase } = await admin
    .from("onboarding_cases")
    .select("*")
    .eq("id", typedCase.id)
    .single();

  const { data: freshStates } = await admin
    .from("onboarding_step_states")
    .select("*")
    .eq("case_id", typedCase.id);

  const nextKey =
    (freshCase as OnboardingCaseRow | null)?.current_step_key ?? upcoming;

  if (nextKey && nextKey !== stepKey) {
    try {
      await enqueueNextStepNotification(admin, {
        userId,
        stepKey: nextKey,
        idempotencyKey: `next_step:${typedCase.id}:${nextKey}`,
      });
    } catch (e) {
      console.error("enqueueNextStepNotification", e);
    }
  }

  if (stepKey === "live_activation") {
    try {
      await enqueueNextStepNotification(admin, {
        userId,
        stepKey: "onboarding_complete",
        idempotencyKey: `complete:${typedCase.id}`,
        templateKey: "onboarding_complete",
      });
    } catch (e) {
      console.error("completion email", e);
    }
  }

  return {
    ok: true,
    caseRow: freshCase as OnboardingCaseRow,
    states: (freshStates ?? []) as StepStateRow[],
  };
}

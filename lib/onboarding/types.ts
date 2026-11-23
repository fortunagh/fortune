import type { ConfirmationKind } from "./steps";
import type { StepStateStatus } from "@/components/portal/progress-rail";

export type OnboardingCaseRow = {
  id: string;
  user_id: string;
  current_step_key: string | null;
  status: "active" | "blocked" | "completed" | "cancelled";
  demo_timer_started_at: string | null;
  readiness_unlocked_at: string | null;
  live_activated_at: string | null;
  completed_at: string | null;
  /** false = existing client; onboarding fee waived at bootstrap */
  requires_onboarding_fee?: boolean;
};

export type StepStateRow = {
  id: string;
  case_id: string;
  step_key: string;
  status: StepStateStatus;
  unlocked_at: string | null;
  completed_at: string | null;
  confirmation_source: ConfirmationKind | "admin" | "system" | null;
  payload: Record<string, unknown>;
};

export type TransitionSource =
  | "client"
  | "stripe"
  | "dropbox_sign"
  | "admin"
  | "system";

"use client";

import Link from "next/link";
import { Check, Lock } from "lucide-react";

import {
  ONBOARDING_STEPS,
  STEP_PHASES,
  type StepPhase,
} from "@/lib/onboarding/steps";
import { fortunaUiClass } from "@/lib/fonts/fortuna";
import { cn } from "@/lib/utils";

export type StepStateStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "awaiting"
  | "completed"
  | "skipped";

export type ProgressRailState = {
  key: string;
  status: StepStateStatus;
  completedAt?: string | null;
};

export function ProgressRail({
  states,
  currentKey,
}: {
  states: ProgressRailState[];
  currentKey: string | null;
}) {
  const byKey = new Map(states.map((s) => [s.key, s]));

  const phases = STEP_PHASES.map((phase) => ({
    ...phase,
    steps: ONBOARDING_STEPS.filter((s) => s.phase === phase.id),
  }));

  return (
    <nav aria-label="Onboarding progress" className="space-y-6">
      {phases.map((phase) => (
        <div key={phase.id}>
          <p
            className={cn(
              fortunaUiClass,
              "mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground",
            )}
          >
            {phase.label}
          </p>
          <ul className="space-y-1 border-l border-border pl-3">
            {phase.steps.map((step) => {
              const st = byKey.get(step.key);
              const status = st?.status ?? "locked";
              const isCurrent = currentKey === step.key;
              const done = status === "completed";
              const locked = status === "locked";

              return (
                <li key={step.key}>
                  <Link
                    href={
                      locked
                        ? "#"
                        : `/dashboard/steps/${step.key}`
                    }
                    aria-current={isCurrent ? "step" : undefined}
                    aria-disabled={locked}
                    onClick={(e) => {
                      if (locked) e.preventDefault();
                    }}
                    className={cn(
                      fortunaUiClass,
                      "flex items-start gap-2 py-1.5 text-xs transition-colors",
                      isCurrent && "text-primary",
                      done && "text-muted-foreground",
                      locked && "cursor-not-allowed text-muted-foreground/50",
                      !locked && !isCurrent && "text-foreground hover:text-primary",
                    )}
                  >
                    <span className="mt-0.5 shrink-0">
                      {done ? (
                        <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
                      ) : locked ? (
                        <Lock className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <span
                          className={cn(
                            "mt-0.5 block h-2 w-2 rounded-full border border-current",
                            isCurrent && "bg-primary border-primary",
                          )}
                        />
                      )}
                    </span>
                    <span className="leading-snug">
                      <span className="block font-medium tracking-wide">
                        {step.title}
                      </span>
                      {done && st?.completedAt ? (
                        <span className="mt-0.5 block text-[10px] uppercase tracking-[0.12em] opacity-70">
                          {formatShortDate(st.completedAt)}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function formatShortDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function phaseForStep(key: string): StepPhase | undefined {
  return ONBOARDING_STEPS.find((s) => s.key === key)?.phase;
}

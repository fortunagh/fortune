import Link from "next/link";
import { Check } from "lucide-react";

import { ONBOARDING_STEPS } from "@/lib/onboarding/steps";
import type { ProgressRailState } from "@/components/portal/progress-rail";
import { fortunaUiClass } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";

export function JourneyTimeline({
  states,
  currentKey,
  limit,
}: {
  states: ProgressRailState[];
  currentKey: string | null;
  limit?: number;
}) {
  const byKey = new Map(states.map((s) => [s.key, s]));
  const steps = limit
    ? ONBOARDING_STEPS.slice(0, limit)
    : ONBOARDING_STEPS;

  return (
    <ol className="relative space-y-0">
      {steps.map((step, index) => {
        const st = byKey.get(step.key);
        const status = st?.status ?? "locked";
        const done = status === "completed";
        const current = currentKey === step.key;
        const locked = status === "locked";

        return (
          <li key={step.key} className="relative flex gap-3 pb-5 last:pb-0">
            {index < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[11px] top-6 h-[calc(100%-0.5rem)] w-0.5",
                  done ? "bg-emerald-400" : "bg-neutral-200",
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative z-[1] mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                done && "border-emerald-500 bg-emerald-500 text-white",
                current &&
                  !done &&
                  "border-[#c59d3f] bg-white ring-4 ring-[hsl(var(--portal-gold-soft))]",
                locked && "border-neutral-200 bg-white",
                !done && !current && !locked && "border-[#c59d3f] bg-white",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              {locked ? (
                <span
                  className={cn(
                    fortunaUiClass,
                    "block cursor-not-allowed text-sm font-semibold text-neutral-400",
                  )}
                >
                  {step.title}
                </span>
              ) : (
                <Link
                  href={`/dashboard/steps/${step.key}`}
                  className={cn(
                    fortunaUiClass,
                    "block text-sm font-semibold text-neutral-900 hover:text-[#a8842a]",
                  )}
                >
                  {step.title}
                </Link>
              )}
              <p className="mt-0.5 text-xs text-neutral-500">
                {done
                  ? st?.completedAt
                    ? formatDate(st.completedAt)
                    : "Completed"
                  : current
                    ? "In progress"
                    : locked
                      ? "Upcoming"
                      : "Available"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

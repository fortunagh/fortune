"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { WidgetCard, fortunaUiClass } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";

const GOLD = "#a8842a";
const GOLD_SOFT = "#e8d9a8";
const NEUTRAL = "#a3a3a3";

export function AdminOverviewCharts({
  funnel,
  byStep,
}: {
  funnel: { name: string; value: number }[];
  byStep: { name: string; value: number; fullLabel: string }[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <WidgetCard>
        <p
          className={cn(
            fortunaUiClass,
            "mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500",
          )}
        >
          Client funnel
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#737373", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#737373", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                cursor={{ fill: "rgba(168,132,42,0.08)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.06)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={48}>
                {funnel.map((_, i) => (
                  <Cell
                    key={`funnel-${i}`}
                    fill={i === funnel.length - 1 ? GOLD : i === 0 ? NEUTRAL : GOLD_SOFT}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </WidgetCard>

      <WidgetCard>
        <p
          className={cn(
            fortunaUiClass,
            "mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500",
          )}
        >
          Active clients by step
        </p>
        <div className="h-64 w-full">
          {byStep.every((s) => s.value === 0) ? (
            <p className="flex h-full items-center justify-center text-sm text-neutral-500">
              No active onboarding cases yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byStep}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={96}
                  tick={{ fill: "#525252", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [value as number, "Clients"]}
                  labelFormatter={(_, payload) =>
                    (payload?.[0]?.payload as { fullLabel?: string })?.fullLabel ??
                    ""
                  }
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.06)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill={GOLD} radius={[0, 8, 8, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </WidgetCard>
    </div>
  );
}

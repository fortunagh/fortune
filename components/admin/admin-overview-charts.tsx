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

const GOLD = "#a8842a";
const GOLD_SOFT = "#e8d9a8";
const NEUTRAL = "#a3a3a3";

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-4">
      <p className="mb-3 text-xs font-medium text-neutral-500">{title}</p>
      {children}
    </div>
  );
}

export function AdminOverviewCharts({
  funnel,
  byStep,
}: {
  funnel: { name: string; value: number }[];
  byStep: { name: string; value: number; fullLabel: string }[];
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <ChartCard title="Client funnel">
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={funnel}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e5e5"
                vertical={false}
              />
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
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.06)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {funnel.map((_, i) => (
                  <Cell
                    key={`funnel-${i}`}
                    fill={
                      i === funnel.length - 1
                        ? GOLD
                        : i === 0
                          ? NEUTRAL
                          : GOLD_SOFT
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Active clients by step">
        <div className="h-52 w-full">
          {byStep.every((s) => s.value === 0) ? (
            <p className="flex h-full items-center justify-center text-sm text-neutral-500">
              No active onboarding cases yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byStep}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e5e5"
                  horizontal={false}
                />
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
                    (payload?.[0]?.payload as { fullLabel?: string })
                      ?.fullLabel ?? ""
                  }
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid rgba(0,0,0,0.06)",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="value"
                  fill={GOLD}
                  radius={[0, 6, 6, 0]}
                  maxBarSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartCard>
    </div>
  );
}

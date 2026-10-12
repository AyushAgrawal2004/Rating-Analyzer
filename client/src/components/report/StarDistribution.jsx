import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ClayCard } from "../../ui/index.js";

const STAR_GRADIENTS = {
  5: { from: "#34D399", to: "#10B981" },
  4: { from: "#6EE7B7", to: "#059669" },
  3: { from: "#FBBF24", to: "#D97706" },
  2: { from: "#FB923C", to: "#EA580C" },
  1: { from: "#F87171", to: "#DC2626" },
};

function CustomClayTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="clay-sm px-3.5 py-2 rounded-clay-sm bg-white/95 dark:bg-surface-darkCard/95 border border-ink-100 dark:border-ink-700/60 shadow-xl">
        <p className="text-xs font-heading font-black text-ink-900 dark:text-white">
          {data.star} Star Reviews
        </p>
        <p className="text-xs text-brand-600 dark:text-brand-400 font-mono font-bold mt-0.5">
          {data.count.toLocaleString()} reviews ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
}

export function StarDistribution({ distribution = [] }) {
  const chartData = distribution.map((d) => ({
    name: `${d.star}★`,
    star: d.star,
    count: d.count,
    percentage: d.percentage,
  }));

  return (
    <ClayCard className="p-6 sm:p-7 flex flex-col justify-between">
      <div className="mb-5">
        <h3 className="text-base sm:text-lg font-heading font-black text-ink-900 dark:text-white">
          Star Rating Distribution
        </h3>
        <p className="text-xs text-ink-500 font-medium">Breakdown of collected review cohort</p>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 12, right: 10, left: -22, bottom: 0 }}>
            <defs>
              {Object.entries(STAR_GRADIENTS).map(([star, g]) => (
                <linearGradient key={`grad-${star}`} id={`clay-star-${star}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={g.from} />
                  <stop offset="100%" stopColor={g.to} />
                </linearGradient>
              ))}
            </defs>
            <XAxis
              dataKey="name"
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              fontFamily="Nunito, sans-serif"
              fontWeight={800}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              fontFamily="Plus Jakarta Sans, sans-serif"
            />
            <Tooltip content={<CustomClayTooltip />} cursor={{ fill: "rgba(22, 34, 74, 0.04)" }} />
            <Bar
              dataKey="count"
              radius={[10, 10, 3, 3]}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.star}`} fill={`url(#clay-star-${entry.star})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-5 gap-2 mt-5 pt-4 border-t border-ink-100 dark:border-ink-800/80 text-center">
        {distribution.map((d) => (
          <div key={d.star} className="clay-sm py-2 px-1 rounded-clay-sm bg-surface-cardSubtle/60 dark:bg-surface-darkCardSubtle">
            <span className="text-xs font-heading font-black text-ink-800 dark:text-ink-200 block">
              {d.star}★
            </span>
            <p className="text-xs font-mono font-bold text-ink-500 dark:text-ink-400 mt-0.5">
              {d.percentage}%
            </p>
          </div>
        ))}
      </div>
    </ClayCard>
  );
}

export default StarDistribution;

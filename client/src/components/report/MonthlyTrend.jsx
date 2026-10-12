import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { AlertCircle } from "lucide-react";
import { ClayCard } from "../../ui/index.js";

function CustomTrendTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="clay-sm px-4 py-3 rounded-clay-sm bg-white/95 dark:bg-surface-darkCard/95 border border-ink-100 dark:border-ink-700/60 shadow-xl space-y-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-heading font-black text-ink-900 dark:text-white">
            Period: {label}
          </span>
          <span className="text-[11px] font-mono text-ink-400">
            {item.reviewCount} reviews
          </span>
        </div>
        <div className="text-xs font-mono font-bold space-y-0.5 pt-1">
          <p className="text-brand-600 dark:text-brand-400">
            Avg Score: {item.avgScore}★
          </p>
          <p className="text-status-danger">
            Low (1-2★): {item.pctLow}%
          </p>
        </div>
        {item.isLowConfidence && (
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold pt-1">
            ⚠️ Low Sample (&lt;30 reviews)
          </p>
        )}
      </div>
    );
  }
  return null;
}

export function MonthlyTrend({ trend = [] }) {
  if (!trend || trend.length === 0) {
    return (
      <ClayCard className="p-8 text-center text-ink-500 font-medium">
        No monthly trend data available.
      </ClayCard>
    );
  }

  const chartData = trend.map((t) => ({
    period: t.period,
    avgScore: t.avgScore,
    pctLow: t.pctLow,
    reviewCount: t.reviewCount,
    isLowConfidence: t.isLowConfidence,
  }));

  const hasLowConfidenceMonths = trend.some((t) => t.isLowConfidence);

  return (
    <ClayCard className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-heading font-black text-ink-900 dark:text-white">
            Monthly Rating &amp; Dissatisfaction Trend
          </h3>
          <p className="text-xs text-ink-500 font-medium mt-0.5">
            Historical performance trajectory over time
          </p>
        </div>

        {hasLowConfidenceMonths && (
          <div className="clay-sm inline-flex items-center text-xs font-heading font-bold text-amber-800 dark:text-amber-200 bg-clay-butter-light dark:bg-clay-butter-dark px-3 py-1.5 rounded-pill self-start sm:self-auto">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-amber-600 shrink-0" />
            <span>* Flagged periods with &lt;30 reviews have lower statistical confidence</span>
          </div>
        )}
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 15, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" opacity={0.6} />
            <XAxis
              dataKey="period"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              fontFamily="Nunito, sans-serif"
              fontWeight={700}
            />
            <YAxis
              yAxisId="left"
              domain={[1, 5]}
              stroke="#1F4FD8"
              fontSize={11}
              tickLine={false}
              unit="★"
              fontFamily="Plus Jakarta Sans, sans-serif"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              stroke="#DC2626"
              fontSize={11}
              tickLine={false}
              unit="%"
              fontFamily="Plus Jakarta Sans, sans-serif"
            />
            <Tooltip content={<CustomTrendTooltip />} />
            <Legend
              wrapperStyle={{
                fontSize: "12px",
                fontFamily: "Nunito, sans-serif",
                fontWeight: 700,
                paddingTop: "12px",
              }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="avgScore"
              name="Avg Rating"
              stroke="#1F4FD8"
              strokeWidth={3}
              dot={{ r: 4.5, fill: "#1F4FD8", stroke: "#FFFFFF", strokeWidth: 2 }}
              activeDot={{ r: 7 }}
              animationDuration={1000}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="pctLow"
              name="% 1-2★ Low"
              stroke="#DC2626"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={{ r: 4.5, fill: "#DC2626", stroke: "#FFFFFF", strokeWidth: 2 }}
              activeDot={{ r: 7 }}
              animationDuration={1100}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ClayCard>
  );
}

export default MonthlyTrend;

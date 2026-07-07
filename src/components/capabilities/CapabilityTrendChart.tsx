import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { ChartContainer } from "@/components/dashboard/charts/ChartContainer";
import type {
  CapabilityMetric,
  TrendIndicator,
} from "../../types/capabilities";
import { TASK_TYPE_LABELS } from "../../types/capabilities";

interface CapabilityTrendChartProps {
  capabilities: CapabilityMetric[];
}

const getBarColor = (successRate: number): string => {
  if (successRate >= 70) return "url(#gradientGreen)";
  if (successRate >= 50) return "url(#gradientYellow)";
  return "url(#gradientRed)";
};

const getBarSolidColor = (successRate: number): string => {
  if (successRate >= 70) return "#10b981";
  if (successRate >= 50) return "#f59e0b";
  return "#ef4444";
};

const TrendIcon = ({ trend }: { trend: TrendIndicator }) => {
  const iconClass = "w-4 h-4";
  if (trend === "UP")
    return <TrendingUp className={iconClass + " text-emerald-400"} />;
  if (trend === "DOWN")
    return <TrendingDown className={iconClass + " text-rose-400"} />;
  return <Minus className={iconClass + " text-muted-foreground"} />;
};

export const CapabilityTrendChart: React.FC<CapabilityTrendChartProps> = ({
  capabilities,
}) => {
  const chartData = capabilities.map((cap) => ({
    name: TASK_TYPE_LABELS[cap.taskType],
    shortName: TASK_TYPE_LABELS[cap.taskType].split(" ")[0],
    successRate: cap.successRate,
    trend: cap.trend,
    taskType: cap.taskType,
  }));

  return (
    <div className="card-theme rounded-lg p-6 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20">
          <BarChart3 className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
            Success Rate by Task Type
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            AI performance across different task categories
          </p>
        </div>
      </div>

      {/* Chart */}
      <ChartContainer className="h-[320px]">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="gradientGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="gradientYellow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="gradientRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--chart-grid)"
            vertical={false}
          />
          <XAxis
            dataKey="shortName"
            tick={{ fill: "var(--chart-text)", fontSize: 12 }}
            axisLine={{ stroke: "var(--chart-axis)" }}
            tickLine={{ stroke: "var(--chart-axis)" }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "var(--chart-text)", fontSize: 12 }}
            axisLine={{ stroke: "var(--chart-axis)" }}
            tickLine={{ stroke: "var(--chart-axis)" }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            cursor={{ fill: "var(--chart-grid)" }}
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              padding: "12px",
              boxShadow: "var(--shadow-lg)",
            }}
            labelStyle={{
              color: "var(--color-text-primary)",
              fontWeight: 600,
              marginBottom: "8px",
            }}
            itemStyle={{ color: "var(--color-text-secondary)" }}
            formatter={(value, _name, props) => {
              const numValue = (value as number) ?? 0;
              const payload = props?.payload as
                { name: string; trend: TrendIndicator } | undefined;
              return [
                <div key="tooltip" className="flex items-center gap-2">
                  <span
                    className="text-lg font-bold"
                    style={{ color: getBarSolidColor(numValue) }}
                  >
                    {numValue.toFixed(1)}%
                  </span>
                  {payload && <TrendIcon trend={payload.trend} />}
                </div>,
                "Success Rate",
              ];
            }}
          />
          <Bar
            dataKey="successRate"
            radius={[8, 8, 4, 4]}
            animationDuration={1000}
            animationBegin={200}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.successRate)}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-br from-emerald-400 to-emerald-500"></div>
            <span className="text-[var(--color-text-secondary)]">
              <span className="font-medium text-emerald-400">≥70%</span>{" "}
              Reliable
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-br from-amber-400 to-amber-500"></div>
            <span className="text-[var(--color-text-secondary)]">
              <span className="font-medium text-amber-400">50-70%</span>{" "}
              Moderate
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-br from-rose-400 to-rose-500"></div>
            <span className="text-[var(--color-text-secondary)]">
              <span className="font-medium text-rose-400">&lt;50%</span> Needs
              Attention
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

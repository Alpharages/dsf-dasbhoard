import { useId } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FinancialSummary } from '@/types';
import apiClient from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';

const SVG_HEIGHT = 40;
const SVG_WIDTH = 100;
const CHART_HEIGHT = 35;

const toSparklinePoints = (values: number[], maxValue: number) =>
  values
    .map((value, index) => {
      const x = (index / (Math.max(values.length - 1, 1))) * SVG_WIDTH;
      const y = SVG_HEIGHT - (value / maxValue) * CHART_HEIGHT;
      return `${x},${y}`;
    })
    .join(' ');

const toYAxisValue = (value: number, maxValue: number) =>
  SVG_HEIGHT - (value / maxValue) * CHART_HEIGHT;

export function FinancialKPISection() {
  const { user } = useAuth();
  const uid = useId();
  const gradientId = `financial-burn-gradient-${uid}`;
  const canViewFinancialKpi = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  const { data, isLoading, isError } = useQuery<FinancialSummary>({
    queryKey: ['pm-dashboard-financial-summary', user?.id],
    queryFn: () =>
      apiClient.get('/pm-dashboard/financial-summary').then((res) => res.data as FinancialSummary),
    staleTime: 60_000,
    enabled: canViewFinancialKpi && !!user?.id,
  });

  if (!canViewFinancialKpi) {
    return null;
  }

  if (isLoading || (!data && !isError)) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="h-40 rounded-2xl border border-[var(--card-border)] bg-[var(--surface-1)] animate-pulse" />
        <div className="h-40 rounded-2xl border border-[var(--card-border)] bg-[var(--surface-1)] animate-pulse" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="col-span-2 rounded-2xl border border-[var(--card-border)] bg-[var(--surface-1)] p-4">
          <p className="text-sm text-muted-foreground">Financial data unavailable. Please try refreshing.</p>
        </div>
      </div>
    );
  }

  const hasBurnData = data.daily_budget_burn.some((value) => value > 0);
  const hasCostPerTicket = typeof data.cost_per_ticket === 'number' && data.cost_per_ticket >= 0;
  const maxChartValue = Math.max(
    ...data.daily_budget_burn,
    data.budget_ceiling,
    data.budget_forecast,
    1,
  );

  const burnPoints = toSparklinePoints(data.daily_budget_burn, maxChartValue);
  const budgetCeilingY = toYAxisValue(data.budget_ceiling, maxChartValue);
  const forecastStart = data.daily_budget_burn[data.daily_budget_burn.length - 1] ?? 0;
  const forecastStartY = toYAxisValue(forecastStart, maxChartValue);
  const forecastEndY = toYAxisValue(data.budget_forecast, maxChartValue);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
      {/* Cost per Ticket Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="h-[180px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">Cost per Ticket</CardTitle>
                {hasCostPerTicket && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Current month spend / completed tickets
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {hasCostPerTicket ? (
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">
                  ${data.cost_per_ticket?.toFixed(2)}
                </span>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-xs font-medium text-emerald-400">On track</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 py-4">
                <Wallet className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No cost data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Budget Burn Rate Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="h-[180px] relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Budget Burn Rate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {hasBurnData ? (
              <>
                <div className="h-[60px] w-full">
                  <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="none" className="h-full w-full">
                    <defs>
                      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Fill area */}
                    <polyline
                      points={`${burnPoints} ${SVG_WIDTH},${SVG_HEIGHT} 0,${SVG_HEIGHT}`}
                      fill={`url(#${gradientId})`}
                      stroke="none"
                    />

                    {/* Burn line */}
                    <polyline
                      points={burnPoints}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    {/* Budget ceiling line */}
                    <line
                      x1="0"
                      y1={budgetCeilingY}
                      x2={SVG_WIDTH}
                      y2={budgetCeilingY}
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />

                    {/* Forecast line */}
                    <line
                      x1="0"
                      y1={forecastStartY}
                      x2={SVG_WIDTH}
                      y2={forecastEndY}
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  </svg>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-muted-foreground">14d spend</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-muted-foreground">Ceiling: ${data.budget_ceiling.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-muted-foreground">Forecast: ${data.budget_forecast.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 py-4">
                <TrendingUp className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No burn data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

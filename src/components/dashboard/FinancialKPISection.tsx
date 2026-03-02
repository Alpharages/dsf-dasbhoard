import { useId } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp } from 'lucide-react';
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="h-40 rounded-2xl border border-border bg-card animate-pulse" />
        <div className="h-40 rounded-2xl border border-border bg-card animate-pulse" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="col-span-2 rounded-2xl border border-border bg-card p-4">
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        whileHover={{ y: -2 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost per Ticket</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {hasCostPerTicket ? (
              <>
                <div className="text-2xl font-bold">${data.cost_per_ticket?.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Current month spend / completed tickets
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ y: -2 }}
      >
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Burn Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {hasBurnData ? (
              <>
                <div className="h-[64px] w-full">
                  <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="none" className="h-full w-full">
                    <defs>
                      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    <polyline
                      points={`${burnPoints} ${SVG_WIDTH},${SVG_HEIGHT} 0,${SVG_HEIGHT}`}
                      fill={`url(#${gradientId})`}
                      stroke="none"
                      className="text-blue-400"
                    />

                    <polyline
                      points={burnPoints}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-blue-400"
                    />

                    <line
                      x1="0"
                      y1={budgetCeilingY}
                      x2={SVG_WIDTH}
                      y2={budgetCeilingY}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-emerald-500"
                    />

                    <line
                      x1="0"
                      y1={forecastStartY}
                      x2={SVG_WIDTH}
                      y2={forecastEndY}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                      className="text-amber-500"
                    />
                  </svg>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>14d spend</span>
                  <span>Ceiling: ${data.budget_ceiling.toFixed(2)}</span>
                  <span>Forecast: ${data.budget_forecast.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

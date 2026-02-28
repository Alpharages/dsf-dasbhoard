/**
 * Error Trend Chart
 * Story 9-U-5: Production Error Dashboard - AC#5
 *
 * 7-day rolling error trend chart with severity stacking.
 * 
 * Optimizations:
 * - Direct imports from recharts (avoiding barrel file)
 * - useMemo for data transformation (prevent unnecessary re-computation)
 * - React.memo to prevent re-renders when props don't change
 */

import { memo, useMemo } from 'react';
import { useProductionErrorTrends } from '@/hooks/useProductionErrors';
import { Skeleton } from '@/components/ui/skeleton';
// Note: Using barrel import from recharts - Vite handles tree-shaking via ESM
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface ChartDataPoint {
  date: string;
  displayDate: string;
  CRITICAL: number;
  HIGH: number;
  MEDIUM: number;
  LOW: number;
}

function ErrorTrendChartComponent() {
  const { data: trends, isLoading } = useProductionErrorTrends(7);

  // Memoize data transformation to prevent re-computation on re-renders
  // Follows rerender-memo best practice
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!trends) return [];
    return trends.dates.map((date, index) => ({
      date,
      displayDate: format(parseISO(date), 'EEE MM/dd'),
      CRITICAL: trends.trendsBySeverity.CRITICAL[index] || 0,
      HIGH: trends.trendsBySeverity.HIGH[index] || 0,
      MEDIUM: trends.trendsBySeverity.MEDIUM[index] || 0,
      LOW: trends.trendsBySeverity.LOW[index] || 0,
    }));
  }, [trends]);

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 min-w-0">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">
        Error Trends (7 Days)
      </h3>
      
      <div className="h-[300px] min-w-0">
        <ResponsiveContainer width="100%" height="100%" debounce={100}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis 
              dataKey="displayDate" 
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis 
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                color: '#e2e8f0',
              }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Line
              type="monotone"
              dataKey="CRITICAL"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 0, r: 4 }}
              name="Critical"
            />
            <Line
              type="monotone"
              dataKey="HIGH"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ fill: '#f97316', strokeWidth: 0, r: 4 }}
              name="High"
            />
            <Line
              type="monotone"
              dataKey="MEDIUM"
              stroke="#eab308"
              strokeWidth={2}
              dot={{ fill: '#eab308', strokeWidth: 0, r: 4 }}
              name="Medium"
            />
            <Line
              type="monotone"
              dataKey="LOW"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
              name="Low"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-slate-400">Critical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-sm text-slate-400">High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-sm text-slate-400">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm text-slate-400">Low</span>
        </div>
      </div>
    </div>
  );
}

// Memoize to prevent re-renders when parent updates but props don't change
// Follows rerender-memo best practice
export const ErrorTrendChart = memo(ErrorTrendChartComponent);

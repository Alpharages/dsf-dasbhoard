import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardSummary } from '@/types';
import { Activity, Clock, Zap } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip as RechartsTooltip,
} from 'recharts';

interface ExecutionKPISectionProps {
  summary: DashboardSummary | null;
}

export function ExecutionKPISection({ summary }: ExecutionKPISectionProps) {
  const { socket, connected } = useSocket('/dashboard');

  const [activeExecutions, setActiveExecutions] = useState(0);
  const [queuedExecutions, setQueuedExecutions] = useState(0);

  useEffect(() => {
    if (summary) {
      setActiveExecutions(summary.active_ai_executions || 0);
      setQueuedExecutions(summary.queued_ai_executions || 0);
    }
  }, [summary]);

  useEffect(() => {
    if (!socket || !connected) return;

    const handleExecutionStarted = (data: { executionId: string; status: string }) => {
      if (data.status === 'IN_PROGRESS') {
        setActiveExecutions((prev) => prev + 1);
        setQueuedExecutions((prev) => Math.max(0, prev - 1));
      }
    };

    const handleExecutionFinished = () => {
      // Could be COMPLETED, FAILED, TIMEOUT, etc
      setActiveExecutions((prev) => Math.max(0, prev - 1));
    };

    socket.on('execution:started', handleExecutionStarted);
    socket.on('execution:finished', handleExecutionFinished);

    return () => {
      socket.off('execution:started', handleExecutionStarted);
      socket.off('execution:finished', handleExecutionFinished);
    };
  }, [socket, connected]);

  if (!summary) return null;

  const successRate = summary.success_rate || 0;
  const successPercentage = Math.round(successRate * 100);
  const avgCompletionTime = summary.avg_completion_time_hours || 0;

  // Formatting for the success rate gauge color
  let successColorClass = 'text-emerald-500';
  if (successPercentage < 70) successColorClass = 'text-rose-500';
  else if (successPercentage < 90) successColorClass = 'text-amber-500';

  // Real 7-day daily trend from backend (index 0 = oldest day, index 6 = today)
  const rawDailyData = summary.daily_avg_completion_hours ?? Array(7).fill(0);
  const sparklineData = rawDailyData.map((value, i) => ({
    name: `Day ${i + 1}`,
    value,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* STAT-1: Success Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <Zap className={`h-4 w-4 ${successColorClass}`} />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center pt-4">
            {/* Simple CSS radial progress or just a big number for now. The requirement is a color-coded gauge. Let's use an SVG circle for a simple gauge. */}
            <div className="relative h-24 w-24">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path
                  className="text-muted/20"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={successColorClass}
                  strokeWidth="3"
                  strokeDasharray={`${successPercentage}, 100`}
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${successColorClass}`}>
                  {successPercentage}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              AI tasks passing QA
            </p>
          </div>
        </CardContent>
      </Card>

      {/* STAT-2: Avg Completion Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgCompletionTime.toFixed(1)}h</div>
          <p className="text-xs text-muted-foreground mb-4">
            Based on historical data
          </p>
          <div className="h-[60px] w-full mt-2">
            {/* Recharts with min-w-0 for responsive guardrail */}
            <div className="w-full h-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" debounce={100}>
                <LineChart data={sparklineData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <RechartsTooltip 
                    contentStyle={{ fontSize: '12px', background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    formatter={(value: number | undefined) => [`${(value || 0).toFixed(1)}h`, 'Time']}
                    labelStyle={{ display: 'none' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STAT-7: Live Load */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Live Load</CardTitle>
          <Activity className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">Active</span>
              <span className="text-2xl font-bold text-blue-500">
                {activeExecutions}
              </span>
            </div>
            <div className="h-px w-full bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">In Queue</span>
              <span className="text-2xl font-bold text-muted-foreground">
                {queuedExecutions}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="relative flex h-2 w-2">
                {connected && (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                )}
                {!connected && (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {connected ? 'Real-time updates active' : 'Disconnected'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

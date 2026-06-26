import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardSummary } from '@/types';
import { Activity, Clock, Zap } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Area,
  AreaChart,
} from 'recharts';

interface ExecutionKPISectionProps {
  summary: DashboardSummary | null;
}

export function ExecutionKPISection({ summary }: ExecutionKPISectionProps) {
  const { socket, connected } = useSocket('/dashboard');

  const [activeExecutions, setActiveExecutions] = useState(0);
  const [queuedExecutions, setQueuedExecutions] = useState(0);

  // Defer sparkline rendering until after first paint to prevent recharts -1 dimension errors
  const [chartMounted, setChartMounted] = useState(false);
  useEffect(() => { setChartMounted(true); }, []);

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
  let successColorClass = 'text-emerald-400';
  let successBgClass = 'bg-emerald-500';
  if (successPercentage < 70) {
    successColorClass = 'text-rose-400';
    successBgClass = 'bg-rose-500';
  } else if (successPercentage < 90) {
    successColorClass = 'text-amber-400';
    successBgClass = 'bg-amber-500';
  }

  // Real 7-day daily trend from backend
  const rawDailyData = summary.daily_avg_completion_hours ?? Array(7).fill(0);
  const sparklineData = rawDailyData.map((value, i) => ({
    name: `Day ${i + 1}`,
    value,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      {/* Success Rate Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="h-[280px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            <div className={`p-2 rounded-lg ${successBgClass}/10`}>
              <Zap className={`h-4 w-4 ${successColorClass}`} />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center">
            {/* Circular Progress */}
            <div className="relative h-28 w-28 flex-shrink-0">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                {/* Background circle */}
                <path
                  className="text-[var(--border)]"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Progress circle */}
                <motion.path
                  className={successColorClass}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  initial={{ strokeDasharray: '0, 100' }}
                  animate={{ strokeDasharray: `${successPercentage}, 100` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`data-figure tabular-nums text-2xl font-semibold ${successColorClass}`}>
                  {successPercentage}%
                </span>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                AI tasks passing QA validation
              </p>
              <div className="mt-2 flex items-center justify-center gap-2">
                {successPercentage >= 90 ? (
                  <span className="status-badge status-badge-success">
                    Excellent
                  </span>
                ) : successPercentage >= 70 ? (
                  <span className="status-badge status-badge-warning">
                    Good
                  </span>
                ) : (
                  <span className="status-badge status-badge-error">
                    Needs Attention
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Avg Completion Time Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="h-[280px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Completion Time</CardTitle>
            <div className="p-2 rounded-md bg-violet-500/10">
              <Clock className="h-4 w-4 text-violet-400" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="data-figure tabular-nums text-3xl font-semibold text-foreground">{avgCompletionTime.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">hours</span>
            </div>
            
            <div className="flex-1 min-h-0 w-full">
              {chartMounted && (
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                  <AreaChart data={sparklineData}>
                    <defs>
                      <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#a855f7"
                      strokeWidth={2}
                      fill="url(#timeGradient)"
                      isAnimationActive={false}
                    />
                    <RechartsTooltip
                      contentStyle={{ 
                        fontSize: '11px', 
                        background: 'var(--popover)', 
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number | undefined) => [`${(value || 0).toFixed(1)}h`, 'Time']}
                      labelStyle={{ display: 'none' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Live Load Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="h-[280px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Live Load</CardTitle>
            <div className="p-2 rounded-md bg-primary/10">
              <Activity className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--card-border)]">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="relative flex h-2 w-2">
                    {connected && (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                      </>
                    )}
                    {!connected && (
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">Active</span>
                </div>
                <span className="text-3xl font-bold text-emerald-400">
                  {activeExecutions}
                </span>
              </div>
              
              <div className="text-center p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--card-border)]">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-2 w-2 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">Queued</span>
                </div>
                <span className="text-3xl font-bold text-foreground">
                  {queuedExecutions}
                </span>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2">
              <span className={`text-sm ${connected ? 'text-emerald-400' : 'text-rose-400'}`}>
                {connected ? 'Real-time updates active' : 'Disconnected from server'}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

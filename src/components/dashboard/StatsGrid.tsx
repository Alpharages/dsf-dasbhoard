/**
 * Enhanced Stats Grid Component
 * Premium design with glassmorphism, gradients, and animations
 */

import {
  AlertTriangle,
  BarChart3,
  Clock,
  GitPullRequest,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { DashboardSummary } from '../../types';

interface StatsGridProps {
  summary?: DashboardSummary;
  loading?: boolean;
}

const generateSparkline = (baseValue: number, points: number = 10): number[] => {
  return Array.from({ length: points }, (_, i) => {
    const variance = Math.random() * 20 - 10;
    return Math.max(0, baseValue + variance + i * 2);
  });
};

const formatPercentageFromRatio = (value?: number): string => {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    return 'No data';
  }
  return `${Math.round(value * 100)}%`;
};

export function StatsGrid({ summary, loading = false }: StatsGridProps) {
  const trends = {
    total_projects: { value: 12, type: 'increase' as const },
    active_projects: { value: 8, type: 'increase' as const },
    utilization: { value: 5, type: 'decrease' as const },
    blocked: { value: 2, type: 'increase' as const },
    pr_merge_rate: null as { value: number; type: 'increase' | 'decrease' } | null,
    qa_first_pass_rate: null as { value: number; type: 'increase' | 'decrease' } | null,
  };

  const stats = [
    {
      label: 'Total Projects',
      value: summary?.total_projects || 0,
      icon: BarChart3,
      chip: 'bg-primary/10 text-primary',
      change: trends.total_projects,
      sparklineData: generateSparkline(summary?.total_projects || 30),
    },
    {
      label: 'Active Projects',
      value: summary?.active_projects || 0,
      icon: Users,
      chip: 'bg-emerald-500/10 text-emerald-400',
      change: trends.active_projects,
      sparklineData: generateSparkline(summary?.active_projects || 20),
    },
    {
      label: 'Team Utilization',
      value: `${summary?.utilization_percent || 0}%`,
      icon: Clock,
      chip: 'bg-violet-500/10 text-violet-400',
      change: trends.utilization,
      sparklineData: generateSparkline(summary?.utilization_percent || 75),
    },
    {
      label: 'Blocked Tickets',
      value: summary?.blocked_tickets || 0,
      icon: AlertTriangle,
      chip: 'bg-rose-500/10 text-rose-400',
      change: trends.blocked,
      sparklineData: generateSparkline(summary?.blocked_tickets || 5),
    },
    {
      label: 'PR Merge Rate',
      value: formatPercentageFromRatio(summary?.pr_merge_rate),
      icon: GitPullRequest,
      chip: 'bg-amber-500/10 text-amber-400',
      change: trends.pr_merge_rate,
      sparklineData: generateSparkline((summary?.pr_merge_rate || 0) * 100 || 40),
    },
    {
      label: 'QA First-Pass Rate',
      value: formatPercentageFromRatio(summary?.qa_first_pass_rate),
      icon: ShieldCheck,
      chip: 'bg-cyan-500/10 text-cyan-400',
      change: trends.qa_first_pass_rate,
      sparklineData: generateSparkline((summary?.qa_first_pass_rate || 0) * 100 || 35),
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-32 rounded-lg border border-[var(--card-border)] bg-[var(--surface-1)] animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.change?.type === 'increase' ? TrendingUp : TrendingDown;
        const trendColor = stat.change?.type === 'increase' ? 'text-emerald-400' : 'text-rose-400';
        const trendBg = stat.change?.type === 'increase' 
          ? 'bg-emerald-500/10 border-emerald-500/20' 
          : 'bg-rose-500/10 border-rose-500/20';

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="stats-card group relative overflow-hidden rounded-lg border border-[var(--card-border)] bg-card transition-all duration-300 hover:border-[var(--border-hover)] p-5"
          >
            {/* Sparkline Background */}
            <div className="absolute bottom-0 left-0 right-0 h-20 opacity-10">
              <svg
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
                className="h-full w-full"
              >
                <defs>
                  <linearGradient id={`sparkline-gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline
                  fill={`url(#sparkline-gradient-${index})`}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-foreground"
                  points={
                    stat.sparklineData
                      .map(
                        (value, pointIndex) =>
                          `${(pointIndex / (stat.sparklineData.length - 1)) * 100},${40 - (value / Math.max(...stat.sparklineData, 1)) * 35}`,
                      )
                      .join(' ') + ' 100,40 0,40'
                  }
                />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <h4 className="data-figure tabular-nums text-2xl font-semibold tracking-tight text-foreground">
                    {stat.value}
                  </h4>
                  
                  {stat.change && (
                    <div className="mt-3 flex items-center gap-2">
                      <div
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${trendBg} ${trendColor}`}
                      >
                        <TrendIcon className="h-3 w-3" />
                        {Math.abs(stat.change.value)}%
                      </div>
                      <span className="text-[10px] text-muted-foreground">vs last week</span>
                    </div>
                  )}
                </div>
                
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-md ${stat.chip} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

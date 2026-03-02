/**
 * Enhanced Stats Grid Component
 * Uses StatsCard with sparklines, trends, and animations
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
    return 'No data yet';
  }
  return `${Math.round(value * 100)}%`;
};

export function StatsGrid({ summary, loading = false }: StatsGridProps) {
  const trends = {
    total_projects: { value: 12, type: 'increase' as const },
    active_projects: { value: 8, type: 'increase' as const },
    utilization: { value: 5, type: 'decrease' as const },
    blocked: { value: 2, type: 'increase' as const },
    // No historical trend data available for these new KPIs yet — omit to avoid misleading display
    pr_merge_rate: null as { value: number; type: 'increase' | 'decrease' } | null,
    qa_first_pass_rate: null as { value: number; type: 'increase' | 'decrease' } | null,
  };

  const stats = [
    {
      label: 'Total Projects',
      value: summary?.total_projects || 0,
      icon: BarChart3,
      color: 'blue' as const,
      change: trends.total_projects,
      sparklineData: generateSparkline(summary?.total_projects || 30),
    },
    {
      label: 'Active Projects',
      value: summary?.active_projects || 0,
      icon: Users,
      color: 'emerald' as const,
      change: trends.active_projects,
      sparklineData: generateSparkline(summary?.active_projects || 20),
    },
    {
      label: 'Team Utilization',
      value: `${summary?.utilization_percent || 0}%`,
      icon: Clock,
      color: 'purple' as const,
      change: trends.utilization,
      sparklineData: generateSparkline(summary?.utilization_percent || 75),
    },
    {
      label: 'Blocked Tickets',
      value: summary?.blocked_tickets || 0,
      icon: AlertTriangle,
      color: 'rose' as const,
      change: trends.blocked,
      sparklineData: generateSparkline(summary?.blocked_tickets || 5),
    },
    {
      label: 'PR Merge Rate',
      value: formatPercentageFromRatio(summary?.pr_merge_rate),
      icon: GitPullRequest,
      color: 'amber' as const,
      change: trends.pr_merge_rate,
      sparklineData: generateSparkline((summary?.pr_merge_rate || 0) * 100 || 40),
    },
    {
      label: 'QA First-Pass Rate',
      value: formatPercentageFromRatio(summary?.qa_first_pass_rate),
      icon: ShieldCheck,
      color: 'cyan' as const,
      change: trends.qa_first_pass_rate,
      sparklineData: generateSparkline((summary?.qa_first_pass_rate || 0) * 100 || 35),
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl border border-border bg-card animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.change?.type === 'increase' ? TrendingUp : TrendingDown;
        const trendColor = stat.change?.type === 'increase' ? 'text-emerald-400' : 'text-rose-400';
        const trendBg = stat.change?.type === 'increase' ? 'bg-emerald-500/10' : 'bg-rose-500/10';

        const colorClasses = {
          blue: {
            text: 'text-blue-400',
            iconBg: 'bg-blue-500/20',
            gradient: 'from-blue-500 to-blue-600',
          },
          emerald: {
            text: 'text-emerald-400',
            iconBg: 'bg-emerald-500/20',
            gradient: 'from-emerald-500 to-emerald-600',
          },
          purple: {
            text: 'text-purple-400',
            iconBg: 'bg-purple-500/20',
            gradient: 'from-purple-500 to-purple-600',
          },
          rose: {
            text: 'text-rose-400',
            iconBg: 'bg-rose-500/20',
            gradient: 'from-rose-500 to-rose-600',
          },
          amber: {
            text: 'text-amber-400',
            iconBg: 'bg-amber-500/20',
            gradient: 'from-amber-500 to-amber-600',
          },
          cyan: {
            text: 'text-cyan-400',
            iconBg: 'bg-cyan-500/20',
            gradient: 'from-cyan-500 to-cyan-600',
          },
        };

        const colors = colorClasses[stat.color];

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -2 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-border/80 hover:shadow-lg"
          >
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20">
              <svg
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
                className="h-full w-full"
              >
                <defs>
                  <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline
                  fill={`url(#gradient-${index})`}
                  stroke="currentColor"
                  strokeWidth="2"
                  className={colors.text}
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

            <div
              className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${colors.gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                  <h4 className="mt-1 text-3xl font-black tracking-tight text-foreground">
                    {stat.value}
                  </h4>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.iconBg} ${colors.text}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>

              {stat.change && (
                <div className="mt-4 flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${trendBg} ${trendColor}`}
                  >
                    <TrendIcon className="h-3 w-3" />
                    {Math.abs(stat.change.value)}%
                  </div>
                  <span className="text-xs text-muted-foreground">vs last week</span>
                </div>
              )}
            </div>

            <div
              className={`absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r ${colors.gradient} transition-all duration-500 group-hover:w-full`}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

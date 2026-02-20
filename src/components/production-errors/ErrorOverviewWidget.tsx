/**
 * Error Overview Widget
 * Story 9-U-5: Production Error Dashboard - AC#1
 *
 * Displays error metrics overview with color-coded severity indicators.
 * 
 * Optimizations:
 * - React.memo to prevent unnecessary re-renders (no props, pure data display)
 */

import { memo } from 'react';
import { AlertTriangle, Clock, Activity, TrendingUp } from 'lucide-react';
import { useProductionErrorsOverview } from '@/hooks/useProductionErrors';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  colorClass: string;
  isLoading?: boolean;
}

function StatCard({ title, value, subtitle, icon, colorClass, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-border/80 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${colorClass}`}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-muted ${colorClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ErrorOverviewWidgetComponent() {
  const { data: overview, isLoading } = useProductionErrorsOverview();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Active Errors */}
      <StatCard
        title="Total Active Errors"
        value={overview?.totalActiveErrors ?? '-'}
        subtitle="Errors awaiting resolution"
        icon={<Activity className="w-5 h-5" />}
        colorClass="text-blue-500"
        isLoading={isLoading}
      />

      {/* New Errors (24h) */}
      <StatCard
        title="New Errors (24h)"
        value={overview?.newErrors24h ?? '-'}
        subtitle="Recently detected"
        icon={<TrendingUp className="w-5 h-5" />}
        colorClass="text-purple-500"
        isLoading={isLoading}
      />

      {/* Critical/High Errors */}
      <StatCard
        title="Critical/High"
        value={isLoading ? '-' : `${overview?.criticalErrors || 0} / ${overview?.highErrors || 0}`}
        subtitle="Critical / High severity"
        icon={<AlertTriangle className="w-5 h-5" />}
        colorClass="text-red-500"
        isLoading={isLoading}
      />

      {/* MTTR */}
      <StatCard
        title="Avg Time to Resolution"
        value={overview?.mttrHours ? `${overview.mttrHours.toFixed(1)}h` : 'N/A'}
        subtitle="Mean time to resolve"
        icon={<Clock className="w-5 h-5" />}
        colorClass="text-emerald-500"
        isLoading={isLoading}
      />
    </div>
  );
}

// Memoize since this component has no props and only displays data
export const ErrorOverviewWidget = memo(ErrorOverviewWidgetComponent);

/**
 * Application Health Heatmap
 * Story 9-U-5: Production Error Dashboard - AC#6
 *
 * Card grid showing application health status with color coding.
 * 
 * Optimizations:
 * - React.memo to prevent unnecessary re-renders
 */

import { memo } from 'react';
import { useApplicationHealth } from '@/hooks/useProductionErrors';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import type { HealthStatus } from '@/api/production-errors';

interface HealthCardProps {
  application: string;
  errorCount24h: number;
  healthStatus: HealthStatus;
  lastErrorAt?: string;
  onClick: () => void;
}

function getHealthColor(status: HealthStatus): string {
  switch (status) {
    case 'GREEN':
      return 'border-emerald-500/50 bg-emerald-500/10';
    case 'YELLOW':
      return 'border-yellow-500/50 bg-yellow-500/10';
    case 'ORANGE':
      return 'border-orange-500/50 bg-orange-500/10';
    case 'RED':
      return 'border-red-500/50 bg-red-500/10';
    default:
      return 'border-border bg-muted';
  }
}

function getHealthIndicator(status: HealthStatus): string {
  switch (status) {
    case 'GREEN':
      return 'bg-emerald-500';
    case 'YELLOW':
      return 'bg-yellow-500';
    case 'ORANGE':
      return 'bg-orange-500';
    case 'RED':
      return 'bg-red-500';
    default:
      return 'bg-muted-foreground';
  }
}

function HealthCard({ application, errorCount24h, healthStatus, lastErrorAt, onClick }: HealthCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${getHealthColor(healthStatus)}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-foreground truncate">{application}</h4>
        <div className={`w-3 h-3 rounded-full ${getHealthIndicator(healthStatus)}`} />
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-semibold text-foreground data-figure tabular-nums">
          {errorCount24h} <span className="text-sm font-normal text-muted-foreground">errors (24h)</span>
        </p>
        {lastErrorAt && (
          <p className="text-xs text-muted-foreground">
            Last: {formatDistanceToNow(new Date(lastErrorAt), { addSuffix: true })}
          </p>
        )}
      </div>
    </div>
  );
}

// Memoize to prevent re-renders when parent updates but props don't change
export const ApplicationHealthHeatmap = memo(ApplicationHealthHeatmapComponent);

interface ApplicationHealthHeatmapProps {
  onSelectApplication: (application: string) => void;
}

function ApplicationHealthHeatmapComponent({ onSelectApplication }: ApplicationHealthHeatmapProps) {
  const { data: healthData, isLoading } = useApplicationHealth();

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  const applications = healthData?.applications || [];

  if (applications.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Application Health</h3>
        <div className="text-center py-8 text-muted-foreground">
          No applications with errors in the last 24 hours
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Application Health</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {applications.map((app) => (
          <HealthCard
            key={app.application}
            application={app.application}
            errorCount24h={app.errorCount24h}
            healthStatus={app.healthStatus}
            lastErrorAt={app.lastErrorAt}
            onClick={() => onSelectApplication(app.application)}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs text-muted-foreground">Healthy (0 errors)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-xs text-muted-foreground">Warning (1-5 medium/low)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-xs text-muted-foreground">Elevated (High errors or 6+ medium/low)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs text-muted-foreground">Critical (1+ critical errors)</span>
        </div>
      </div>
    </div>
  );
}

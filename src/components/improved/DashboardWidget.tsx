/**
 * Dashboard Widget System
 * Reusable, configurable widgets for the main dashboard
 */

import { useState } from 'react';
import { 
  MoreHorizontal, 
  RefreshCw, 
  Maximize2, 
  X, 
  Settings,
  GripVertical,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface WidgetProps {
  id?: string;
  title: string;
  icon?: LucideIcon;
  description?: string;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  error?: string | null;
  refreshable?: boolean;
  onRefresh?: () => void;
  onRemove?: () => void;
  onConfigure?: () => void;
  expandable?: boolean;
  expandedContent?: React.ReactNode;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full';
}

export function DashboardWidget({
  title,
  icon: Icon,
  description,
  children,
  className,
  loading = false,
  error = null,
  refreshable = false,
  onRefresh,
  onRemove,
  onConfigure,
  expandable = false,
  expandedContent,
  headerActions,
  footer,
  size = 'medium',
}: WidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const sizeClasses = {
    small: '',
    medium: '',
    large: 'lg:col-span-2',
    full: 'lg:col-span-full',
  };

  return (
    <>
      <div
        className={cn(
          'group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm transition-all duration-300',
          'hover:border-slate-700 hover:shadow-lg hover:shadow-black/10',
          sizeClasses[size],
          className
        )}
      >
        {/* Widget Header */}
        <div className="flex items-center justify-between border-b border-slate-800/50 px-5 py-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
                <Icon className="h-4 w-4" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-slate-200">{title}</h3>
              {description && (
                <p className="text-xs text-slate-500">{description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {headerActions}

            {refreshable && onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-slate-300"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-slate-300"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 border-slate-800 bg-slate-900">
                {expandable && (
                  <DropdownMenuItem onClick={() => setIsExpanded(true)}>
                    <Maximize2 className="mr-2 h-4 w-4" />
                    Expand view
                  </DropdownMenuItem>
                )}
                {onConfigure && (
                  <DropdownMenuItem onClick={onConfigure}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-slate-800" />
                {onRemove && (
                  <DropdownMenuItem onClick={onRemove} className="text-rose-400 focus:text-rose-400">
                    <X className="mr-2 h-4 w-4" />
                    Remove widget
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Widget Content */}
        <div className="relative flex-1 p-5">
          {loading ? (
            <WidgetSkeleton />
          ) : error ? (
            <WidgetError message={error} onRetry={handleRefresh} />
          ) : (
            children
          )}
        </div>

        {/* Widget Footer */}
        {footer && (
          <div className="border-t border-slate-800/50 px-5 py-3">
            {footer}
          </div>
        )}

        {/* Hover Actions Overlay */}
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex items-center gap-1 rounded-lg bg-slate-800/90 p-1 shadow-lg">
            <GripVertical className="h-4 w-4 cursor-grab text-slate-500" />
          </div>
        </div>
      </div>

      {/* Expanded View Dialog */}
      {expandable && (
        <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
          <DialogContent className="max-w-6xl border-slate-800 bg-slate-900">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {Icon && <Icon className="h-5 w-5 text-blue-400" />}
                {title}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {expandedContent || children}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// Widget Skeleton Loading State
function WidgetSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 w-3/4 rounded bg-slate-800" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-20 rounded-xl bg-slate-800" />
        <div className="h-20 rounded-xl bg-slate-800" />
        <div className="h-20 rounded-xl bg-slate-800" />
      </div>
      <div className="h-32 rounded-xl bg-slate-800" />
    </div>
  );
}

// Widget Error State
function WidgetError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
        <X className="h-8 w-8 text-rose-500" />
      </div>
      <h4 className="mb-2 font-semibold text-slate-300">Failed to load data</h4>
      <p className="mb-4 max-w-xs text-sm text-slate-500">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  );
}

// Widget Container for Grid Layout
interface WidgetContainerProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function WidgetContainer({ children, className, columns = 2 }: WidgetContainerProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', columnClasses[columns], className)}>
      {children}
    </div>
  );
}

// Pre-built Widget Templates

// 1. Metric List Widget
interface MetricListItem {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export function MetricListWidget({
  title,
  icon,
  metrics,
  className,
}: {
  title: string;
  icon?: LucideIcon;
  metrics: MetricListItem[];
  className?: string;
}) {
  return (
    <DashboardWidget title={title} icon={icon} className={className} size="small">
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg bg-slate-800/50 px-4 py-3 transition-colors hover:bg-slate-800"
          >
            <span className="text-sm text-slate-400">{metric.label}</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">{metric.value}</span>
              {metric.change !== undefined && (
                <span
                  className={cn(
                    'text-xs font-medium',
                    metric.trend === 'up' && 'text-emerald-400',
                    metric.trend === 'down' && 'text-rose-400',
                    metric.trend === 'neutral' && 'text-slate-500'
                  )}
                >
                  {metric.change > 0 ? '+' : ''}
                  {metric.change}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardWidget>
  );
}

// 2. Activity Feed Widget
interface ActivityItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  user?: string;
}

export function ActivityFeedWidget({
  title,
  activities,
  className,
}: {
  title: string;
  activities: ActivityItem[];
  className?: string;
}) {
  const typeColors = {
    success: 'bg-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/20 text-amber-400',
    error: 'bg-rose-500/20 text-rose-400',
    info: 'bg-blue-500/20 text-blue-400',
  };

  return (
    <DashboardWidget title={title} icon={RefreshCw} className={className} size="medium">
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <div className={cn('h-2 w-2 shrink-0 rounded-full mt-2', typeColors[activity.type].split(' ')[0].replace('/20', ''))} />
            <div className="flex-1">
              <p className="text-sm text-slate-300">{activity.message}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span>{activity.timestamp}</span>
                {activity.user && (
                  <>
                    <span>•</span>
                    <span>{activity.user}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardWidget>
  );
}

// 3. Quick Stats Widget
interface QuickStat {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

export function QuickStatsWidget({
  title,
  stats,
  className,
}: {
  title: string;
  stats: QuickStat[];
  className?: string;
}) {
  return (
    <DashboardWidget title={title} className={className} size="large">
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-3 rounded-xl bg-slate-800/50 p-4 transition-colors hover:bg-slate-800"
            >
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', stat.color)}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardWidget>
  );
}

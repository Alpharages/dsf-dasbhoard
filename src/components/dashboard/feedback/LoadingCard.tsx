import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LoadingCardProps {
  className?: string;
  height?: number | string;
  variant?: 'default' | 'kpi' | 'chart' | 'list';
  rows?: number;
}

const variantHeights = {
  default: 200,
  kpi: 160,
  chart: 320,
  list: 400,
};

export function LoadingCard({
  className,
  height,
  variant = 'default',
  rows = 3,
}: LoadingCardProps) {
  const computedHeight = height || variantHeights[variant];

  if (variant === 'kpi') {
    return (
      <div
        className={cn(
          'rounded-2xl border border-[var(--card-border)] bg-[var(--surface-2)] p-5',
          className
        )}
        style={{ height: computedHeight }}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-3 w-24 rounded bg-muted animate-pulse" />
            <div className="h-8 w-20 rounded bg-muted animate-pulse" />
            <div className="h-3 w-32 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-11 w-11 rounded-xl bg-muted animate-pulse" />
        </div>
        <div className="mt-auto pt-4">
          <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div
        className={cn(
          'rounded-2xl border border-[var(--card-border)] bg-[var(--surface-2)] p-5 flex flex-col',
          className
        )}
        style={{ height: computedHeight }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="h-9 w-9 rounded-xl bg-muted animate-pulse" />
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        </div>
        <div className="flex-1 flex items-end justify-center gap-2">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="w-full bg-muted rounded-t"
              initial={{ height: '20%' }}
              animate={{ height: `${Math.random() * 60 + 20}%` }}
              transition={{
                repeat: Infinity,
                repeatType: 'reverse',
                duration: 1.5,
                delay: i * 0.1,
              }}
              style={{ maxWidth: 40 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div
        className={cn(
          'rounded-2xl border border-[var(--card-border)] bg-[var(--surface-2)] p-5',
          className
        )}
        style={{ height: computedHeight }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 rounded-xl bg-muted animate-pulse" />
          <div className="h-4 w-40 rounded bg-muted animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default loading card
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--card-border)] bg-[var(--surface-2)] p-5',
        className
      )}
      style={{ height: computedHeight }}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-muted animate-pulse" />
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-40 rounded-xl bg-muted animate-pulse" />
      </div>
    </div>
  );
}

// Skeleton components for specific use cases
export function KpiSkeleton({ className }: { className?: string }) {
  return <LoadingCard variant="kpi" className={className} />;
}

export function ChartSkeleton({ className }: { className?: string }) {
  return <LoadingCard variant="chart" className={className} />;
}

export function ListSkeleton({ className, rows }: { className?: string; rows?: number }) {
  return <LoadingCard variant="list" rows={rows} className={className} />;
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--surface-2)] overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-1)]">
        <div className="flex items-center gap-4">
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="h-4 w-16 rounded bg-muted animate-pulse ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

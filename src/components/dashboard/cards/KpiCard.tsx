import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconGradient?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  status?: 'success' | 'warning' | 'error' | 'neutral';
  className?: string;
  children?: React.ReactNode;
  delay?: number;
}

const statusConfig = {
  success: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  warning: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  error: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  neutral: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
};

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  status = 'neutral',
  className,
  children,
  delay = 0,
}: KpiCardProps) {
  const statusStyle = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        'stats-card group h-[150px] flex flex-col',
        className
      )}
    >
      <div className="relative z-10 p-5 flex flex-col h-full">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              {title}
            </p>
            <h4 className="data-figure text-3xl font-semibold tracking-tight text-foreground truncate">
              {value}
            </h4>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-md shrink-0 ml-3',
              statusStyle.bg,
              statusStyle.text
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {trend && (
          <div className="mt-auto pt-3 flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums border',
                statusStyle.bg,
                statusStyle.text,
                statusStyle.border
              )}
            >
              {trend.direction === 'up' && '↑'}
              {trend.direction === 'down' && '↓'}
              {trend.direction === 'neutral' && '→'}
              {Math.abs(trend.value)}%
            </div>
            {trend.label && (
              <span className="text-[10px] text-muted-foreground">{trend.label}</span>
            )}
          </div>
        )}

        {children && <div className="mt-auto pt-3">{children}</div>}
      </div>
    </motion.div>
  );
}

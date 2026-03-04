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

const defaultGradients = {
  blue: 'from-blue-500 to-cyan-400',
  emerald: 'from-emerald-500 to-teal-400',
  purple: 'from-purple-500 to-pink-400',
  rose: 'from-rose-500 to-orange-400',
  amber: 'from-amber-500 to-yellow-400',
  violet: 'from-violet-500 to-purple-400',
};

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconGradient = 'blue',
  trend,
  status = 'neutral',
  className,
  children,
  delay = 0,
}: KpiCardProps) {
  const gradient = defaultGradients[iconGradient as keyof typeof defaultGradients] || defaultGradients.blue;
  const statusStyle = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--surface-2)] backdrop-blur-sm',
        'transition-all duration-300 hover:border-[var(--border-hover)] hover:shadow-xl',
        'h-[160px] flex flex-col',
        className
      )}
    >
      {/* Background glow */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      <div className="relative z-10 p-5 flex flex-col h-full">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {title}
            </p>
            <h4 className="text-2xl font-bold tracking-tight text-foreground truncate">
              {value}
            </h4>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg shrink-0 ml-3',
              gradient
            )}
            style={{ boxShadow: `0 4px 15px rgba(var(--primary), 0.2)` }}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>

        {trend && (
          <div className="mt-auto pt-3 flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border',
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

      {/* Bottom gradient line */}
      <div className={cn('absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r transition-all duration-500 group-hover:w-full', gradient)} />
    </motion.div>
  );
}

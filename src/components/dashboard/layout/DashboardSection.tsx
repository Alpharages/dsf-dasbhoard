import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardSectionProps {
  title: string;
  icon?: LucideIcon;
  iconGradient?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  delay?: number;
  collapsible?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  badge?: {
    text: string;
    variant?: 'success' | 'warning' | 'error' | 'info';
  };
}

const gradientMap = {
  blue: 'from-blue-500 to-cyan-400',
  emerald: 'from-emerald-500 to-teal-400',
  purple: 'from-purple-500 to-pink-400',
  rose: 'from-rose-500 to-orange-400',
  amber: 'from-amber-500 to-yellow-400',
  violet: 'from-violet-500 to-purple-400',
  indigo: 'from-indigo-500 to-blue-400',
};

const badgeVariants = {
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  error: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export function DashboardSection({
  title,
  icon: Icon,
  iconGradient = 'blue',
  children,
  className,
  headerAction,
  delay = 0,
  badge,
}: DashboardSectionProps) {
  const gradient = gradientMap[iconGradient as keyof typeof gradientMap] || gradientMap.blue;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn('mb-8', className)}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg',
                gradient
              )}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
          )}
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            {badge && (
              <span
                className={cn(
                  'text-xs px-3 py-1 rounded-full font-semibold border',
                  badgeVariants[badge.variant || 'info']
                )}
              >
                {badge.text}
              </span>
            )}
          </div>
        </div>
        {headerAction && <div className="flex items-center gap-2">{headerAction}</div>}
      </div>
      {children}
    </motion.section>
  );
}

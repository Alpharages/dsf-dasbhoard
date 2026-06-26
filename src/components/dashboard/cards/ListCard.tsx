import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListCardProps {
  title: string;
  icon: LucideIcon;
  iconGradient?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  delay?: number;
  minHeight?: number;
  empty?: boolean;
  emptyContent?: React.ReactNode;
}

const defaultGradients = {
  blue: 'from-blue-500 to-cyan-400',
  emerald: 'from-emerald-500 to-teal-400',
  purple: 'from-purple-500 to-pink-400',
  rose: 'from-rose-500 to-orange-400',
  amber: 'from-amber-500 to-yellow-400',
  violet: 'from-violet-500 to-purple-400',
  indigo: 'from-indigo-500 to-blue-400',
};

export function ListCard({
  title,
  icon: Icon,
  iconGradient = 'blue',
  children,
  className,
  headerAction,
  delay = 0,
  minHeight = 400,
  empty = false,
  emptyContent,
}: ListCardProps) {
  const gradient = defaultGradients[iconGradient as keyof typeof defaultGradients] || defaultGradients.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        'h-full flex flex-col rounded-lg border border-[var(--card-border)] bg-[var(--surface-2)] backdrop-blur-sm overflow-hidden',
        className
      )}
      style={{ minHeight: `${minHeight}px` }}
    >
      <div className="flex items-center justify-between p-5 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg',
              gradient
            )}
          >
            <Icon className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-base font-bold text-foreground">{title}</h3>
        </div>
        {headerAction && <div className="flex items-center gap-2">{headerAction}</div>}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {empty && emptyContent ? (
          <div className="h-full flex flex-col items-center justify-center p-6">
            {emptyContent}
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-2">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
}

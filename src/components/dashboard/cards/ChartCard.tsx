import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartCardProps {
  title: string;
  icon: LucideIcon;
  iconGradient?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  delay?: number;
  minHeight?: number;
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

export function ChartCard({
  title,
  icon: Icon,
  iconGradient = 'blue',
  children,
  className,
  headerAction,
  delay = 0,
  minHeight = 320,
}: ChartCardProps) {
  const gradient = defaultGradients[iconGradient as keyof typeof defaultGradients] || defaultGradients.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="h-full"
    >
      <Card
        className={cn(
          'h-full flex flex-col overflow-hidden',
          className
        )}
        style={{ minHeight: `${minHeight}px` }}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg',
                gradient
              )}
            >
              <Icon className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          {headerAction && <div className="flex items-center gap-2">{headerAction}</div>}
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex flex-col">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}

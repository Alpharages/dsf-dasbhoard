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

export function ChartCard({
  title,
  icon: Icon,
  children,
  className,
  headerAction,
  delay = 0,
  minHeight = 320,
}: ChartCardProps) {
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
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
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

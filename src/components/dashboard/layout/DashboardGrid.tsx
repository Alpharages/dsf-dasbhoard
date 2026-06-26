import { cn } from '@/lib/utils';

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
}

const gapMap = {
  sm: 'gap-4',
  md: 'gap-5',
  lg: 'gap-6',
};

const columnMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

export function DashboardGrid({
  children,
  className,
  columns = 3,
  gap = 'md',
  responsive = true,
}: DashboardGridProps) {
  return (
    <div
      className={cn(
        'grid',
        responsive ? columnMap[columns] : `grid-cols-${columns}`,
        gapMap[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

// Specialized grid layouts
export function KpiGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <DashboardGrid columns={3} gap="md" className={cn('mb-6', className)}>
      {children}
    </DashboardGrid>
  );
}

export function ChartGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-4', className)}>
      {children}
    </div>
  );
}

export function SplitLayout({
  primary,
  secondary,
  className,
  ratio = '2:1',
}: {
  primary: React.ReactNode;
  secondary: React.ReactNode;
  className?: string;
  ratio?: '2:1' | '1:1' | '3:1';
}) {
  const ratioClasses = {
    '2:1': 'lg:grid-cols-3',
    '1:1': 'lg:grid-cols-2',
    '3:1': 'lg:grid-cols-4',
  };

  const primarySpan = {
    '2:1': 'lg:col-span-2',
    '1:1': 'lg:col-span-1',
    '3:1': 'lg:col-span-3',
  };

  return (
    <div className={cn('grid grid-cols-1 gap-4', ratioClasses[ratio], className)}>
      <div className={primarySpan[ratio]}>{primary}</div>
      <div>{secondary}</div>
    </div>
  );
}

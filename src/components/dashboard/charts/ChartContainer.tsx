import { useEffect, useState } from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
  height?: number | string;
  debounce?: number;
  minWidth?: number;
}

export function ChartContainer({
  children,
  className,
  height = '100%',
  debounce = 100,
  minWidth = 0,
}: ChartContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer rendering until after first paint to prevent recharts dimension errors
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn('w-full flex items-end justify-center gap-2', className)}
        style={{ height }}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="w-full max-w-[40px] bg-muted rounded-t animate-pulse"
            style={{ height: `${Math.random() * 40 + 20}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('w-full h-full min-w-0', className)} style={{ minWidth }}>
      <ResponsiveContainer width="100%" height={height as number} debounce={debounce}>
        {children as any}
      </ResponsiveContainer>
    </div>
  );
}

// Chart tooltip styles
export const chartTooltipStyles = {
  contentStyle: {
    background: 'var(--popover)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '12px',
    padding: '12px',
  },
  labelStyle: {
    color: 'var(--foreground)',
    fontWeight: 600,
    marginBottom: '8px',
  },
};

// Common gradient definitions
export const chartGradients = {
  purple: {
    id: 'purpleGradient',
    colors: ['#8b5cf6', '#6366f1'],
  },
  blue: {
    id: 'blueGradient',
    colors: ['#3b82f6', '#60a5fa'],
  },
  emerald: {
    id: 'emeraldGradient',
    colors: ['#10b981', '#34d399'],
  },
  rose: {
    id: 'roseGradient',
    colors: ['#ef4444', '#f87171'],
  },
};

// Chart colors
export const chartColors = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  muted: '#64748b',
};

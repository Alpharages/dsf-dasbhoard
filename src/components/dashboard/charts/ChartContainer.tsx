import { useEffect, useRef, useState } from 'react';
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
  const ref = useRef<HTMLDivElement>(null);
  // ResponsiveContainer seeds its size from initialDimension (default {-1,-1})
  // and logs "width(-1)/height(-1)" on its FIRST render — before its own
  // measuring effect runs — whenever both width and height are percentages.
  // Deferring the mount by a tick doesn't help (the initial state is still -1).
  // So we measure the wrapper ourselves, only mount once it has a real size,
  // and seed initialDimension so the first render already has positive dims.
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const measure = (w: number, h: number) => {
      if (w > 0 && h > 0) setSize({ width: Math.round(w), height: Math.round(h) });
    };
    measure(el.clientWidth, el.clientHeight);
    const ro = new ResizeObserver((entries) => {
      const box = entries[0].contentRect;
      measure(box.width, box.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isNumericHeight = typeof height === 'number';

  return (
    <div
      ref={ref}
      className={cn('w-full min-w-0', !isNumericHeight && 'h-full', className)}
      style={isNumericHeight ? { minWidth, height } : { minWidth }}
    >
      {size ? (
        <ResponsiveContainer
          width="100%"
          height="100%"
          debounce={debounce}
          initialDimension={size}
        >
          {children as any}
        </ResponsiveContainer>
      ) : (
        <div className="w-full h-full flex items-end justify-center gap-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-full max-w-[40px] bg-muted rounded-t animate-pulse"
              // ponytail: deterministic skeleton bars — Math.random() re-rolled every render
              style={{ height: `${((i * 37) % 40) + 20}%` }}
            />
          ))}
        </div>
      )}
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

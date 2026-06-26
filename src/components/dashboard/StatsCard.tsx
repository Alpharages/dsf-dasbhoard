/**
 * Enhanced Stats Card Component
 * Features: Sparklines, trends, animations, interactive states
 */

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
// import { motion } from 'framer-motion';

interface SparklineProps {
  data: number[];
  color: string;
  height?: number;
}

function Sparkline({ data, color, height = 40 }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full opacity-20"
      style={{ height }}
    >
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill={`url(#gradient-${color})`}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={`${points} 100,100 0,100`}
      />
    </svg>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    label?: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  sparklineData?: number[];
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'cyan';
  size?: 'default' | 'large' | 'compact';
  onClick?: () => void;
  loading?: boolean;
  className?: string;
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
    gradient: 'from-blue-500 to-blue-600',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    iconBg: 'bg-emerald-500/20',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    iconBg: 'bg-amber-500/20',
    gradient: 'from-amber-500 to-amber-600',
  },
  rose: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
    iconBg: 'bg-rose-500/20',
    gradient: 'from-rose-500 to-rose-600',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-400',
    iconBg: 'bg-purple-500/20',
    gradient: 'from-purple-500 to-purple-600',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    text: 'text-cyan-400',
    iconBg: 'bg-cyan-500/20',
    gradient: 'from-cyan-500 to-cyan-600',
  },
};

const sizeVariants = {
  default: {
    padding: 'p-5',
    iconSize: 'h-10 w-10',
    iconInner: 'h-5 w-5',
    title: 'text-[11px]',
    value: 'text-3xl',
  },
  large: {
    padding: 'p-6',
    iconSize: 'h-12 w-12',
    iconInner: 'h-6 w-6',
    title: 'text-xs',
    value: 'text-4xl',
  },
  compact: {
    padding: 'p-4',
    iconSize: 'h-9 w-9',
    iconInner: 'h-[18px] w-[18px]',
    title: 'text-[10px]',
    value: 'text-2xl',
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  change,
  sparklineData,
  icon: Icon,
  color = 'blue',
  size = 'default',
  onClick,
  loading = false,
  className,
}: StatsCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = colorVariants[color];
  const sizes = sizeVariants[size];

  const TrendIcon = change?.type === 'increase' 
    ? TrendingUp 
    : change?.type === 'decrease' 
      ? TrendingDown 
      : Minus;

  if (loading) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border border-[var(--card-border)] bg-card',
          sizes.padding,
          className
        )}
      >
        <div className="animate-pulse space-y-4">
          <div className="flex items-start justify-between">
            <div className="h-3 w-24 rounded bg-[var(--muted)]" />
            <div className={cn('rounded-md bg-[var(--muted)]', sizes.iconSize)} />
          </div>
          <div className="h-8 w-20 rounded bg-[var(--muted)]" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'stats-card group',
        onClick && 'cursor-pointer',
        sizes.padding,
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Sparkline Background */}
      {sparklineData && (
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30">
          <Sparkline data={sparklineData} color={colors.text.replace('text-', '')} />
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className={cn('font-semibold uppercase tracking-wider text-muted-foreground', sizes.title)}>
              {title}
            </p>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground/70">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              'flex items-center justify-center rounded-md transition-transform duration-200',
              colors.iconBg,
              colors.text,
              sizes.iconSize,
              isHovered && 'scale-105'
            )}
          >
            <Icon className={sizes.iconInner} />
          </div>
        </div>

        {/* Value */}
        <div className="mt-3">
          <h3
            className={cn(
              'data-figure font-semibold tracking-tight text-foreground',
              sizes.value
            )}
          >
            {value}
          </h3>
        </div>

        {/* Change Indicator */}
        {change && (
          <div className="mt-3 flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums',
                change.type === 'increase' && 'bg-emerald-500/10 text-emerald-400',
                change.type === 'decrease' && 'bg-rose-500/10 text-rose-400',
                change.type === 'neutral' && 'bg-[var(--muted)] text-muted-foreground'
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {Math.abs(change.value)}%
            </div>
            {change.label && (
              <span className="text-xs text-muted-foreground">{change.label}</span>
            )}
          </div>
        )}

        {/* Action Hint */}
        {onClick && (
          <div
            className={cn(
              'mt-4 flex items-center gap-1 text-xs font-medium transition-all duration-200',
              colors.text,
              isHovered ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0'
            )}
          >
            View details
            <ArrowRight className="h-3 w-3" />
          </div>
        )}
      </div>
    </div>
  );
}

// Stats Grid Component
interface StatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 6;
  className?: string;
}

export function StatsGrid({ children, columns = 4, className }: StatsGridProps) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  };

  return (
    <div className={cn('grid gap-4', columnClasses[columns], className)}>
      {children}
    </div>
  );
}

// Skeleton Loading State
export function StatsCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <StatsGrid>
      {Array.from({ length: count }).map((_, i) => (
        <StatsCard
          key={i}
          title="Loading..."
          value="-"
          icon={TrendingUp}
          loading
        />
      ))}
    </StatsGrid>
  );
}

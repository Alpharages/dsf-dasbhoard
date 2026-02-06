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
    padding: 'p-6',
    iconSize: 'h-12 w-12',
    iconInner: 'h-6 w-6',
    title: 'text-sm',
    value: 'text-3xl',
  },
  large: {
    padding: 'p-8',
    iconSize: 'h-14 w-14',
    iconInner: 'h-7 w-7',
    title: 'text-base',
    value: 'text-4xl',
  },
  compact: {
    padding: 'p-4',
    iconSize: 'h-10 w-10',
    iconInner: 'h-5 w-5',
    title: 'text-xs',
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
          'relative overflow-hidden rounded-2xl border border-border bg-card/50',
          sizes.padding,
          className
        )}
      >
        <div className="animate-pulse space-y-4">
          <div className="flex items-start justify-between">
            <div className="h-4 w-24 rounded bg-secondary" />
            <div className={cn('rounded-xl bg-secondary', sizes.iconSize)} />
          </div>
          <div className={cn('h-8 w-20 rounded bg-secondary', sizes.value)} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-sm transition-all duration-300',
        onClick && 'cursor-pointer hover:border-border/80 hover:shadow-lg hover:shadow-primary/5',
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

      {/* Gradient Glow on Hover */}
      <div
        className={cn(
          'absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-0 blur-3xl transition-opacity duration-500',
          colors.gradient,
          isHovered && 'opacity-20'
        )}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className={cn('font-medium text-muted-foreground', sizes.title)}>
              {title}
            </p>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              'flex items-center justify-center rounded-xl transition-transform duration-300',
              colors.iconBg,
              colors.text,
              sizes.iconSize,
              isHovered && 'scale-110'
            )}
          >
            <Icon className={sizes.iconInner} />
          </div>
        </div>

        {/* Value */}
        <div className="mt-4">
          <h3
            className={cn(
              'font-black tracking-tight text-foreground/90',
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
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold',
                change.type === 'increase' && 'bg-emerald-500/10 text-emerald-400',
                change.type === 'decrease' && 'bg-rose-500/10 text-rose-400',
                change.type === 'neutral' && 'bg-slate-500/10 text-slate-400'
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
              'mt-4 flex items-center gap-1 text-xs font-medium text-muted-foreground transition-all duration-300',
              colors.text,
              isHovered ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'
            )}
          >
            View details
            <ArrowRight className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Bottom Border Accent */}
      <div
        className={cn(
          'absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r transition-all duration-500',
          colors.gradient,
          isHovered && 'w-full'
        )}
      />
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

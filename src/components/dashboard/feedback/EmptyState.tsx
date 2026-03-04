import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
}

const sizeMap = {
  sm: {
    icon: 'w-10 h-10',
    iconBg: 'p-2.5',
    title: 'text-base',
    description: 'text-xs',
  },
  md: {
    icon: 'w-12 h-12',
    iconBg: 'p-3',
    title: 'text-lg',
    description: 'text-sm',
  },
  lg: {
    icon: 'w-16 h-16',
    iconBg: 'p-4',
    title: 'text-xl',
    description: 'text-base',
  },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'md',
  variant = 'default',
}: EmptyStateProps) {
  const sizes = sizeMap[size];

  if (variant === 'minimal') {
    return (
      <div className={cn('flex flex-col items-center justify-center text-center p-6', className)}>
        <Icon className={cn('text-muted-foreground/50 mb-3', sizes.icon)} />
        <h3 className={cn('font-semibold text-foreground', sizes.title)}>{title}</h3>
        {description && <p className={cn('text-muted-foreground mt-1', sizes.description)}>{description}</p>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 rounded-2xl',
        'bg-[var(--surface-1)] border border-dashed border-[var(--card-border)]',
        className
      )}
    >
      <div
        className={cn(
          'rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 mb-4',
          sizes.iconBg
        )}
      >
        <Icon className={cn('text-primary/60', sizes.icon)} />
      </div>
      <h3 className={cn('font-bold text-foreground mb-1', sizes.title)}>{title}</h3>
      {description && (
        <p className={cn('text-muted-foreground max-w-sm', sizes.description)}>{description}</p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-4 gap-2"
          size={size === 'sm' ? 'sm' : 'default'}
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}

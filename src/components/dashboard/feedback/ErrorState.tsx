import { AlertTriangle, RefreshCw, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: Error | string;
  onRetry?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
}

const sizeMap = {
  sm: {
    wrapper: 'p-4',
    icon: 'w-8 h-8',
    title: 'text-sm',
    description: 'text-xs',
  },
  md: {
    wrapper: 'p-6',
    icon: 'w-12 h-12',
    title: 'text-base',
    description: 'text-sm',
  },
  lg: {
    wrapper: 'p-8',
    icon: 'w-16 h-16',
    title: 'text-lg',
    description: 'text-base',
  },
};

export function ErrorState({
  title = 'Something went wrong',
  description,
  error,
  onRetry,
  className,
  size = 'md',
  icon: Icon = AlertTriangle,
}: ErrorStateProps) {
  const sizes = sizeMap[size];
  
  const errorMessage = error 
    ? typeof error === 'string' 
      ? error 
      : error.message 
    : description;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center rounded-lg',
        'bg-destructive/5 border border-destructive/20',
        sizes.wrapper,
        className
      )}
    >
      <div className={cn('text-destructive/60 mb-3', sizes.icon)}>
        <Icon className="w-full h-full" />
      </div>
      <h3 className={cn('font-semibold text-destructive mb-1', sizes.title)}>
        {title}
      </h3>
      {errorMessage && (
        <p className={cn('text-destructive/70 max-w-sm mb-4', sizes.description)}>
          {errorMessage}
        </p>
      )}
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size={size === 'sm' ? 'sm' : 'default'}
          className="gap-2 border-destructive/30 hover:bg-destructive/10"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

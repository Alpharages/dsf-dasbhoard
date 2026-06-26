/**
 * Theme Toggle Component
 * Elegant theme switcher with light, dark, black, and system options
 */

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { Theme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sun, Moon, Monitor, Check, Smartphone, Laptop } from 'lucide-react';

// Theme option definitions
const themeOptions: { value: Theme; label: string; icon: typeof Sun; description: string }[] = [
  {
    value: 'light',
    label: 'Light',
    icon: Sun,
    description: 'Clean and bright interface',
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: Moon,
    description: 'Easy on the eyes',
  },
  {
    value: 'black',
    label: 'Black',
    icon: Smartphone,
    description: 'True black for OLED displays',
  },
  {
    value: 'system',
    label: 'System',
    icon: Monitor,
    description: 'Match your device settings',
  },
];

// Compact toggle button that cycles through themes
export function ThemeToggleCompact({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();

  const icons = {
    light: Sun,
    dark: Moon,
    black: Moon,
  };

  const Icon = icons[resolvedTheme];

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={cn(
              'h-9 w-9 rounded-lg transition-colors',
              resolvedTheme === 'light' 
                ? 'text-amber-500 hover:bg-amber-500/10' 
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              className
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="sr-only">Toggle theme (currently {resolvedTheme})</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Toggle theme</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Full dropdown theme selector
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme, isSystem } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'gap-2 px-2 text-muted-foreground hover:bg-secondary hover:text-foreground',
            className
          )}
        >
          <ThemeIcon theme={resolvedTheme} className="h-4 w-4" />
          <span className="hidden sm:inline capitalize">{theme === 'system' ? 'System' : resolvedTheme}</span>
          {isSystem && (
            <span className="text-[10px] text-muted-foreground">
              ({resolvedTheme})
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 border-border bg-popover">
        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Appearance</div>
        <DropdownMenuSeparator className="bg-border" />
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.value;
          const isResolvedActive = resolvedTheme === option.value && theme === 'system';

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => {
                setTheme(option.value);
                setOpen(false);
              }}
              className={cn(
                'flex cursor-pointer items-start gap-3 py-3',
                isActive && 'bg-secondary',
                'focus:bg-secondary'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  isActive
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-secondary text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn('font-medium', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                    {option.label}
                  </span>
                  {isActive && <Check className="h-3.5 w-3.5 text-blue-400" />}
                  {isResolvedActive && (
                    <span className="text-[10px] text-muted-foreground">(active)</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{option.description}</p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Theme preview cards (for settings page)
export function ThemeSelectorCards({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const previews: { value: Theme; label: string; icon: typeof Sun; bgClass: string }[] = [
    {
      value: 'light',
      label: 'Light',
      icon: Sun,
      bgClass: 'bg-white border-border',
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: Moon,
      bgClass: 'bg-card border-border',
    },
    {
      value: 'black',
      label: 'Black',
      icon: Smartphone,
      bgClass: 'bg-black border-border',
    },
    {
      value: 'system',
      label: 'System',
      icon: Laptop,
      bgClass: 'bg-gradient-to-br from-white to-background border-[var(--border-hover)]',
    },
  ];

  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-4', className)}>
      {previews.map((preview) => {
        const isActive = theme === preview.value;

        return (
          <button
            key={preview.value}
            onClick={() => setTheme(preview.value)}
            className={cn(
              'group relative overflow-hidden rounded-xl border-2 p-4 transition-all',
              preview.bgClass,
              isActive
                ? 'border-blue-500 ring-2 ring-blue-500/20'
                : 'border-border hover:border-[var(--border-hover)]'
            )}
          >
            {/* Preview Content */}
            <div className="space-y-2">
              <div
                className={cn(
                  'h-2 w-full rounded',
                  preview.value === 'light' ? 'bg-muted' : 'bg-muted'
                )}
              />
              <div className="flex gap-2">
                <div
                  className={cn(
                    'h-8 w-8 rounded-lg',
                    preview.value === 'light' ? 'bg-muted' : 'bg-muted'
                  )}
                />
                <div className="flex-1 space-y-1">
                  <div
                    className={cn(
                      'h-2 w-3/4 rounded',
                      preview.value === 'light' ? 'bg-muted' : 'bg-muted'
                    )}
                  />
                  <div
                    className={cn(
                      'h-2 w-1/2 rounded',
                      preview.value === 'light' ? 'bg-muted' : 'bg-muted'
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Label */}
            <div className="mt-3 flex items-center justify-between">
              <span
                className={cn(
                  'text-sm font-medium',
                  preview.value === 'light' ? 'text-foreground' : 'text-foreground'
                )}
              >
                {preview.label}
              </span>
              {isActive && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>

            {/* System indicator */}
            {preview.value === 'system' && theme === 'system' && (
              <div className="absolute right-2 top-2 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                {resolvedTheme}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Helper component for theme icons
function ThemeIcon({ theme, className }: { theme: string; className?: string }) {
  const icons = {
    light: Sun,
    dark: Moon,
    black: Moon,
    system: Monitor,
  };

  const Icon = icons[theme as keyof typeof icons] || Moon;
  return <Icon className={className} />;
}

// Keyboard shortcut for theme toggle
export function useThemeShortcut() {
  const { toggleTheme } = useTheme();

  useState(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + L to toggle theme
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'l') {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });
}

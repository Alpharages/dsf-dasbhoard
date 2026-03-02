/**
 * Sidebar Component
 * Tablet: icon-only with per-item tooltip
 * Desktop: full grouped navigation
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, Clock, Pin, Star } from 'lucide-react';

import { useAuth } from '@/contexts';
import { canAccess } from '@/utils/roleHelpers';
import { cn } from '@/lib/utils';
import { navigationGroups, isNavItemActive } from '@/config/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
// TooltipProvider is already mounted at the app root (App.tsx).
// Individual Tooltip components override delayDuration directly.
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  className?: string;
}

const getTabletItemTestId = (path: string) => {
  if (path === '/') return 'tablet-nav-root';
  return `tablet-nav-${path.replaceAll('/', '-').replace(/^-+/, '')}`;
};

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const [favorites, setFavorites] = useState<string[]>(['/']);

  const visibleNavigationGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.roles) return true;
        return item.roles.some((role) => user?.role && canAccess(user.role, role));
      }),
    }))
    .filter((group) => group.items.length > 0);

  const allVisibleItems = visibleNavigationGroups.flatMap((group) => group.items);

  const toggleFavorite = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(path)
        ? prev.filter((p) => p !== path)
        : [...prev, path]
    );
  };

  return (
    // Width is controlled by the parent <aside> in App.tsx (md:w-[72px] lg:w-[280px]).
    // Sidebar uses w-full so it fills whatever container it is placed in.
    <aside
      className={cn(
        'flex h-full w-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out',
        className
      )}
      data-testid="sidebar"
    >
      {/* Logo Section */}
      <div className="flex h-[72px] items-center justify-center border-b border-sidebar-border px-3 lg:justify-start lg:px-4">
        <Link to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="whitespace-nowrap text-lg font-bold tracking-tight text-sidebar-foreground">
              DSF
            </span>
            <span className="whitespace-nowrap text-[10px] font-medium text-sidebar-foreground/60">
              Dark Software Factory
            </span>
          </div>
        </Link>
      </div>

      {/* Favorites Section - Desktop only */}
      {favorites.length > 0 && (
        <div className="hidden lg:block border-b border-sidebar-border px-4 py-3">
          <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50">
            <Pin className="h-3 w-3" />
            Favorites
          </p>
          <div className="space-y-1">
            {favorites.slice(0, 4).map((path) => {
              const item = allVisibleItems.find((i) => i.path === path);
              if (!item) return null;
              const active = isNavItemActive(path, location.pathname);
              return (
                <Link
                  key={path}
                  to={path}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors',
                    active
                      ? 'bg-sidebar-primary/10 text-sidebar-primary'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 px-2 py-4 lg:px-3">
        {/* Tablet navigation: icon-only with per-item tooltip */}
        <div className="hidden md:flex lg:hidden flex-col gap-1">
          {allVisibleItems.map((item) => {
            const active = isNavItemActive(item.path, location.pathname);

            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex h-10 w-full items-center justify-center rounded-lg transition-colors',
                      active
                        ? 'bg-sidebar-primary/10 text-sidebar-primary'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                    data-testid={getTabletItemTestId(item.path)}
                  >
                    <item.icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Desktop navigation: grouped expanded menu */}
        <div className="hidden lg:block space-y-2">
          {visibleNavigationGroups.map((group) => {
            return (
              <div key={group.id}>
                <h3 className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-sidebar-foreground/50">
                  {group.label}
                </h3>

                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isNavItemActive(item.path, location.pathname);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all',
                          active
                            ? 'bg-sidebar-primary/10 text-sidebar-primary'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon
                            className={cn(
                              'h-4 w-4 transition-colors',
                              active ? 'text-sidebar-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80'
                            )}
                          />
                          <span>{item.label}</span>
                        </div>
                        <button
                          onClick={(e) => toggleFavorite(item.path, e)}
                          className={cn(
                            'opacity-0 transition-opacity group-hover:opacity-100',
                            favorites.includes(item.path) && 'opacity-100'
                          )}
                        >
                          <Star
                            className={cn(
                              'h-3.5 w-3.5',
                              favorites.includes(item.path)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-sidebar-foreground/50'
                            )}
                          />
                        </button>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="hidden lg:block border-t border-sidebar-border p-3">
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary/10">
              <Clock className="h-4 w-4 text-sidebar-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-sidebar-foreground">Last sync</p>
              <p className="text-[10px] text-muted-foreground">2 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

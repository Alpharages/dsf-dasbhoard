/**
 * Improved Sidebar Component
 * Features: Collapsible groups, favorites, recent items, icon-only mode
 */

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { canAccess } from '@/utils/roleHelpers';
import { cn } from '@/lib/utils';
import { Briefcase, ChevronDown, ChevronRight, Clock, PanelLeftClose, PanelLeftOpen, Pin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { isNavItemActive, navigationGroups, type NavigationItem } from '@/config/navigation';

interface SidebarProps {
  className?: string;
  lastSyncAt?: Date;
}

export function ImprovedSidebar({ className, lastSyncAt: lastSyncAtProp }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  // State for collapsible features
  // Start collapsed on md screens (< 1024px) to match App.tsx md:ml-[72px] margin
  const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth < 1024);
  // Track groups the user has manually toggled. Active route's group is always auto-expanded.
  const [userExpandedGroups, setUserExpandedGroups] = useState<string[]>(['overview', 'projects']);
  const [favorites, setFavorites] = useState<string[]>(['/']);
  const [syncAnchor] = useState<Date>(() => lastSyncAtProp ?? new Date());
  const [, setNowTick] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowTick((tick) => tick + 1);
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  // Derive expanded groups: union of user-toggled groups + the active route's group.
  // This avoids setState-in-effect and ensures the active group is always visible.
  const expandedGroups = useMemo(() => {
    const activeGroupIds = navigationGroups
      .filter(group => group.items.some(item => isNavItemActive(item.path, location.pathname)))
      .map(group => group.id);
    return [...new Set([...userExpandedGroups, ...activeGroupIds])];
  }, [location.pathname, userExpandedGroups]);

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setUserExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Toggle favorite
  const toggleFavorite = (path: string, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev =>
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  // Check if item is active
  const isActive = (path: string) => isNavItemActive(path, location.pathname);

  // Filter items based on user role
  const getVisibleItems = (items: NavigationItem[]) => {
    return items.filter(item => {
      if (!item.roles) return true;
      return item.roles.some((role) => user?.role && canAccess(user.role, role));
    });
  };

  // Get all visible navigation items for favorites
  const allVisibleItems = useMemo(() => {
    const items: { path: string; label: string; icon: NavigationItem["icon"] }[] = [];
    navigationGroups.forEach(group => {
      group.items.forEach(item => {
        if (!item.roles || (user?.role && item.roles.some((role) => canAccess(user.role, role)))) {
          items.push({ path: item.path, label: item.label, icon: item.icon });
        }
      });
    });
    return items;
  }, [user]);

  const lastSyncLabel = formatDistanceToNow(syncAnchor, { addSuffix: true, includeSeconds: true });

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        isCollapsed ? 'w-[72px]' : 'w-[280px]',
        className
      )}
    >
        {/* Logo Section */}
        <div className="flex h-[72px] items-center justify-between border-b border-sidebar-border px-4">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="whitespace-nowrap text-lg font-bold tracking-tight text-sidebar-foreground">
                  DSF
                </span>
                <span className="whitespace-nowrap text-[10px] font-medium text-muted-foreground">
                  Dark Software Factory
                </span>
              </div>
            )}
          </Link>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
              aria-label="Collapse sidebar"
              onClick={() => setIsCollapsed(true)}
            >
              <PanelLeftClose data-testid="sidebar-collapse-icon" className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Favorites Section - Only show when not collapsed */}
        {!isCollapsed && favorites.length > 0 && (
          <div className="border-b border-sidebar-border px-4 py-3">
            <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <Pin className="h-3 w-3" />
              Favorites
            </p>
            <div className="space-y-1">
              {favorites.slice(0, 4).map(path => {
                const item = allVisibleItems.find(i => i.path === path);
                if (!item) return null;
                const active = isActive(path);
                return (
                  <Link
                    key={path}
                    to={path}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors',
                      active
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
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

        {/* Navigation Groups */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {navigationGroups.map(group => {
              const visibleItems = getVisibleItems(group.items);
              if (visibleItems.length === 0) return null;

              const isExpanded = expandedGroups.includes(group.id);

              if (isCollapsed) {
                // Collapsed mode: Show icons only with tooltip
                return (
                  <Tooltip key={group.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button
                        className={cn(
                          'flex h-10 w-full items-center justify-center rounded-lg transition-colors',
                          visibleItems.some(item => isActive(item.path))
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                        )}
                        onClick={() => toggleGroup(group.id)}
                      >
                        <group.icon className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="flex flex-col gap-1">
                      <span className="font-semibold">{group.label}</span>
                      <div className="space-y-1">
                        {visibleItems.map(item => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                              'block text-xs',
                              isActive(item.path) ? 'text-blue-400' : 'text-slate-400'
                            )}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <div key={group.id} className="mb-2">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-sidebar-foreground"
                  >
                    <span>{group.label}</span>
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-1 space-y-0.5">
                      {visibleItems.map(item => {
                        const active = isActive(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                              'group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all',
                              active
                                ? 'bg-blue-500/10 text-blue-500'
                                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon
                                className={cn(
                                  'h-4 w-4 transition-colors',
                                  active ? 'text-blue-500' : 'text-muted-foreground group-hover:text-sidebar-foreground'
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
                                    : 'text-slate-600'
                                )}
                              />
                            </button>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Bottom Section */}
        <div className="border-t border-sidebar-border p-3">
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-full text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  aria-label="Expand sidebar"
                  onClick={() => setIsCollapsed(false)}
                >
                  <PanelLeftOpen data-testid="sidebar-expand-icon" className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          ) : (
            <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-sidebar-foreground">Last sync</p>
                  <p data-testid="last-sync-value" className="text-[10px] text-muted-foreground">{lastSyncLabel}</p>
                </div>
              </div>
            </div>
          )}
        </div>
    </aside>
  );
}

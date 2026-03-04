/**
 * Improved Sidebar Component
 * Premium glassmorphism design with collapsible groups, favorites, recent items
 */

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { canAccess } from '@/utils/roleHelpers';
import { cn } from '@/lib/utils';
import { Sparkles, ChevronDown, ChevronRight, Clock, PanelLeftClose, PanelLeftOpen, Pin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { isNavItemActive, navigationGroups, type NavigationItem } from '@/config/navigation';
import { motion } from 'framer-motion';

interface SidebarProps {
  className?: string;
  lastSyncAt?: Date;
}

export function ImprovedSidebar({ className, lastSyncAt: lastSyncAtProp }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  // State for collapsible features
  const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth < 1024);
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

  const expandedGroups = useMemo(() => {
    const activeGroupIds = navigationGroups
      .filter(group => group.items.some(item => isNavItemActive(item.path, location.pathname)))
      .map(group => group.id);
    return [...new Set([...userExpandedGroups, ...activeGroupIds])];
  }, [location.pathname, userExpandedGroups]);

  const toggleGroup = (groupId: string) => {
    setUserExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleFavorite = (path: string, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev =>
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const isActive = (path: string) => isNavItemActive(path, location.pathname);

  const getVisibleItems = (items: NavigationItem[]) => {
    return items.filter(item => {
      if (!item.roles) return true;
      return item.roles.some((role) => user?.role && canAccess(user.role, role));
    });
  };

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
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] backdrop-blur-xl transition-all duration-300',
        isCollapsed ? 'w-[72px]' : 'w-[280px]',
        className
      )}
    >
      {/* Logo Section */}
      <div className="flex h-[72px] items-center justify-between border-b border-[var(--sidebar-border)] px-4">
        <Link to="/" className="flex items-center gap-3 overflow-hidden">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25"
          >
            <Sparkles className="h-5 w-5 text-white" />
          </motion.div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="whitespace-nowrap text-lg font-bold tracking-tight text-[var(--sidebar-foreground)]">
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
            className="h-8 w-8 text-muted-foreground hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"
            aria-label="Collapse sidebar"
            onClick={() => setIsCollapsed(true)}
          >
            <PanelLeftClose data-testid="sidebar-collapse-icon" className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Favorites Section - Only show when not collapsed */}
      {!isCollapsed && favorites.length > 0 && (
        <div className="border-b border-[var(--sidebar-border)] px-4 py-3">
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
                    'flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-all duration-200',
                    active
                      ? 'bg-[var(--sidebar-primary)]/10 text-[var(--sidebar-primary)]'
                      : 'text-muted-foreground hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]'
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
              return (
                <Tooltip key={group.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        'flex h-10 w-full items-center justify-center rounded-lg transition-all duration-200',
                        visibleItems.some(item => isActive(item.path))
                          ? 'bg-[var(--sidebar-primary)]/10 text-[var(--sidebar-primary)]'
                          : 'text-muted-foreground hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]'
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
                            isActive(item.path) ? 'text-[var(--sidebar-primary)]' : 'text-muted-foreground'
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
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-[var(--sidebar-foreground)]"
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
                            'group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                            active
                              ? 'bg-[var(--sidebar-primary)]/10 text-[var(--sidebar-primary)]'
                              : 'text-muted-foreground hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon
                              className={cn(
                                'h-4 w-4 transition-colors',
                                active ? 'text-[var(--sidebar-primary)]' : 'text-muted-foreground group-hover:text-foreground'
                              )}
                            />
                            <span>{item.label}</span>
                          </div>
                          <button
                            onClick={(e) => toggleFavorite(item.path, e)}
                            className={cn(
                              'opacity-0 transition-opacity group-hover:opacity-100 p-1 rounded hover:bg-[var(--sidebar-accent)]',
                              favorites.includes(item.path) && 'opacity-100'
                            )}
                          >
                            <Star
                              className={cn(
                                'h-3.5 w-3.5',
                                favorites.includes(item.path)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-muted-foreground'
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
      <div className="border-t border-[var(--sidebar-border)] p-3">
        {isCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-full text-muted-foreground hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"
                aria-label="Expand sidebar"
                onClick={() => setIsCollapsed(false)}
              >
                <PanelLeftOpen data-testid="sidebar-expand-icon" className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        ) : (
          <div className="rounded-xl border border-[var(--sidebar-border)] bg-[var(--sidebar-accent)]/50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--sidebar-primary)]/10">
                <Clock className="h-4 w-4 text-[var(--sidebar-primary)]" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-[var(--sidebar-foreground)]">Last sync</p>
                <p data-testid="last-sync-value" className="text-[10px] text-muted-foreground">{lastSyncLabel}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

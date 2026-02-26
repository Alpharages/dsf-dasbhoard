/**
 * Improved Sidebar Component
 * Features: Collapsible groups, favorites, recent items, icon-only mode
 */

import { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { canAccess } from '@/utils/roleHelpers';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Settings,
  CheckCircle,
  DollarSign,
  Gauge,
  Building,
  Brain,
  UserPlus,
  Users,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Activity,
  Bell,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  Pin,
  PanelLeft,
  BarChart3,
  Inbox,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Navigation groups with hierarchy
const navigationGroups = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/', shortcut: 'G D' },
      { icon: Activity, label: 'Executions', path: '/executions', shortcut: 'G E' },
    ],
  },
  {
    id: 'projects',
    label: 'Projects & Work',
    icon: Briefcase,
    items: [
      { icon: Briefcase, label: 'Projects', path: '/projects/sync', shortcut: 'G P' },
      { icon: CheckCircle, label: 'Decisions', path: '/decisions', shortcut: 'G N' },
      { icon: Inbox, label: 'PM Approvals', path: '/approvals', roles: ['PM', 'TL', 'ADMIN', 'MANAGER'] },
      { icon: ShieldCheck, label: 'QA Review', path: '/qa-review/dashboard', roles: ['QA', 'TL', 'ADMIN', 'MANAGER'] },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    items: [
      { icon: Gauge, label: 'Capacity Monitor', path: '/capacity-monitor' },
      { icon: DollarSign, label: 'Financial Metrics', path: '/financial-metrics', roles: ['MANAGER', 'ADMIN'] },
      { icon: BarChart3, label: 'Cost Analysis', path: '/cost' },
    ],
  },
  {
    id: 'architecture',
    label: 'Architecture',
    icon: Building,
    items: [
      { icon: Building, label: 'Review Queue', path: '/architecture-review/queue', roles: ['TL', 'ADMIN'] },
      { icon: BarChart3, label: 'Metrics & Insights', path: '/architecture-review/metrics', roles: ['TL', 'ADMIN'] },
      { icon: Settings, label: 'Constraints', path: '/architecture-review/constraints', roles: ['TL', 'ADMIN'] },
      { icon: Brain, label: 'AI Capabilities', path: '/architecture/capabilities' },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: AlertTriangle,
    items: [
      { icon: ShieldAlert, label: 'Audit Logs', path: '/audit-logs', roles: ['QA', 'TL', 'ADMIN', 'MANAGER'] },
      { icon: Lock, label: 'Resource Manager', path: '/resource-manager', roles: ['TL', 'ADMIN', 'MANAGER'] },
      { icon: Activity, label: 'Observability', path: '/observability', roles: ['PM', 'TL', 'QA', 'MANAGER', 'ADMIN', 'OPERATOR'] },
      { icon: AlertTriangle, label: 'Production Errors', path: '/production-errors' },
      { icon: MessageSquare, label: 'Conversations', path: '/conversations' },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: Users,
    items: [
      { icon: UserPlus, label: 'Invitations', path: '/admin/invitations', roles: ['MANAGER', 'ADMIN'] },
      { icon: Users, label: 'Users', path: '/admin/users', roles: ['ADMIN'] },
      { icon: Bell, label: 'Notifications', path: '/notifications/preferences' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  
  // State for collapsible features
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['overview', 'projects']);
  const [favorites, setFavorites] = useState<string[]>(['/']);

  // Auto-expand group when child route is active
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Find all groups that should be expanded based on current path
    const groupsToExpand = navigationGroups
      .filter(group => 
        group.items.some(item => {
          if (item.path === '/') {
            return currentPath === '/';
          }
          return currentPath.startsWith(item.path);
        })
      )
      .map(group => group.id);
    
    // Only update if there are new groups to expand
    setExpandedGroups(prev => {
      const newGroups = groupsToExpand.filter(id => !prev.includes(id));
      if (newGroups.length > 0) {
        return [...prev, ...newGroups];
      }
      return prev;
    });
  }, [location.pathname]);

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Toggle favorite
  const toggleFavorite = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev =>
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  // Check if item is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Filter items based on user role
  const getVisibleItems = (items: any[]) => {
    return items.filter(item => {
      if (!item.roles) return true;
      return item.roles.some((role: string) => user?.role && canAccess(user.role, role));
    });
  };

  // Get all visible navigation items for favorites
  const allVisibleItems = useMemo(() => {
    const items: { path: string; label: string; icon: any }[] = [];
    navigationGroups.forEach(group => {
      group.items.forEach(item => {
        if (!item.roles || (user?.role && item.roles.some((role: string) => canAccess(user.role, role)))) {
          items.push({ path: item.path, label: item.label, icon: item.icon });
        }
      });
    });
    return items;
  }, [user?.role]);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex h-full w-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out',
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
                <span className="whitespace-nowrap text-[10px] font-medium text-sidebar-foreground/60">
                  Dark Software Factory
                </span>
              </div>
            )}
          </Link>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setIsCollapsed(true)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Favorites Section - Only show when not collapsed */}
        {!isCollapsed && favorites.length > 0 && (
          <div className="border-b border-sidebar-border px-4 py-3">
            <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50">
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
                  <Tooltip key={group.id}>
                    <TooltipTrigger asChild>
                      <button
                        className={cn(
                          'flex h-10 w-full items-center justify-center rounded-lg transition-colors',
                          visibleItems.some(item => isActive(item.path))
                            ? 'bg-sidebar-primary/10 text-sidebar-primary'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
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
                              isActive(item.path) ? 'text-sidebar-primary' : 'text-muted-foreground'
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
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider text-sidebar-foreground/50 transition-colors hover:text-sidebar-foreground/80"
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
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Bottom Section */}
        <div className="border-t border-sidebar-border p-3">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-full text-sidebar-foreground/50 hover:text-sidebar-foreground"
                  onClick={() => setIsCollapsed(false)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          ) : (
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
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

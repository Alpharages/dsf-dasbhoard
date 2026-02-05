/**
 * Mobile Sidebar Drawer
 * Sheet-based sidebar for mobile devices
 */

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { canAccess } from '@/utils/roleHelpers';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  AlertTriangle,
  Activity,
  Bell,
  BarChart3,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navigationGroups = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
      { icon: Activity, label: 'Executions', path: '/executions' },
    ],
  },
  {
    id: 'projects',
    label: 'Projects & Work',
    items: [
      { icon: Briefcase, label: 'Projects', path: '/projects/sync' },
      { icon: CheckCircle, label: 'Decisions', path: '/decisions' },
      { icon: ShieldCheck, label: 'QA Review', path: '/qa-review/dashboard', roles: ['QA', 'TL', 'ADMIN', 'MANAGER'] },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    items: [
      { icon: Gauge, label: 'Capacity', path: '/capacity-monitor' },
      { icon: DollarSign, label: 'Financial', path: '/financial-metrics', roles: ['MANAGER', 'ADMIN'] },
      { icon: BarChart3, label: 'Cost Analysis', path: '/cost' },
    ],
  },
  {
    id: 'architecture',
    label: 'Architecture',
    items: [
      { icon: Building, label: 'Review Queue', path: '/architecture-review/queue', roles: ['TL', 'ADMIN'] },
      { icon: BarChart3, label: 'Metrics', path: '/architecture-review/metrics', roles: ['TL', 'ADMIN'] },
      { icon: Settings, label: 'Constraints', path: '/architecture-review/constraints', roles: ['TL', 'ADMIN'] },
      { icon: Brain, label: 'AI Capabilities', path: '/architecture/capabilities' },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { icon: AlertTriangle, label: 'Production Errors', path: '/production-errors' },
      { icon: MessageSquare, label: 'Conversations', path: '/conversations' },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    items: [
      { icon: UserPlus, label: 'Invitations', path: '/admin/invitations', roles: ['MANAGER', 'ADMIN'] },
      { icon: Users, label: 'Users', path: '/admin/users', roles: ['ADMIN'] },
      { icon: Bell, label: 'Notifications', path: '/notifications/preferences' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ],
  },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getVisibleItems = (items: any[]) => {
    return items.filter(item => {
      if (!item.roles) return true;
      return item.roles.some((role: string) => user?.role && canAccess(user.role, role));
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-10 w-10 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] bg-slate-950 border-slate-800 p-0">
        <SheetHeader className="p-6 border-b border-slate-800">
          <SheetTitle className="flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold">DSF</span>
              <span className="text-[10px] font-medium text-slate-500">
                Dark Software Factory
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="p-4 space-y-6">
            {navigationGroups.map((group) => {
              const visibleItems = getVisibleItems(group.items);
              if (visibleItems.length === 0) return null;

              return (
                <div key={group.id}>
                  <h3 className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {group.label}
                  </h3>
                  <div className="space-y-1">
                    {visibleItems.map((item) => {
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                            active
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                          )}
                        >
                          <item.icon className={cn('h-5 w-5', active ? 'text-blue-500' : 'text-slate-500')} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

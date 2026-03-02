/**
 * Mobile Sidebar Drawer
 * Sheet-based sidebar for mobile devices (<768px).
 * Tablet (768-1023px) uses the icon Sidebar instead (see Sidebar.tsx + App.tsx).
 */

import { useState, type ReactElement } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, Menu } from 'lucide-react';

import { useAuth } from '@/contexts';
import { canAccess } from '@/utils/roleHelpers';
import { cn } from '@/lib/utils';
import { navigationGroups, isNavItemActive, type NavigationItem } from '@/config/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MobileSidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactElement;
}

export function MobileSidebar({ open, onOpenChange, trigger }: MobileSidebarProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const getVisibleItems = (items: NavigationItem[]) => {
    return items.filter((item) => {
      if (!item.roles) return true;
      return item.roles.some((role: string) => user?.role && canAccess(user.role, role));
    });
  };

  const triggerElement = trigger ?? (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden h-10 w-10 text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Open menu</span>
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetTrigger asChild>{triggerElement}</SheetTrigger>
      {/* flex flex-col lets ScrollArea fill remaining height without a magic pixel offset */}
      <SheetContent side="left" className="w-[300px] bg-sidebar border-sidebar-border p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-sidebar-border shrink-0">
          <SheetTitle className="flex items-center gap-3 text-sidebar-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold">DSF</span>
              <span className="text-[10px] font-medium text-sidebar-foreground/50">
                Dark Software Factory
              </span>
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">Main application navigation menu</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {navigationGroups.map((group) => {
              const visibleItems = getVisibleItems(group.items);
              if (visibleItems.length === 0) return null;

              return (
                <div key={group.id}>
                  <h3 className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-sidebar-foreground/50">
                    {group.label}
                  </h3>
                  <div className="space-y-1">
                    {visibleItems.map((item) => {
                      const active = isNavItemActive(item.path, location.pathname);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                            active
                              ? 'bg-sidebar-primary/10 text-sidebar-primary'
                              : 'text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent'
                          )}
                        >
                          <item.icon className={cn('h-5 w-5', active ? 'text-sidebar-primary' : 'text-sidebar-foreground/50')} />
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

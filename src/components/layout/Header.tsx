/**
 * Enhanced Header Component
 * Premium design with glassmorphism and modern UI
 */

import { type FC, useState } from 'react';
import { Search, User, LogOut, Settings, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { ThemeToggleCompact } from '@/components/improved/ThemeToggle';
import { useAuth } from '@/contexts';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MobileSidebar } from './MobileSidebar';

export const Header: FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-16 border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30 shrink-0"
    >
      {/* Left: Mobile Menu + Search */}
      <div className="flex items-center gap-4 flex-1">
        <MobileSidebar
          open={mobileSidebarOpen}
          onOpenChange={setMobileSidebarOpen}
          trigger={(
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-[var(--surface-1)]"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          )}
        />

        <div className="relative w-full max-w-md group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search projects, clients, tickets..."
            className="w-full bg-[var(--surface-1)] border border-[var(--card-border)] rounded-xl py-2.5 pl-10 pr-12 text-sm text-foreground 
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 
                       transition-all placeholder:text-muted-foreground"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:block 
                          px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground 
                          bg-[var(--surface-2)] border border-[var(--card-border)] rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggleCompact />

        {/* Notifications */}
        <NotificationCenter />

        <div className="h-6 w-px bg-[var(--border)] mx-1" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-[var(--surface-1)] transition-colors border border-transparent hover:border-[var(--card-border)]">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">{user?.fullName || 'User'}</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {user?.role || 'User'}
                </p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center border-2 border-[var(--card-border)] shadow-lg">
                <User className="w-4 h-4 text-white" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-56 border-[var(--card-border)] bg-[var(--popover)]">
            <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
              <div className="text-sm font-semibold text-foreground">
                {user?.fullName}
              </div>
              <div className="text-xs text-muted-foreground">
                {user?.email}
              </div>
            </div>
            <DropdownMenuItem
              onClick={() => navigate('/profile')}
              className="text-foreground focus:bg-[var(--surface-1)] focus:text-foreground cursor-pointer"
            >
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/settings')}
              className="text-foreground focus:bg-[var(--surface-1)] focus:text-foreground cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--border)]" />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
};

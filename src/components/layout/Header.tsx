/**
 * Enhanced Header Component
 * Features: Search, notifications, user menu, theme toggle
 */

import { Search, User, LogOut, Settings } from 'lucide-react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { ThemeToggleCompact } from '@/components/improved/ThemeToggle';
import { MobileSidebar } from './MobileSidebar';
import { useAuth } from '@/contexts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30 shrink-0"
    >
      {/* Left: Mobile Menu + Search */}
      <div className="flex items-center gap-4 flex-1">
        <MobileSidebar />
        <div className="relative w-full max-w-md group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search projects, clients, tickets..."
            className="w-full bg-muted/50 border border-input rounded-xl py-2.5 pl-10 pr-12 text-sm text-foreground 
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 
                       transition-all shadow-inner placeholder:text-muted-foreground"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:block 
                          px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground 
                          bg-muted border border-border rounded">
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

        <div className="h-6 w-px bg-border mx-2" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{user?.fullName || 'User'}</p>
                <p className="text-xs text-muted-foreground font-mono tracking-tighter uppercase">
                  {user?.role || 'User'}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-border shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-border bg-card">
            <div className="px-2 py-1.5 text-sm font-semibold text-foreground">
              {user?.fullName}
            </div>
            <div className="px-2 pb-2 text-xs text-muted-foreground">
              {user?.email}
            </div>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="text-foreground focus:bg-muted focus:text-foreground">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={logout}
              className="text-rose-400 focus:bg-rose-500/10 focus:text-rose-400"
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

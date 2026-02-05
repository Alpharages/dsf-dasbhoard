/**
 * Enhanced Header Component
 * Features: Search, notifications, user menu, theme toggle
 */

import { Search, User, LogOut, Settings, Menu } from 'lucide-react';
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
      className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30"
    >
      {/* Left: Mobile Menu + Search */}
      <div className="flex items-center gap-4 flex-1">
        <MobileSidebar />
        <div className="relative w-full max-w-md group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="Search projects, clients, tickets..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-12 text-sm text-slate-200 
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
                       transition-all shadow-inner placeholder:text-slate-500"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:block 
                          px-1.5 py-0.5 text-[10px] font-medium text-slate-500 
                          bg-slate-800 border border-slate-700 rounded">
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

        <div className="h-6 w-px bg-slate-700 mx-2" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-800/50 transition-colors">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-200">{user?.fullName || 'User'}</p>
                <p className="text-xs text-slate-500 font-mono tracking-tighter uppercase">
                  {user?.role || 'User'}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-slate-700 shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-slate-800 bg-slate-900">
            <div className="px-2 py-1.5 text-sm font-semibold text-slate-200">
              {user?.fullName}
            </div>
            <div className="px-2 pb-2 text-xs text-slate-500">
              {user?.email}
            </div>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem className="text-slate-300 focus:bg-slate-800 focus:text-slate-200">
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

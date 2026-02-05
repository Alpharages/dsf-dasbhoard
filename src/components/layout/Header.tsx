import { Search, User } from 'lucide-react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export const Header: React.FC = () => {
    return (
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-96 max-w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search projects, client..."
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <NotificationCenter />
                <div className="h-8 w-px bg-slate-700 mx-2"></div>
                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-slate-200">Khakan Ali</p>
                        <p className="text-xs text-slate-500 font-mono tracking-tighter uppercase">Project Manager</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-slate-700 shadow-lg">
                        <User className="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>
        </header>
    );
};

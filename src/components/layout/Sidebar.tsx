import {
    BarChart3,
    LayoutDashboard,
    Briefcase,
    MessageSquare,
    Clock,
    ExternalLink,
    Settings,
    CheckCircle,
    DollarSign,
    Gauge,
    Building,
    SettingsIcon,
    Brain
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Briefcase, label: 'Projects', path: '/projects' },
    { icon: CheckCircle, label: 'Decisions', path: '/decisions' },
    { icon: MessageSquare, label: 'Conversations', path: '/conversations' },
    { icon: Clock, label: 'Activity', path: '/activity' },
    { icon: BarChart3, label: 'Cost Analysis', path: '/cost' },
    { icon: Gauge, label: 'Capacity Monitor', path: '/capacity-monitor' },
    { icon: Building, label: 'Architecture Review', path: '/architecture-review/queue' },
    { icon: SettingsIcon, label: 'Architecture Constraints', path: '/architecture-review/constraints' },
    { icon: Brain, label: 'AI Capabilities', path: '/architecture/capabilities' },
    { icon: DollarSign, label: 'Financial Metrics', path: '/financial-metrics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar: React.FC = () => {
    const location = useLocation();

    return (
        <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col fixed inset-y-0 z-40">
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
                    <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    AetherFlow
                </span>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-2">
                {navItems.map((item) => {
                    // RBAC: Only show Financial Metrics to MANAGER or ADMIN
                    if (item.path === '/financial-metrics') {
                        const userRole = localStorage.getItem('userRole') || 'USER';
                        if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
                            return null;
                        }
                    }

                    // RBAC: Only show Architecture Review to TL or ADMIN
                    if (item.path === '/architecture-review/queue') {
                        const userRole = localStorage.getItem('userRole') || 'USER';
                        if (userRole !== 'TL' && userRole !== 'ADMIN') {
                            return null;
                        }
                    }

                    // RBAC: Only show Architecture Constraints to TL or ADMIN
                    if (item.path === '/architecture-review/constraints') {
                        const userRole = localStorage.getItem('userRole') || 'USER';
                        if (userRole !== 'TL' && userRole !== 'ADMIN') {
                            return null;
                        }
                    }

                    // AI Capabilities is visible to all authenticated users
                    // PM gets read-only view, TL/ADMIN can edit

                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${isActive
                                ? 'bg-blue-600/10 text-blue-400'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'group-hover:text-slate-300'}`} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all"></div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Support</p>
                    <a href="#" className="flex items-center justify-between text-sm text-slate-300 hover:text-blue-400 transition-colors">
                        Documentation
                        <ExternalLink className="w-3 h-3" />
                    </a>
                    <button className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg text-xs font-medium transition-colors border border-slate-700">
                        System Settings
                    </button>
                </div>
            </div>
        </aside>
    );
};

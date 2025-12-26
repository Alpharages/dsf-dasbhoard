import { Outlet, NavLink, Navigate, useLocation } from 'react-router-dom';
import {
    Trash2,
    Activity,
    Share2,
    GitMerge,
    DollarSign,
    ShieldAlert,
    HeartPulse
} from 'lucide-react';

const panels = [
    { id: 'cleanup', label: 'Cleanup', icon: Trash2 },
    { id: 'self-healing', label: 'Self-Healing', icon: Activity },
    { id: 'dependency', label: 'Dependencies', icon: Share2 },
    { id: 'auto-merge', label: 'Auto-Merge', icon: GitMerge },
    { id: 'cost', label: 'Cost & Models', icon: DollarSign },
    { id: 'audit', label: 'Audit & Safety', icon: ShieldAlert },
    { id: 'health', label: 'Health & Rollback', icon: HeartPulse },
];

export const SettingsLayout = () => {
    const location = useLocation();

    // Redirect /settings to /settings/cleanup
    if (location.pathname === '/settings') {
        return <Navigate to="/settings/cleanup" replace />;
    }

    return (
        <div className="grid grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
            {/* Settings Navigation */}
            <div className="col-span-3 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 h-full overflow-y-auto">
                <h2 className="text-lg font-bold text-white mb-6 px-4">System Configuration</h2>
                <nav className="space-y-1">
                    {panels.map((panel) => (
                        <NavLink
                            key={panel.id}
                            to={`/settings/${panel.id}`}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                }`
                            }
                        >
                            <panel.icon className="w-4 h-4" />
                            {panel.label}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            <div className="col-span-9 bg-slate-900 border border-slate-800 rounded-2xl p-8 h-full overflow-y-auto">
                <Outlet />
            </div>
        </div>
    );
};

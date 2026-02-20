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
        <div className="grid grid-cols-12 gap-6">
            {/* Settings Navigation */}
            <div className="col-span-12 lg:col-span-3">
                <div className="bg-muted/30 border border-border rounded-2xl p-4">
                    <h2 className="text-lg font-semibold text-foreground mb-4 px-2">System Configuration</h2>
                    <nav className="space-y-1">
                        {panels.map((panel) => (
                            <NavLink
                                key={panel.id}
                                to={`/settings/${panel.id}`}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`
                                }
                            >
                                <panel.icon className="w-4 h-4" />
                                {panel.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content Area */}
            <div className="col-span-12 lg:col-span-9">
                <div className="bg-card border border-border rounded-2xl p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

import { Outlet, NavLink, Navigate, useLocation, useParams } from 'react-router-dom';
import {
    Trash2,
    Activity,
    Share2,
    GitMerge,
    DollarSign,
    ShieldAlert,
    HeartPulse,
    Blocks,
    Settings,
    AppWindow
} from 'lucide-react';

const panels = [
    { id: 'cleanup', label: 'Cleanup', icon: Trash2 },
    { id: 'self-healing', label: 'Self-Healing', icon: Activity },
    { id: 'dependency', label: 'Dependencies', icon: Share2 },
    { id: 'auto-merge', label: 'Auto-Merge', icon: GitMerge },
    { id: 'cost', label: 'Cost & Models', icon: DollarSign },
    { id: 'audit', label: 'Audit & Safety', icon: ShieldAlert },
    { id: 'health', label: 'Health & Rollback', icon: HeartPulse },
    { id: 'integrations', label: 'Third-Party Integrations', icon: Blocks },
    { id: 'connected-apps', label: 'Connected Apps', icon: AppWindow },
];

const projectPanels = [
    { id: 'integrations', label: 'PM Tool Integration', icon: Blocks },
    { id: 'general', label: 'General Settings', icon: Settings },
];

export const SettingsLayout = () => {
    const { id: projectId } = useParams<{ id: string }>();
    const location = useLocation();

    const currentPanels = projectId ? projectPanels : panels;
    const basePath = projectId ? `/projects/${projectId}/settings` : '/settings';
    const headerTitle = projectId ? 'Project Configuration' : 'System Configuration';

    // Redirect /settings to /settings/cleanup or /projects/:id/settings to /projects/:id/settings/integrations
    if (location.pathname === basePath) {
        return <Navigate to={`${basePath}/${currentPanels[0].id}`} replace />;
    }

    return (
        <div className="grid grid-cols-12 gap-4">
            {/* Settings Navigation */}
            <div className="col-span-12 lg:col-span-3">
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-foreground mb-4 px-2">{headerTitle}</h2>
                    <nav className="space-y-1">
                        {currentPanels.map((panel) => (
                            <NavLink
                                key={panel.id}
                                to={`${basePath}/${panel.id}`}
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
                <div className="bg-card border border-border rounded-lg p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

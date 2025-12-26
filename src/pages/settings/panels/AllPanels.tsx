import { ConfigInput } from '../../../components/settings/ConfigInput';
import { useSystemConfig } from '../../../hooks/queries/useSystemConfig';
import { toast } from 'react-hot-toast';
import { Trash2, Activity, Share2, GitMerge, DollarSign, ShieldAlert, HeartPulse } from 'lucide-react';

// Shared logic holder
const usePanelLogic = () => {
    const { getValue, updateConfig, isUpdating } = useSystemConfig();

    const handleUpdate = async (key: string, value: string) => {
        try {
            await updateConfig({ key, value });
            toast.success('Configuration saved');
        } catch (error) {
            toast.error('Failed to save configuration');
        }
    };

    return { getValue, handleUpdate, isUpdating };
};

// --- PANEL 1: CLEANUP ---
export const CleanupPanel = () => {
    const { getValue, handleUpdate, isUpdating } = usePanelLogic();
    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500"><Trash2 className="w-6 h-6" /></div>
                <div><h1 className="text-2xl font-bold text-white">Cleanup Settings</h1><p className="text-slate-500">Manage data retention policies.</p></div>
            </div>
            <div className="space-y-6">
                <ConfigInput
                    label="Retention Period (Days)"
                    description="Days to keep artifacts."
                    value={getValue('cleanup.retention_period', '30')}
                    type="number"
                    onSave={(val) => handleUpdate('cleanup.retention_period', val)}
                    isSaving={isUpdating}
                />
                <ConfigInput
                    label="Emergency Cleanup Threshold (%)"
                    description="Disk usage % to trigger cleanup."
                    value={getValue('cleanup.emergency_threshold', '85')}
                    type="number"
                    onSave={(val) => handleUpdate('cleanup.emergency_threshold', val)}
                    isSaving={isUpdating}
                />
                <ConfigInput
                    label="Archive Directory Path"
                    description="Absolute path for archives."
                    value={getValue('cleanup.archive_path', '/tmp/archives')}
                    onSave={(val) => handleUpdate('cleanup.archive_path', val)}
                    isSaving={isUpdating}
                />
            </div>
        </div>
    );
};

// --- PANEL 2: SELF HEALING ---
export const SelfHealingPanel = () => {
    const { getValue, handleUpdate, isUpdating } = usePanelLogic();
    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><Activity className="w-6 h-6" /></div>
                <div><h1 className="text-2xl font-bold text-white">Self-Healing Settings</h1><p className="text-slate-500">Configure auto-recovery behavior.</p></div>
            </div>
            <div className="space-y-6">
                <ConfigInput
                    label="Max Fix Attempts"
                    value={getValue('self_healing.max_attempts', '2')}
                    type="number"
                    onSave={(val) => handleUpdate('self_healing.max_attempts', val)}
                    isSaving={isUpdating}
                />
                <ConfigInput
                    label="Progress Validation"
                    description="Enable AI progress validation steps."
                    value={getValue('self_healing.validation_enabled', 'true')}
                    type="toggle"
                    onSave={(val) => handleUpdate('self_healing.validation_enabled', val)}
                    isSaving={isUpdating}
                />
            </div>
        </div>
    );
};

// --- PANEL 3: DEPENDENCY ---
export const DependencyPanel = () => {
    const { getValue, handleUpdate, isUpdating } = usePanelLogic();
    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Share2 className="w-6 h-6" /></div>
                <div><h1 className="text-2xl font-bold text-white">Dependency Management</h1><p className="text-slate-500">Circular dependency and locking settings.</p></div>
            </div>
            <div className="space-y-6">
                <ConfigInput
                    label="File Lock Timeout (Minutes)"
                    value={getValue('dependency.lock_timeout', '15')}
                    type="number"
                    onSave={(val) => handleUpdate('dependency.lock_timeout', val)}
                    isSaving={isUpdating}
                />
                <ConfigInput
                    label="Strict Circular Detection"
                    description="Block circular dependencies aggressively."
                    value={getValue('dependency.strict_circular', 'true')}
                    type="toggle"
                    onSave={(val) => handleUpdate('dependency.strict_circular', val)}
                    isSaving={isUpdating}
                />
            </div>
        </div>
    );
};

// --- PANEL 4: AUTO MERGE ---
export const AutoMergePanel = () => {
    const { getValue, handleUpdate, isUpdating } = usePanelLogic();
    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500"><GitMerge className="w-6 h-6" /></div>
                <div><h1 className="text-2xl font-bold text-white">Auto-Merge & PRs</h1><p className="text-slate-500">Pull request automation policies.</p></div>
            </div>
            <div className="space-y-6">
                <ConfigInput
                    label="Auto-Merge Risk Threshold"
                    description="Risk level allowed for auto-merge (LOW, MEDIUM)."
                    value={getValue('pr.auto_merge_threshold', 'LOW')}
                    onSave={(val) => handleUpdate('pr.auto_merge_threshold', val)}
                    isSaving={isUpdating}
                />
                <ConfigInput
                    label="Require Code Owner Review"
                    value={getValue('pr.require_owner', 'true')}
                    type="toggle"
                    onSave={(val) => handleUpdate('pr.require_owner', val)}
                    isSaving={isUpdating}
                />
            </div>
        </div>
    );
};

// --- PANEL 5: COST ---
export const CostPanel = () => {
    const { getValue, handleUpdate, isUpdating } = usePanelLogic();
    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500"><DollarSign className="w-6 h-6" /></div>
                <div><h1 className="text-2xl font-bold text-white">Cost & AI Models</h1><p className="text-slate-500">Budget caps and model selection.</p></div>
            </div>
            <div className="space-y-6">
                <ConfigInput
                    label="Monthly Budget Cap ($)"
                    value={getValue('cost.budget_cap', '1000')}
                    type="number"
                    onSave={(val) => handleUpdate('cost.budget_cap', val)}
                    isSaving={isUpdating}
                />
                <ConfigInput
                    label="Model Override"
                    description="Force specific model (e.g. gpt-4)."
                    value={getValue('cost.model_override', '')}
                    onSave={(val) => handleUpdate('cost.model_override', val)}
                    isSaving={isUpdating}
                />
            </div>
        </div>
    );
};

// --- PANEL 6: AUDIT ---
export const AuditPanel = () => {
    const { getValue, handleUpdate, isUpdating } = usePanelLogic();
    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><ShieldAlert className="w-6 h-6" /></div>
                <div><h1 className="text-2xl font-bold text-white">Audit & Safety</h1><p className="text-slate-500">Compliance and safety thresholds.</p></div>
            </div>
            <div className="space-y-6">
                <ConfigInput
                    label="Audit Log Retention (Days)"
                    value={getValue('audit.retention_days', '90')}
                    type="number"
                    onSave={(val) => handleUpdate('audit.retention_days', val)}
                    isSaving={isUpdating}
                />
                <ConfigInput
                    label="Min Confidence Score"
                    description="Minimum confidence for auto-approval (0-1)."
                    value={getValue('audit.min_confidence', '0.8')}
                    type="number"
                    onSave={(val) => handleUpdate('audit.min_confidence', val)}
                    isSaving={isUpdating}
                />
            </div>
        </div>
    );
};

// --- PANEL 7: HEALTH ---
export const HealthPanel = () => {
    const { getValue, handleUpdate, isUpdating } = usePanelLogic();
    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-red-500/10 rounded-xl text-red-500"><HeartPulse className="w-6 h-6" /></div>
                <div><h1 className="text-2xl font-bold text-white">Health & Rollback</h1><p className="text-slate-500">Deployment health monitoring.</p></div>
            </div>
            <div className="space-y-6">
                <ConfigInput
                    label="Post-Deploy Monitor Window (Min)"
                    value={getValue('health.monitor_window', '15')}
                    type="number"
                    onSave={(val) => handleUpdate('health.monitor_window', val)}
                    isSaving={isUpdating}
                />
                <ConfigInput
                    label="Error Rate Rollback (%)"
                    value={getValue('health.rollback_error_rate', '1')}
                    type="number"
                    onSave={(val) => handleUpdate('health.rollback_error_rate', val)}
                    isSaving={isUpdating}
                />
            </div>
        </div>
    );
};

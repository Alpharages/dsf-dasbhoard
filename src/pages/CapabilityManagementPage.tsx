import React, { useState } from 'react';
import { Plus, Brain, AlertCircle, Shield, Sparkles, RefreshCw } from 'lucide-react';
import { CapabilityTrendChart } from '../components/capabilities/CapabilityTrendChart';
import { TaskTypeSuccessGrid } from '../components/capabilities/TaskTypeSuccessGrid';
import { LimitationListTable } from '../components/capabilities/LimitationListTable';
import { LimitationFormModal } from '../components/capabilities/LimitationFormModal';
import { PublicLimitationsView } from '../components/capabilities/PublicLimitationsView';
import { CapabilitySummaryCards } from '../components/capabilities/CapabilitySummaryCards';
import { CapabilityEmptyState } from '../components/capabilities/CapabilityEmptyState';
import { CapabilitySkeleton } from '../components/capabilities/CapabilitySkeleton';
import { useCapabilityDashboard, useCreateLimitation, useUpdateLimitation } from '../hooks/useCapabilities';
import type { Limitation, LimitationFormData } from '../types/capabilities';

// Mock auth check - in real app, use auth context
const getUserRole = (): 'PM' | 'TL' | 'ADMIN' => {
    // For demo, check localStorage or return default
    return (localStorage.getItem('userRole') as 'PM' | 'TL' | 'ADMIN') || 'TL';
};

export const CapabilityManagementPage: React.FC = () => {
    const userRole = getUserRole();
    const canEdit = userRole === 'TL' || userRole === 'ADMIN';

    const [showModal, setShowModal] = useState(false);
    const [editingLimitation, setEditingLimitation] = useState<Limitation | undefined>();

    const { data, isLoading, error, refetch } = useCapabilityDashboard();
    const createMutation = useCreateLimitation();
    const updateMutation = useUpdateLimitation();

    const handleAddLimitation = () => {
        setEditingLimitation(undefined);
        setShowModal(true);
    };

    const handleEditLimitation = (limitation: Limitation) => {
        setEditingLimitation(limitation);
        setShowModal(true);
    };

    const handleSaveLimitation = async (formData: LimitationFormData) => {
        try {
            if (editingLimitation) {
                // Update existing
                await updateMutation.mutateAsync({
                    taskType: formData.taskType,
                    data: {
                        knownIssues: formData.knownIssues,
                        workaround: formData.workaround,
                        isDisabled: formData.isDisabled,
                    }
                });
            } else {
                // Create new
                await createMutation.mutateAsync(formData);
            }
            setShowModal(false);
        } catch (err) {
            // Error handling is in the mutation hooks
        }
    };

    if (error) {
        return (
            <div className="p-6 max-w-[1600px] mx-auto">
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-6 flex items-center gap-3 text-rose-500">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">Failed to load capability data</p>
                        <p className="text-sm text-rose-400">Please refresh the page or contact support.</p>
                    </div>
                </div>
            </div>
        );
    }

    const hasCapabilities = data && data.capabilities.length > 0;
    const hasLimitations = data && data.topLimitations.length > 0;

    return (
        <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative p-3.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                            <Brain className="w-8 h-8 text-violet-400" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                                <Sparkles className="w-2.5 h-2.5 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
                                AI Capability Management
                            </h1>
                            <p className="text-[var(--color-text-secondary)] mt-0.5">
                                Monitor AI performance and manage known limitations
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => refetch()}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                                bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]
                                hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]
                                border border-[var(--color-border)] transition-all"
                            disabled={isLoading}
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        
                        {canEdit && (
                            <button
                                onClick={handleAddLimitation}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold 
                                    bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                                    hover:from-blue-600 hover:to-blue-700 
                                    transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30
                                    active:scale-[0.98]"
                            >
                                <Plus className="w-5 h-5" />
                                Add Limitation
                            </button>
                        )}
                    </div>
                </div>

                {/* Role indicator banner */}
                <div className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm w-fit
                    ${canEdit 
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                        : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                    }
                `}>
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">
                        {canEdit 
                            ? 'You have edit permissions (TL/ADMIN)' 
                            : 'Read-only view (PM role)'}
                    </span>
                </div>
            </div>

            {isLoading ? (
                <CapabilitySkeleton />
            ) : !hasCapabilities ? (
                <CapabilityEmptyState 
                    type="no-data" 
                    onAction={() => {}}
                    actionLabel="Start Processing Tasks"
                />
            ) : (
                <>
                    {/* Summary Cards */}
                    <section>
                        <CapabilitySummaryCards 
                            capabilities={data?.capabilities || []}
                            limitations={data?.topLimitations || []}
                        />
                    </section>

                    {/* Capability Metrics Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-6 rounded-full bg-violet-500" />
                            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Capability Metrics</h2>
                        </div>
                        <TaskTypeSuccessGrid capabilities={data?.capabilities || []} />
                        <CapabilityTrendChart capabilities={data?.capabilities || []} />
                    </section>

                    {/* Limitations Management Section */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
                                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                                    {canEdit ? 'Manage Known Limitations' : 'Known Limitations'}
                                </h2>
                            </div>
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                                {data?.topLimitations.length || 0} documented
                            </span>
                        </div>

                        {!hasLimitations ? (
                            <CapabilityEmptyState 
                                type="no-limitations"
                                onAction={canEdit ? handleAddLimitation : undefined}
                                actionLabel={canEdit ? 'Add First Limitation' : undefined}
                            />
                        ) : canEdit ? (
                            <LimitationListTable
                                limitations={data?.topLimitations || []}
                                onEdit={handleEditLimitation}
                                canEdit={canEdit}
                            />
                        ) : (
                            <PublicLimitationsView limitations={data?.topLimitations || []} />
                        )}
                    </section>
                </>
            )}

            {/* Modal */}
            {showModal && (
                <LimitationFormModal
                    limitation={editingLimitation}
                    onSave={handleSaveLimitation}
                    onClose={() => setShowModal(false)}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                />
            )}
        </div>
    );
};

import React, { useState } from 'react';
import { Plus, Brain, AlertCircle } from 'lucide-react';
import { CapabilityTrendChart } from '../components/capabilities/CapabilityTrendChart';
import { TaskTypeSuccessGrid } from '../components/capabilities/TaskTypeSuccessGrid';
import { LimitationListTable } from '../components/capabilities/LimitationListTable';
import { LimitationFormModal } from '../components/capabilities/LimitationFormModal';
import { PublicLimitationsView } from '../components/capabilities/PublicLimitationsView';
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

    const { data, isLoading, error } = useCapabilityDashboard();
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
            <div className="p-6">
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 flex items-center gap-3 text-rose-500">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">Failed to load capability data</p>
                        <p className="text-sm text-rose-400">Please refresh the page or contact support.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            {/* Header */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                            <Brain className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                AI Capability Management
                            </h1>
                            <p className="text-slate-400">
                                Monitor AI performance and manage known limitations
                            </p>
                        </div>
                    </div>

                    {canEdit && (
                        <button
                            onClick={handleAddLimitation}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                        >
                            <Plus className="w-5 h-5" />
                            Add Limitation
                        </button>
                    )}
                </div>

                {/* Role indicator */}
                <div className="text-sm text-slate-400">
                    {canEdit ? (
                        <span className="text-green-400">✓ You can edit limitations (TL/ADMIN)</span>
                    ) : (
                        <span className="text-yellow-400">📖 Read-only view (PM role)</span>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-slate-800/30 rounded-xl h-32 animate-pulse" />
                    ))}
                </div>
            ) : (
                <>
                    {/* Capability Metrics Section */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white">Capability Metrics</h2>
                        <TaskTypeSuccessGrid capabilities={data?.capabilities || []} />
                        <CapabilityTrendChart capabilities={data?.capabilities || []} />
                    </section>

                    {/* Limitations Management Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {canEdit ? 'Manage Known Limitations' : 'Known Limitations'}
                            </h2>
                            <span className="text-sm text-slate-400">
                                {data?.topLimitations.length || 0} documented
                            </span>
                        </div>

                        {canEdit ? (
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

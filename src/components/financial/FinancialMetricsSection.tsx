import React, { useState, useEffect } from 'react';
import { CostPerFeatureChart } from './CostPerFeatureChart';
import { RoiGaugeWidget } from './RoiGaugeWidget';
import { BudgetTrendChart } from './BudgetTrendChart';
import { ModelEfficiencyTable } from './ModelEfficiencyTable';
import { DollarSign, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface FinancialMetricsSectionProps {
    projectId?: string;
}

export const FinancialMetricsSection: React.FC<FinancialMetricsSectionProps> = ({ projectId }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selectedProject, setSelectedProject] = useState(projectId || '');
    const queryClient = useQueryClient();

    // Store last selected project in localStorage
    useEffect(() => {
        if (selectedProject) {
            localStorage.setItem('lastSelectedFinancialProject', selectedProject);
        }
    }, [selectedProject]);

    // Load last selected project on mount
    useEffect(() => {
        const savedProject = localStorage.getItem('lastSelectedFinancialProject');
        if (savedProject && !projectId) {
            setSelectedProject(savedProject);
        }
    }, [projectId]);

    // Check user role (MANAGER/ADMIN only)
    // TODO: Replace with actual auth context when available
    const userRole = localStorage.getItem('userRole') || 'PM';
    const hasAccess = ['MANAGER', 'ADMIN'].includes(userRole);

    if (!hasAccess) {
        return null; // Hide section for users without MANAGER/ADMIN role
    }

    if (!selectedProject) {
        // No project selected yet
        return (
            <div className="mb-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-500 text-center">
                    Select a project to view financial metrics
                </p>
            </div>
        );
    }

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['costPerFeature'] });
        queryClient.invalidateQueries({ queryKey: ['roi'] });
        queryClient.invalidateQueries({ queryKey: ['budgetTrends'] });
        queryClient.invalidateQueries({ queryKey: ['modelEfficiency'] });
    };

    return (
        <div className="mb-8">
            {/* Section header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
                    >
                        {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </button>
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-emerald-400" />
                        <h2 className="text-2xl font-bold text-white">Financial Metrics</h2>
                    </div>
                    <div className="text-xs text-slate-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
                        MANAGER/ADMIN
                    </div>
                </div>

                <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
                    title="Refresh all metrics"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span className="text-sm font-semibold">Refresh</span>
                </button>
            </div>

            {/* Widgets grid - hidden when collapsed */}
            {!isCollapsed && (
                <div className="space-y-6">
                    {/* Row 1: Cost Per Feature (full width) */}
                    <div>
                        <CostPerFeatureChart projectId={selectedProject} />
                    </div>

                    {/* Row 2: ROI + Budget Trends */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <RoiGaugeWidget projectId={selectedProject} period="month" />
                        </div>
                        <div className="lg:col-span-2">
                            <BudgetTrendChart projectId={selectedProject} />
                        </div>
                    </div>

                    {/* Row 3: Model Efficiency (full width) */}
                    <div>
                        <ModelEfficiencyTable projectId={selectedProject} />
                    </div>
                </div>
            )}
        </div>
    );
};

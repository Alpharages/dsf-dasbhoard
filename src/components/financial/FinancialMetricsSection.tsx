import React, { useState, useEffect } from 'react';
import { CostPerFeatureChart } from './CostPerFeatureChart';
import { RoiGaugeWidget } from './RoiGaugeWidget';
import { BudgetTrendChart } from './BudgetTrendChart';
import { ModelEfficiencyTable } from './ModelEfficiencyTable';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { canAccess } from '../../utils/roleHelpers';
import { motion } from 'framer-motion';

interface FinancialMetricsSectionProps {
    projectId?: string;
}

export const FinancialMetricsSection: React.FC<FinancialMetricsSectionProps> = ({ projectId }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const selectedProject = projectId || '';
    const queryClient = useQueryClient();
    const { user } = useAuth();

    useEffect(() => {
        if (selectedProject) {
            localStorage.setItem('lastSelectedFinancialProject', selectedProject);
        } else {
            localStorage.removeItem('lastSelectedFinancialProject');
        }
    }, [selectedProject]);

    // Guard: MANAGER/ADMIN only
    if (!canAccess(user?.role || 'VIEWER', 'MANAGER')) {
        return null;
    }

    if (!selectedProject) {
        return (
            <div className="bg-[var(--surface-1)] border border-[var(--card-border)] rounded-lg p-6">
                <p className="text-muted-foreground text-center">
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
        <div>
            {/* Toolbar with collapse and refresh */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-end gap-3 mb-4"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-2)] border border-[var(--card-border)] text-muted-foreground hover:text-foreground rounded-xl transition-colors"
                >
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    <span className="text-sm font-medium">{isCollapsed ? 'Expand' : 'Collapse'}</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-2)] border border-[var(--card-border)] text-muted-foreground hover:text-foreground rounded-xl transition-colors"
                    title="Refresh all metrics"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span className="text-sm font-semibold">Refresh</span>
                </motion.button>
            </motion.div>

            {/* Widgets grid - hidden when collapsed */}
            {!isCollapsed && (
                <div className="space-y-6">
                    {/* Row 1: Cost Per Feature (full width) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <CostPerFeatureChart projectId={selectedProject} />
                    </motion.div>

                    {/* Row 2: ROI + Budget Trends - Same height cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                        <motion.div 
                            className="lg:col-span-1 h-full"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <RoiGaugeWidget projectId={selectedProject} period="month" />
                        </motion.div>
                        <motion.div 
                            className="lg:col-span-2 h-full"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <BudgetTrendChart projectId={selectedProject} />
                        </motion.div>
                    </div>

                    {/* Row 3: Model Efficiency (full width) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <ModelEfficiencyTable projectId={selectedProject} />
                    </motion.div>
                </div>
            )}
        </div>
    );
};

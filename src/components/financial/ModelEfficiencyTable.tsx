import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financialApi } from '../../api/financialApi';
import { TrendingUp, Zap } from 'lucide-react';

interface ModelEfficiencyTableProps {
    projectId: string;
}

export const ModelEfficiencyTable: React.FC<ModelEfficiencyTableProps> = ({ projectId }) => {
    const [sortBy, setSortBy] = useState<'cost' | 'success' | 'time'>('cost');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const { data, isLoading, error } = useQuery({
        queryKey: ['modelEfficiency', projectId],
        queryFn: () => financialApi.getModelEfficiency({ projectId }),
        enabled: !!projectId,
    });

    if (isLoading) {
        return (
            <div className="bg-muted/50 border border-border rounded-2xl p-6 animate-pulse">
                <div className="h-64"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-muted/50 border border-border rounded-2xl p-6">
                <p className="text-muted-foreground text-center">Failed to load model efficiency data</p>
            </div>
        );
    }

    const handleSort = (column: typeof sortBy) => {
        if (sortBy === column) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDir('asc');
        }
    };

    const sortedModels = [...data.models].sort((a, b) => {
        let aVal: number, bVal: number;
        if (sortBy === 'cost') {
            aVal = parseFloat(a.costPerExecution);
            bVal = parseFloat(b.costPerExecution);
        } else if (sortBy === 'success') {
            aVal = a.successRate;
            bVal = b.successRate;
        } else {
            aVal = a.avgExecutionTimeSec;
            bVal = b.avgExecutionTimeSec;
        }
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

    const mostEfficient = data.recommendation.mostEfficient;

    return (
        <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Model Efficiency Analysis
                </h3>
            </div>

            {/* Recommendation chip */}
            {data.recommendation && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-blue-500">Optimization Opportunity</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {data.recommendation.reason}
                            </p>
                            <p className="text-xs text-emerald-500 mt-2 font-semibold">
                                💰 Potential Savings: {data.recommendation.potentialSavings}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Model</th>
                            <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Provider</th>
                            <th
                                className="text-right py-3 px-4 text-muted-foreground font-semibold cursor-pointer hover:text-foreground"
                                onClick={() => handleSort('cost')}
                            >
                                Cost/Exec {sortBy === 'cost' && (sortDir === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                                className="text-right py-3 px-4 text-muted-foreground font-semibold cursor-pointer hover:text-foreground"
                                onClick={() => handleSort('success')}
                            >
                                Success {sortBy === 'success' && (sortDir === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                                className="text-right py-3 px-4 text-muted-foreground font-semibold cursor-pointer hover:text-foreground"
                                onClick={() => handleSort('time')}
                            >
                                Avg Time {sortBy === 'time' && (sortDir === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="text-right py-3 px-4 text-muted-foreground font-semibold">Self-Heal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedModels.map((model) => {
                            const isRecommended = model.modelName === mostEfficient;
                            return (
                                <tr
                                    key={`${model.provider}-${model.modelName}`}
                                    className={`border-b border-border/50 ${isRecommended ? 'bg-emerald-500/5' : 'hover:bg-muted/50'
                                        }`}
                                >
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-mono text-xs ${isRecommended ? 'text-emerald-500 font-semibold' : 'text-foreground'}`}>
                                                {model.modelName}
                                            </span>
                                            {isRecommended && (
                                                <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full font-bold">
                                                    BEST
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-xs text-muted-foreground">{model.provider}</span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <span className="text-foreground font-semibold">${model.costPerExecution}</span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <span className={`font-semibold ${model.successRate > 90 ? 'text-emerald-500' :
                                            model.successRate > 80 ? 'text-yellow-500' : 'text-rose-500'
                                            }`}>
                                            {model.successRate.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <span className="text-muted-foreground">{model.avgExecutionTimeSec}s</span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <span className="text-muted-foreground">{model.selfHealingRate.toFixed(1)}%</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer stats */}
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                    {data.models.length} models analyzed • {data.models.reduce((sum, m) => sum + m.executionCount, 0)} total executions
                </span>
            </div>
        </div>
    );
};

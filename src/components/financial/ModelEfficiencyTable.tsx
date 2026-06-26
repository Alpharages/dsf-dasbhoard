import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { financialApi } from '../../api/financialApi';
import { Cpu, TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ModelEfficiencyDto } from '../../types/financial';

interface ModelEfficiencyTableProps {
    projectId?: string;
}

export const ModelEfficiencyTable: React.FC<ModelEfficiencyTableProps> = ({
    projectId,
}) => {
    const { data, isLoading, error } = useQuery<ModelEfficiencyDto>({
        queryKey: ['modelEfficiency', projectId],
        queryFn: () => financialApi.getModelEfficiency({ projectId: projectId! }),
        enabled: !!projectId,
    });

    const handleDownloadCsv = async () => {
        // CSV download not yet implemented in API
        console.log('CSV download not yet implemented');
    };

    if (isLoading) {
        return (
            <Card className="h-[420px]">
                <CardContent className="h-full flex items-center justify-center">
                    <div className="h-64 w-full bg-muted animate-pulse rounded-xl" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="h-[420px]">
                <CardContent className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground text-center">Failed to load model efficiency data</p>
                </CardContent>
            </Card>
        );
    }

    if (!data || !data.models || data.models.length === 0) {
        return (
            <Card className="h-[420px]">
                <CardContent className="h-full flex flex-col items-center justify-center gap-2">
                    <Cpu className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-muted-foreground text-center">No model efficiency data yet</p>
                    <p className="text-xs text-muted-foreground/70 text-center">
                        Metrics will appear once executions have run for this project.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const getEfficiencyIcon = (successRate: number) => {
        if (successRate >= 90) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
        if (successRate >= 70) return <Minus className="w-4 h-4 text-amber-400" />;
        return <TrendingDown className="w-4 h-4 text-red-400" />;
    };

    const getEfficiencyColor = (successRate: number) => {
        if (successRate >= 90) return 'text-emerald-400';
        if (successRate >= 70) return 'text-amber-400';
        return 'text-red-400';
    };

    return (
        <Card className="h-[420px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <Cpu className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-medium">Model Efficiency</CardTitle>
                </div>
                <button
                    onClick={handleDownloadCsv}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-foreground text-sm rounded-lg border border-[var(--card-border)] transition-colors"
                >
                    <Download className="w-4 h-4" />
                    CSV
                </button>
            </CardHeader>

            <CardContent className="flex-1 min-h-0 overflow-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[var(--border)]">
                            <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Model</th>
                            <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Provider</th>
                            <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Execs</th>
                            <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Cost</th>
                            <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">$/Exec</th>
                            <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">$/1kTok</th>
                            <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Success</th>
                            <th className="text-center py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.models.map((model) => (
                            <tr
                                key={model.modelName}
                                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-1)] transition-colors"
                            >
                                <td className="py-3 px-2">
                                    <span className="font-medium text-sm text-foreground">{model.modelName}</span>
                                </td>
                                <td className="py-3 px-2">
                                    <span className="text-xs text-muted-foreground">{model.provider}</span>
                                </td>
                                <td className="text-right py-3 px-2">
                                    <span className="text-sm text-foreground">{model.executionCount.toLocaleString()}</span>
                                </td>
                                <td className="text-right py-3 px-2">
                                    <span className="text-sm text-foreground">${parseFloat(model.totalCostUsd).toFixed(2)}</span>
                                </td>
                                <td className="text-right py-3 px-2">
                                    <span className="text-sm text-foreground">${parseFloat(model.costPerExecution).toFixed(4)}</span>
                                </td>
                                <td className="text-right py-3 px-2">
                                    <span className="text-sm text-foreground">${parseFloat(model.costPer1kTokens).toFixed(4)}</span>
                                </td>
                                <td className="text-right py-3 px-2">
                                    <span className={`text-sm font-medium ${getEfficiencyColor(model.successRate)}`}>
                                        {model.successRate.toFixed(1)}%
                                    </span>
                                </td>
                                <td className="text-center py-3 px-2">
                                    <div className={`flex items-center justify-center ${getEfficiencyColor(model.successRate)}`}>
                                        {getEfficiencyIcon(model.successRate)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Recommendation — only when meaningful (avoid "N/A" / "$0%" on sparse data) */}
                {data.recommendation &&
                    data.recommendation.mostEfficient &&
                    data.recommendation.mostEfficient !== 'N/A' && (
                    <div className="mt-4 p-4 bg-[var(--surface-1)] rounded-xl border border-[var(--card-border)]">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-medium text-foreground">Recommendation</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{data.recommendation.reason}</p>
                        <div className="flex items-center gap-4">
                            <div className="text-xs">
                                <span className="text-muted-foreground">Most efficient: </span>
                                <span className="font-medium text-emerald-400">{data.recommendation.mostEfficient}</span>
                            </div>
                            <div className="text-xs">
                                <span className="text-muted-foreground">Potential savings: </span>
                                <span className="font-medium text-emerald-400">${data.recommendation.potentialSavings}</span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

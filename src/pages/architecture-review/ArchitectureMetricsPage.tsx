import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCcw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useAdrMetrics, useAdrTrends } from '@/hooks/api/useAdrMetrics.ts';
import { MetricsFilters } from '../../components/architecture-review/metrics/MetricsFilters';
import { MetricsSummaryGrid } from '../../components/architecture-review/metrics/MetricsSummaryGrid';
import { ApprovalRateChart } from '../../components/architecture-review/metrics/charts/ApprovalRateChart';
import { RiskDistributionChart } from '../../components/architecture-review/metrics/charts/RiskDistributionChart';
import { RejectionReasonsChart } from '../../components/architecture-review/metrics/charts/RejectionReasonsChart';
import { WorkloadByProjectChart } from '../../components/architecture-review/metrics/charts/WorkloadByProjectChart';
import { AiInsightsGallery } from '../../components/architecture-review/metrics/AiInsightsGallery';
import { exportMetricsToCsv } from '@/lib/metrics-utils.ts';
import { cn } from '@/lib/utils.ts';
import type { AdrMetricsFilters } from '@/types/architectureReview.ts';

export default function ArchitectureMetricsPage() {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState<AdrMetricsFilters>({});

    const { data: metrics, isLoading: isLoadingMetrics, isFetching: isFetchingMetrics } = useAdrMetrics(filters);
    const { data: trends, isLoading: isLoadingTrends, isFetching: isFetchingTrends } = useAdrTrends(filters);

    // Combine loading state or handle independently
    const isLoading = isLoadingMetrics || isLoadingTrends;
    const isFetching = isFetchingMetrics || isFetchingTrends;

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['adrMetrics'] });
        queryClient.invalidateQueries({ queryKey: ['adrTrends'] });
    };

    const handleExport = () => {
        if (!metrics) return;
        exportMetricsToCsv(metrics);
    };

    return (
        <div className="space-y-6 container mx-auto p-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Architecture Review Metrics</h1>
                    <p className="text-muted-foreground">
                        Monitor the health, velocity, and quality of architecture decision reviews.
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isFetching}
                    className={cn(isFetching && "animate-spin")}
                >
                    <RefreshCcw className="h-4 w-4" />
                </Button>
            </div>

            <MetricsFilters
                filters={filters}
                onFilterChange={setFilters}
                onExport={handleExport}
            />

            <MetricsSummaryGrid
                summary={metrics?.summary}
                isLoading={isLoadingMetrics}
            />

            {/* AI Insights Gallery */}
            <AiInsightsGallery
                insights={metrics?.insights}
                isLoading={isLoadingMetrics}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <ApprovalRateChart
                    data={metrics?.trends?.approvalRate || trends?.approvalRate} // Depending on API response structure
                    isLoading={isLoading}
                />

                {/* Risk Distribution & Rejections & Workload */}
                <div className="col-span-2 lg:col-span-2 flex flex-col gap-4">
                    <RiskDistributionChart
                        data={metrics?.trends?.riskDistribution}
                        isLoading={isLoadingMetrics}
                    />
                    <RejectionReasonsChart
                        data={metrics?.trends?.rejectionReasons}
                        isLoading={isLoadingMetrics}
                    />
                </div>

                <div className="col-span-2 lg:col-span-3">
                    <WorkloadByProjectChart
                        data={metrics?.trends?.workloadByProject}
                        isLoading={isLoadingMetrics}
                    />
                </div>
            </div>
        </div>
    );
}

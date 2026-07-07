/**
 * Financial Metrics Type Definitions
 * Matches backend DTOs from Story 6-R-3
 */

export interface StoryCostDto {
    storyId: string;
    storyTitle: string;
    costUsd: string;
    tokensTotal: number;
    completionDate?: string;
}

export interface ProviderBreakdownDto {
    provider: string;
    costUsd: string;
    percentage: number;
}

export interface EpicOptionDto {
    epicId: string;
    epicTitle: string;
}

export interface CostPerFeatureDto {
    epicId: string;
    epicTitle: string;
    totalCostUsd: string;
    storyCount: number;
    avgCostPerStory: string;
    storyCosts: StoryCostDto[];
    byProvider: ProviderBreakdownDto[];
}

export interface RoiMetricsDto {
    projectId: string;
    period: string;
    metrics: {
        totalCostUsd: string;
        totalValueUsd: string;
        storyPointsDelivered: number;
        valuePerPoint: number;
        roiPercentage: number;
        costPerStoryPoint: string;
        breakEvenPoint: string;
    };
    trend: {
        previousPeriodRoi: number;
        change: string;
        direction: 'improving' | 'declining' | 'stable';
    };
}

export interface TimeSeriesDataPointDto {
    date: string;
    dailyCost: string;
    cumulativeCost: string;
    utilizationPct: number;
}

export interface AnomalyDto {
    date: string;
    cost: string;
    avgCost: string;
    spike: string;
    reason: string;
}

export interface BudgetTrendsDto {
    projectId: string;
    period: string;
    budget: {
        totalBudgetUsd: string;
        spentUsd: string;
        remainingUsd: string;
        utilizationPercentage: number;
    };
    trends: {
        burnRatePerDay: string;
        forecastDaysRemaining: number;
        forecastExhaustionDate: string;
        status: 'healthy' | 'warning' | 'critical';
    };
    timeSeries: TimeSeriesDataPointDto[];
    anomalies: AnomalyDto[];
}

export interface ModelMetricsDto {
    modelName: string;
    provider: string;
    totalCostUsd: string;
    executionCount: number;
    successRate: number;
    costPerExecution: string;
    costPer1kTokens: string;
    avgExecutionTimeSec: number;
}

export interface ModelEfficiencyDto {
    models: ModelMetricsDto[];
    recommendation: {
        mostEfficient: string;
        reason: string;
        potentialSavings: string;
    };
}

export interface ShareLinkResponseDto {
    shareUrl: string;
    expiresAt: string;
}

export interface ScheduleReportResponseDto {
    success: boolean;
    message: string;
}

export interface RoiDataPointDto {
    date: string;
    roi: number;
    cost: string;
    value: string;
}

export interface HistoricalRoiResponseDto {
    projectId: string;
    timeSeries: RoiDataPointDto[];
}

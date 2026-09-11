/**
 * Cost Tracking API Client
 *
 * Backs the Cost Analysis page. Shapes mirror the backend DTOs in
 * src/cost-tracking/dto — money arrives as a decimal STRING (Prisma Decimal),
 * never a number, so parse at the edge rather than trusting arithmetic on it.
 */

import apiClient from './client';

export type CostPeriod = 'day' | 'week' | 'month';

export interface ProviderCost {
    provider: string;
    costUsd: string;
    tokens: number;
}

export interface ModelCost {
    model: string;
    costUsd: string;
    tokens: number;
}

export interface CostSummary {
    period: string;
    startDate: string;
    endDate: string;
    totalCostUsd: string;
    totalTokensInput: number;
    totalTokensOutput: number;
    invocationCount: number;
    byProvider: ProviderCost[];
    byModel: ModelCost[];
}

export interface GroupedCost {
    groupKey: string;
    totalCostUsd: string;
    totalTokens: number;
    invocationCount: number;
}

export interface CostBreakdown {
    groupBy: string;
    data: GroupedCost[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
}

export interface SkillComputeStat {
    skill: string;
    totalCostUsd: string;
    runCount: number;
    avgDurationMs: number;
}

export interface SkillComputeStats {
    bySkill: SkillComputeStat[];
    bySkillProject: (SkillComputeStat & { projectId: string })[];
}

export const costsApi = {
    /** Omit projectId for the workspace-wide ("All projects") total. */
    getSummary: async (period: CostPeriod, projectId?: string): Promise<CostSummary> => {
        const { data } = await apiClient.get(`/costs/summary/${period}`, {
            params: projectId ? { projectId } : undefined,
        });
        return data;
    },

    getBreakdown: async (params: {
        groupBy: 'agent' | 'model';
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
    }): Promise<CostBreakdown> => {
        const { data } = await apiClient.get('/costs/breakdown', { params });
        return data;
    },

    getSkillComputeStats: async (): Promise<SkillComputeStats> => {
        const { data } = await apiClient.get('/costs/skill-compute-stats');
        return data;
    },
};

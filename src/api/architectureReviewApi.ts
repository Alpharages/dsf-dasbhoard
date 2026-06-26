import apiClient from './client';
import type { AdrQueueFilters, AdrQueueResponse } from '../types/architectureReview';
import type { ArchitectureConstraint, CreateConstraintDto, UpdateConstraintDto } from '../types/architectureConstraint';

export const architectureReviewApi = {
    getAdrQueue: async (filters: AdrQueueFilters, _token: string): Promise<AdrQueueResponse> => {
        const response = await apiClient.get('/architecture-review/queue', {
            params: filters,
        });
        return response.data;
    },

    submitAdrReview: async (
        adrId: string,
        action: 'APPROVE' | 'REJECT' | 'MODIFY' | 'DEFER',
        notes: string | undefined,
        _token: string
    ): Promise<void> => {
        await apiClient.post(
            `/architecture-review/${adrId}/review`,
            { action, notes }
        );
    },

    // Architecture Constraints CRUD
    getArchitectureConstraints: async (
        projectId?: string,
        _token?: string
    ): Promise<ArchitectureConstraint[]> => {
        const response = await apiClient.get('/architecture-constraints', {
            params: projectId ? { projectId } : {},
        });
        return response.data;
    },

    createConstraint: async (
        data: CreateConstraintDto,
        _token: string
    ): Promise<ArchitectureConstraint> => {
        const response = await apiClient.post(
            '/architecture-constraints',
            data
        );
        return response.data;
    },

    updateConstraint: async (
        id: string,
        data: UpdateConstraintDto,
        _token: string
    ): Promise<ArchitectureConstraint> => {
        const response = await apiClient.patch(
            `/architecture-constraints/${id}`,
            data
        );
        return response.data;
    },

    deleteConstraint: async (id: string, _token: string): Promise<void> => {
        await apiClient.delete(`/architecture-constraints/${id}`);
    },

    // Escalation & Guidance
    provideGuidance: async (
        adrId: string,
        guidance: string,
        applyGlobally: boolean,
        updateThresholds: boolean,
        _token: string
    ): Promise<void> => {
        await apiClient.post(
            `/architecture-review/${adrId}/guidance`,
            { guidance, applyGlobally, updateThresholds }
        );
    },

    delegateReview: async (
        adrId: string,
        architectId: string,
        notes: string | undefined,
        _token: string
    ): Promise<void> => {
        await apiClient.post(
            `/architecture-review/${adrId}/delegate`,
            { architectId, notes }
        );
    },

    getEscalationMetrics: async (_token: string): Promise<import('../types/architectureReview').EscalationMetrics> => {
        const response = await apiClient.get('/architecture-review/escalations/metrics');
        // Backend returns a snake_case shape (total_escalations, by_reason map,
        // resolution_outcomes, avg_resolution_time_seconds). Map it to the camelCase
        // EscalationMetrics the UI expects so the page doesn't crash on undefined fields.
        const d = response.data ?? {};
        const byReason: Record<string, number> = d.by_reason ?? {};
        const topReasons = Object.entries(byReason)
            .map(([reason, count]) => ({ reason, count: Number(count) || 0 }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        const outcomes = d.resolution_outcomes ?? {};
        const outcomesTotal = Object.values<number>(outcomes).reduce((s, n) => s + (Number(n) || 0), 0);
        const delegationRate = outcomesTotal > 0
            ? Math.round(((Number(outcomes.delegated) || 0) / outcomesTotal) * 100)
            : 0;
        return {
            totalEscalations: d.total_escalations ?? 0,
            escalationRate: d.escalation_rate ?? 0,
            topReasons,
            avgResolutionTimeMinutes: (d.avg_resolution_time_seconds ?? 0) / 60,
            delegationRate,
        };
    },

    getMetrics: async (
        filters: import('../types/architectureReview').AdrMetricsFilters,
        _token: string
    ): Promise<import('../types/architectureReview').AdrDashboardMetrics> => {
        const response = await apiClient.get('/architecture-review/metrics', {
            params: filters,
        });
        return response.data;
    },

    getTrends: async (
        filters: import('../types/architectureReview').AdrMetricsFilters,
        _token: string
    ): Promise<import('../types/architectureReview').AdrDashboardMetrics['trends']> => {
        const response = await apiClient.get('/architecture-review/trends', {
            params: filters,
        });
        return response.data;
    }
};

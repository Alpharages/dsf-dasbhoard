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
        return response.data;
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

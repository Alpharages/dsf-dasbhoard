import axios from 'axios';
import type { AdrQueueFilters, AdrQueueResponse } from '../types/architectureReview';
import type { ArchitectureConstraint, CreateConstraintDto, UpdateConstraintDto } from '../types/architectureConstraint';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const architectureReviewApi = {
    getAdrQueue: async (filters: AdrQueueFilters, token: string): Promise<AdrQueueResponse> => {
        const response = await axios.get(`${API_BASE_URL}/architecture-review/queue`, {
            params: filters,
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    submitAdrReview: async (
        adrId: string,
        action: 'APPROVE' | 'REJECT' | 'MODIFY' | 'DEFER',
        notes: string | undefined,
        token: string
    ): Promise<void> => {
        await axios.post(
            `${API_BASE_URL}/architecture-review/${adrId}/review`,
            { action, notes },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    },

    // Architecture Constraints CRUD
    getArchitectureConstraints: async (
        projectId?: string,
        token?: string
    ): Promise<ArchitectureConstraint[]> => {
        const response = await axios.get(`${API_BASE_URL}/architecture-constraints`, {
            params: projectId ? { projectId } : {},
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
    },

    createConstraint: async (
        data: CreateConstraintDto,
        token: string
    ): Promise<ArchitectureConstraint> => {
        const response = await axios.post(
            `${API_BASE_URL}/architecture-constraints`,
            data,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },

    updateConstraint: async (
        id: string,
        data: UpdateConstraintDto,
        token: string
    ): Promise<ArchitectureConstraint> => {
        const response = await axios.patch(
            `${API_BASE_URL}/architecture-constraints/${id}`,
            data,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },

    deleteConstraint: async (id: string, token: string): Promise<void> => {
        await axios.delete(
            `${API_BASE_URL}/architecture-constraints/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
    },

    // Escalation & Guidance
    provideGuidance: async (
        adrId: string,
        guidance: string,
        applyGlobally: boolean,
        updateThresholds: boolean,
        token: string
    ): Promise<void> => {
        await axios.post(
            `${API_BASE_URL}/architecture-review/${adrId}/guidance`,
            { guidance, applyGlobally, updateThresholds },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    },

    delegateReview: async (
        adrId: string,
        architectId: string,
        notes: string | undefined,
        token: string
    ): Promise<void> => {
        await axios.post(
            `${API_BASE_URL}/architecture-review/${adrId}/delegate`,
            { architectId, notes },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    },

    getEscalationMetrics: async (token: string): Promise<import('../types/architectureReview').EscalationMetrics> => {
        const response = await axios.get(`${API_BASE_URL}/architecture-review/escalations/metrics`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};

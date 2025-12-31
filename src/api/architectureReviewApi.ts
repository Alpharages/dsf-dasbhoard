import axios from 'axios';
import type { AdrQueueFilters, AdrQueueResponse } from '../types/architectureReview';

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
    }
};

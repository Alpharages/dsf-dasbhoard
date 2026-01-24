import apiClient from './client';
import type {
    CapabilityDashboardResponse,
    CreateLimitationDto,
    UpdateLimitationDto
} from '../types/capabilities';

export const capabilitiesApi = {
    /**
     * Get capability dashboard data with metrics and top limitations
     * Endpoint: GET /capabilities/dashboard
     * Access: TL, ADMIN, PM
     */
    getDashboard: async (_token: string): Promise<CapabilityDashboardResponse> => {
        const response = await apiClient.get('/capabilities/dashboard');
        return response.data;
    },

    /**
     * Create a new AI limitation entry
     * Endpoint: POST /capabilities/limitations
     * Access: TL, ADMIN only
     */
    createLimitation: async (
        data: CreateLimitationDto,
        _token: string
    ): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.post(
            '/capabilities/limitations',
            data
        );
        return response.data;
    },

    /**
     * Update an existing AI limitation
     * Endpoint: PUT /capabilities/limitations/:taskType
     * Access: TL, ADMIN only
     */
    updateLimitation: async (
        taskType: string,
        data: UpdateLimitationDto,
        _token: string
    ): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.put(
            `/capabilities/limitations/${taskType}`,
            data
        );
        return response.data;
    },

    /**
     * Get AI limitations as Markdown knowledge base
     * Endpoint: GET /capabilities/knowledge-base.md
     * Access: All authenticated users
     */
    getKnowledgeBase: async (_token: string): Promise<string> => {
        const response = await apiClient.get('/capabilities/knowledge-base.md');
        return response.data;
    }
};

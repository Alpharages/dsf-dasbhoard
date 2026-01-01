import axios from 'axios';
import type {
    CapabilityDashboardResponse,
    CreateLimitationDto,
    UpdateLimitationDto
} from '../types/capabilities';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const capabilitiesApi = {
    /**
     * Get capability dashboard data with metrics and top limitations
     * Endpoint: GET /api/v1/capabilities/dashboard
     * Access: TL, ADMIN, PM
     */
    getDashboard: async (token: string): Promise<CapabilityDashboardResponse> => {
        const response = await axios.get(`${API_BASE_URL}/capabilities/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    /**
     * Create a new AI limitation entry
     * Endpoint: POST /api/v1/capabilities/limitations
     * Access: TL, ADMIN only
     */
    createLimitation: async (
        data: CreateLimitationDto,
        token: string
    ): Promise<{ success: boolean; message: string }> => {
        const response = await axios.post(
            `${API_BASE_URL}/capabilities/limitations`,
            data,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },

    /**
     * Update an existing AI limitation
     * Endpoint: PUT /api/v1/capabilities/limitations/:taskType
     * Access: TL, ADMIN only
     */
    updateLimitation: async (
        taskType: string,
        data: UpdateLimitationDto,
        token: string
    ): Promise<{ success: boolean; message: string }> => {
        const response = await axios.put(
            `${API_BASE_URL}/capabilities/limitations/${taskType}`,
            data,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },

    /**
     * Get AI limitations as Markdown knowledge base
     * Endpoint: GET /api/v1/capabilities/knowledge-base.md
     * Access: All authenticated users
     */
    getKnowledgeBase: async (token: string): Promise<string> => {
        const response = await axios.get(`${API_BASE_URL}/capabilities/knowledge-base.md`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};

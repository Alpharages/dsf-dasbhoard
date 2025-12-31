/**
 * Financial Metrics API Client
 * Story 6-R-3 Backend Integration
 */

import axios from 'axios';
import type {
    CostPerFeatureDto,
    RoiMetricsDto,
    BudgetTrendsDto,
    ModelEfficiencyDto,
} from '../types/financial';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || 'dummy-token';
    return { Authorization: `Bearer ${token}` };
};

export const financialApi = {
    /**
     * AC#1: Get cost breakdown per feature/epic
     */
    getCostPerFeature: async (params: {
        epicId: string;
        projectId?: string;
        startDate?: string;
        endDate?: string;
        format?: 'json' | 'csv';
    }): Promise<CostPerFeatureDto[]> => {
        const { data } = await axios.get(`${API_BASE_URL}/financial-metrics/cost-per-feature`, {
            params,
            headers: getAuthHeaders(),
        });
        return data;
    },

    /**
     * AC#1: Download cost per feature as CSV
     */
    downloadCostPerFeatureCsv: async (params: {
        epicId: string;
        projectId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<Blob> => {
        const { data } = await axios.get(`${API_BASE_URL}/financial-metrics/cost-per-feature`, {
            params: { ...params, format: 'csv' },
            headers: getAuthHeaders(),
            responseType: 'blob',
        });
        return data;
    },

    /**
     * AC#2: Calculate ROI with value tracking
     */
    getRoi: async (params: {
        projectId: string;
        period: 'day' | 'week' | 'month';
        valuePerPoint?: number;
    }): Promise<RoiMetricsDto> => {
        const { data } = await axios.get(`${API_BASE_URL}/financial-metrics/roi`, {
            params,
            headers: getAuthHeaders(),
        });
        return data;
    },

    /**
     * AC#3: Get budget utilization trends with forecasting
     */
    getBudgetTrends: async (params: {
        projectId: string;
        period: 'week' | 'month' | 'quarter';
        format?: 'json' | 'csv';
    }): Promise<BudgetTrendsDto> => {
        const { data } = await axios.get(`${API_BASE_URL}/financial-metrics/budget-trends`, {
            params,
            headers: getAuthHeaders(),
        });
        return data;
    },

    /**
     * AC#3: Download budget trends as CSV
     */
    downloadBudgetTrendsCsv: async (params: {
        projectId: string;
        period: 'week' | 'month' | 'quarter';
    }): Promise<Blob> => {
        const { data } = await axios.get(`${API_BASE_URL}/financial-metrics/budget-trends`, {
            params: { ...params, format: 'csv' },
            headers: getAuthHeaders(),
            responseType: 'blob',
        });
        return data;
    },

    /**
     * AC#4: Analyze AI model efficiency
     */
    getModelEfficiency: async (params: {
        projectId: string;
        startDate?: string;
        endDate?: string;
    }): Promise<ModelEfficiencyDto> => {
        const { data } = await axios.get(`${API_BASE_URL}/financial-metrics/model-efficiency`, {
            params,
            headers: getAuthHeaders(),
        });
        return data;
    },
};

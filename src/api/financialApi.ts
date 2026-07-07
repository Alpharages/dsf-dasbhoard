/**
 * Financial Metrics API Client
 * Story 6-R-3 Backend Integration
 */

import apiClient from './client';
import type {
    CostPerFeatureDto,
    EpicOptionDto,
    RoiMetricsDto,
    BudgetTrendsDto,
    ModelEfficiencyDto,
    ShareLinkResponseDto,
    ScheduleReportResponseDto,
    HistoricalRoiResponseDto,
} from '../types/financial';

export const financialApi = {
    /**
     * BUG-04: List epics available for the cost-per-feature epic selector
     */
    getEpics: async (params: { projectId?: string }): Promise<EpicOptionDto[]> => {
        const { data } = await apiClient.get('/financial-metrics/epics', {
            params,
        });
        return data;
    },

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
        const { data } = await apiClient.get('/financial-metrics/cost-per-feature', {
            params,
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
        const { data } = await apiClient.get('/financial-metrics/cost-per-feature', {
            params: { ...params, format: 'csv' },
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
        const { data } = await apiClient.get('/financial-metrics/roi', {
            params,
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
        const { data } = await apiClient.get('/financial-metrics/budget-trends', {
            params,
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
        const { data } = await apiClient.get('/financial-metrics/budget-trends', {
            params: { ...params, format: 'csv' },
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
        const { data } = await apiClient.get('/financial-metrics/model-efficiency', {
            params,
        });
        return data;
    },

    /**
     * AC#2 Extension: Get historical ROI trend
     */
    getHistoricalRoi: async (params: {
        projectId: string;
        startDate?: string;
        endDate?: string;
    }): Promise<HistoricalRoiResponseDto> => {
        const { data } = await apiClient.get('/financial-metrics/historical-roi', {
            params,
        });
        return data;
    },

    /**
     * AC#5: Generate shareable read-only dashboard link
     */
    generateShareLink: async (payload: {
        projectId: string;
        expireDays?: number;
    }): Promise<ShareLinkResponseDto> => {
        const { data } = await apiClient.post('/financial-metrics/share-link', payload);
        return data;
    },

    /**
     * AC#6: Schedule automated financial report
     */
    scheduleReport: async (payload: {
        projectId: string;
        email: string;
        frequency: 'weekly' | 'monthly';
    }): Promise<ScheduleReportResponseDto> => {
        const { data } = await apiClient.post('/financial-metrics/schedule-report', payload);
        return data;
    },
};

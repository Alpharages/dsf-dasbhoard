import apiClient from './client';

export interface Ticket {
    id: string;
    title: string;
    clickup_task_id: string;
    status: string;
    project: {
        id: string;
        name: string;
        budget_usd: string; // Decimal comes as string from JSON often, or number
    };
    costStats?: {
        totalCost: number;
        projectBudget: number;
        projectSpend: number;
    };
}

export interface DecisionDto {
    decision: 'APPROVE' | 'REJECT';
    reason?: string;
}

export const decisionApi = {
    getPendingTickets: async (): Promise<Ticket[]> => {
        const response = await apiClient.get('/decisions/pending');
        return response.data;
    },

    submitDecision: async (ticketId: string, data: DecisionDto): Promise<void> => {
        await apiClient.post(`/decisions/${ticketId}/decision`, data);
    },

    submitOverride: async (ticketId: string, reason: string): Promise<void> => {
        await apiClient.post(`/decisions/${ticketId}/override`, { reason });
    },

    getMetrics: async (): Promise<{ pendingCount: number; totalBlockedCost: number }> => {
        const response = await apiClient.get('/decisions/metrics');
        return response.data;
    },
};

import apiClient from './client';

export interface WorkloadStats {
    utilization: number;
    active_tickets: number;
    max_tickets: number;
}

export interface TeamWorkloadItem {
    pmId: string;
    pmName: string;
    utilization: number;
}

export interface TeamWorkloadResponse {
    data: TeamWorkloadItem[];
}

export interface WorkloadTrendItem {
    date: string;
    utilization: number;
}

export interface WorkloadTrendsResponse {
    data: WorkloadTrendItem[];
}

export const workloadApi = {
    getPmWorkload: async (pmId: string): Promise<WorkloadStats> => {
        const response = await apiClient.get(`/workload/pm/${pmId}`);
        return response.data;
    },

    getTeamWorkload: async (): Promise<TeamWorkloadResponse> => {
        const response = await apiClient.get('/workload/team');
        return response.data;
    },

    getWorkloadTrends: async (pmId: string, days: number = 30): Promise<WorkloadTrendsResponse> => {
        const response = await apiClient.get(`/workload/trends/${pmId}`, {
            params: { days }
        });
        return response.data;
    },

    reassignProject: async (projectId: string, newPmId: string, reason: string): Promise<void> => {
        await apiClient.post(`/projects/${projectId}/reassign`, {
            newPmId,
            reason
        });
    },

    updateMaxTickets: async (pmId: string, maxTickets: number): Promise<WorkloadStats> => {
        const response = await apiClient.put(`/workload/pm/${pmId}/capacity`, {
            max_tickets: maxTickets
        });
        return response.data;
    }
};

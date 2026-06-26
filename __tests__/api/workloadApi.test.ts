import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workloadApi } from '@/api/workloadApi';
import apiClient from '@/api/client';

vi.mock('@/api/client', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
    }
}));

describe('workloadApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getPmWorkload should fetch PM workload data', async () => {
        const mockData = { utilization: 75, active_tickets: 3, max_tickets: 4 };
        (apiClient.get as any).mockResolvedValueOnce({ data: mockData });

        const result = await workloadApi.getPmWorkload('usr-1');

        expect(apiClient.get).toHaveBeenCalledWith('/workload/pm/usr-1');
        expect(result).toEqual(mockData);
    });

    it('getTeamWorkload should fetch team workload data and map the backend shape', async () => {
        // Backend responds with a bare array of snake_case rows (TeamCapacityResponseDto[]).
        (apiClient.get as any).mockResolvedValueOnce({
            data: [{ pm_id: 'usr-1', pm_name: 'Alice', utilization_pct: 60 }],
        });

        const result = await workloadApi.getTeamWorkload('mgr-1');

        expect(apiClient.get).toHaveBeenCalledWith('/workload/team', { params: { managerId: 'mgr-1' } });
        expect(result).toEqual({ data: [{ pmId: 'usr-1', pmName: 'Alice', utilization: 60 }] });
    });

    it('getWorkloadTrends should fetch trends with params', async () => {
        const mockData = { data: [{ date: '2023-01-01', utilization: 50 }] };
        (apiClient.get as any).mockResolvedValueOnce({ data: mockData });

        const result = await workloadApi.getWorkloadTrends('usr-1', 7);

        expect(apiClient.get).toHaveBeenCalledWith('/workload/trends/usr-1', {
            params: { days: 7 }
        });
        expect(result).toEqual(mockData);
    });

    it('reassignProject should post reassignment data', async () => {
        (apiClient.post as any).mockResolvedValueOnce({});

        await workloadApi.reassignProject('proj-1', 'usr-2', 'Overload');

        expect(apiClient.post).toHaveBeenCalledWith('/projects/proj-1/reassign', {
            newPmId: 'usr-2',
            reason: 'Overload'
        });
    });

    it('updateMaxTickets should put capacity data', async () => {
        const mockData = { utilization: 50, active_tickets: 2, max_tickets: 4 };
        (apiClient.put as any).mockResolvedValueOnce({ data: mockData });

        const result = await workloadApi.updateMaxTickets('usr-1', 4);

        expect(apiClient.put).toHaveBeenCalledWith('/workload/pm/usr-1/capacity', {
            max_tickets: 4
        });
        expect(result).toEqual(mockData);
    });
});

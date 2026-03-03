// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { useSystemConfig } from './useSystemConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock AuthContext so useAuth() doesn't throw outside provider
vi.mock('../../contexts/AuthContext', () => ({
    useAuth: vi.fn(() => ({ user: { id: 'user1', role: 'ADMIN' } })),
    getAccessToken: vi.fn(() => 'test-token'),
}));

// Mock apiClient
vi.mock('../../api/client');
const mockedApiClient = apiClient as any;

// Mock socket
const mockSocketOn = vi.fn();
const mockSocketOff = vi.fn();
vi.mock('../useSocket', () => ({
    useSocket: () => ({
        socket: {
            on: mockSocketOn,
            off: mockSocketOff,
        },
    }),
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient} > {children} </QueryClientProvider>
);

describe('useSystemConfig', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient.clear();
    });

    it('should fetch system config', async () => {
        const mockData = [
            { key: 'cleanup.retention_period', value: '30', is_secret: false, updated_at: '2023-01-01' },
            { key: 'cost.budget_cap', value: '1000', is_secret: false, updated_at: '2023-01-01' },
        ];
        mockedApiClient.get.mockResolvedValueOnce({ data: mockData });

        const { result } = renderHook(() => useSystemConfig(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockData);
        expect(result.current.getValue('cleanup.retention_period')).toBe('30');
        expect(result.current.getValue('non.existent', 'default')).toBe('default');
    });

    it('should update system config', async () => {
        mockedApiClient.patch.mockResolvedValueOnce({ data: { success: true } });
        mockedApiClient.get.mockResolvedValueOnce({ data: [] }); // Initial fetch

        const { result } = renderHook(() => useSystemConfig(), { wrapper });

        await result.current.updateConfig({ key: 'test.key', value: 'new-value' });

        expect(mockedApiClient.patch).toHaveBeenCalledWith(
            expect.stringContaining('/config/test.key'),
            expect.objectContaining({ key: 'test.key', value: 'new-value' })
        );
    });

    it('should setup socket listener', () => {
        renderHook(() => useSystemConfig(), { wrapper });
        expect(mockSocketOn).toHaveBeenCalledWith('CONFIG_UPDATED', expect.any(Function));
    });

    it('should cleanup socket listener on unmount', () => {
        const { unmount } = renderHook(() => useSystemConfig(), { wrapper });
        unmount();
        expect(mockSocketOff).toHaveBeenCalledWith('CONFIG_UPDATED', expect.any(Function));
    });
});

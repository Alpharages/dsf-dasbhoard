// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { useSystemConfig } from './useSystemConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any; // Bypass type check for mock to avoid jest namespace issues

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
        mockedAxios.get.mockResolvedValueOnce({ data: mockData });

        const { result } = renderHook(() => useSystemConfig(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockData);
        expect(result.current.getValue('cleanup.retention_period')).toBe('30');
        expect(result.current.getValue('non.existent', 'default')).toBe('default');
    });

    it('should update system config', async () => {
        mockedAxios.patch.mockResolvedValueOnce({ data: { success: true } });
        mockedAxios.get.mockResolvedValueOnce({ data: [] }); // Initial fetch

        const { result } = renderHook(() => useSystemConfig(), { wrapper });

        await result.current.updateConfig({ key: 'test.key', value: 'new-value' });

        expect(mockedAxios.patch).toHaveBeenCalledWith(
            expect.stringContaining('/config/test.key'),
            expect.objectContaining({ key: 'test.key', value: 'new-value' }),
            expect.any(Object)
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

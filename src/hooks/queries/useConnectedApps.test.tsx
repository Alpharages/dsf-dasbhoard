import { renderHook, waitFor } from '@testing-library/react';
import { useConnectedApps, useDisconnectConnectedApp } from './useConnectedApps';
import { connectedAppsApi } from '@/api/connectedAppsApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { toast } from 'react-hot-toast';

vi.mock('@/api/connectedAppsApi');
vi.mock('react-hot-toast');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useConnectedApps hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useConnectedApps', () => {
    it('fetches connected apps successfully', async () => {
      const mockApps = [
        { id: '1', provider: 'CLICKUP', workspaceName: 'Test WS', connectedAt: new Date().toISOString() },
      ];
      vi.mocked(connectedAppsApi.getConnectedApps).mockResolvedValue(mockApps as any);

      const { result } = renderHook(() => useConnectedApps(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockApps);
    });
  });

  describe('useDisconnectConnectedApp', () => {
    it('calls disconnect API and shows success toast', async () => {
      vi.mocked(connectedAppsApi.disconnectApp).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDisconnectConnectedApp(), { wrapper: createWrapper() });

      result.current.mutate('app-id');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(connectedAppsApi.disconnectApp).toHaveBeenCalledWith('app-id');
      expect(toast.success).toHaveBeenCalledWith('Account disconnected successfully');
    });

    it('shows error toast on failure', async () => {
      const error = { response: { data: { message: 'Disconnect failed' } } };
      vi.mocked(connectedAppsApi.disconnectApp).mockRejectedValue(error);

      const { result } = renderHook(() => useDisconnectConnectedApp(), { wrapper: createWrapper() });

      result.current.mutate('app-id');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Disconnect failed');
    });
  });
});

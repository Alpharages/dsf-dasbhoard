import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useActiveExecutions } from '@/hooks/queries/useExecutions';
import { useApprovals } from '@/hooks/useApprovals';
import { useAuth } from '@/contexts';
import * as executionsApi from '@/api/executionsApi';
import apiClient from '@/api/client';

// Mock useAuth
vi.mock('@/contexts', () => ({
  useAuth: vi.fn(),
}));

// Mock executions API module
vi.mock('@/api/executionsApi', () => ({
  getActiveExecutions: vi.fn(),
  getExecution: vi.fn(),
  getExecutionLogs: vi.fn(),
  getExecutionActivities: vi.fn(),
  getLatestExecutionActivities: vi.fn(),
  pauseExecution: vi.fn(),
  resumeExecution: vi.fn(),
  emergencyStopExecution: vi.fn(),
  controlExecution: vi.fn(),
  exportExecutionLogs: vi.fn(),
}));

// Mock apiClient (used directly by useApprovals)
vi.mock('@/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useAuthGuards', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('useActiveExecutions', () => {
    it('is disabled when user is null', async () => {
      (useAuth as any).mockReturnValue({ user: null });

      const { result } = renderHook(() => useActiveExecutions(), { wrapper });

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect(executionsApi.getActiveExecutions).not.toHaveBeenCalled();
    });

    it('is enabled when user exists', async () => {
      (useAuth as any).mockReturnValue({ user: { id: '1' } });
      (executionsApi.getActiveExecutions as any).mockResolvedValue({ executions: [] });

      const { result } = renderHook(() => useActiveExecutions(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(executionsApi.getActiveExecutions).toHaveBeenCalled();
    });
  });

  describe('useApprovals — nested closure hook pattern', () => {
    it('useApprovalQueue is disabled when user is null', async () => {
      (useAuth as any).mockReturnValue({ user: null });

      const { result } = renderHook(
        () => {
          const { useApprovalQueue } = useApprovals();
          return useApprovalQueue();
        },
        { wrapper },
      );

      // enabled: !!user resolves to false — query stays pending-idle, no API call
      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
      expect((apiClient as any).get).not.toHaveBeenCalled();
    });

    it('useApprovalQueue fires when user exists', async () => {
      (useAuth as any).mockReturnValue({ user: { id: '1', role: 'PM' } });
      (apiClient as any).get.mockResolvedValue({ data: { executions: [] } });

      const { result } = renderHook(
        () => {
          const { useApprovalQueue } = useApprovals();
          return useApprovalQueue();
        },
        { wrapper },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect((apiClient as any).get).toHaveBeenCalled();
    });
  });
});

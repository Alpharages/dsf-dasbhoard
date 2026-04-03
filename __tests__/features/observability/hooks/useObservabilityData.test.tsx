import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useObservabilityData } from '@/features/observability/hooks/useObservabilityData';
import * as observabilityApi from '@/features/observability/api/observability.api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock dependencies
vi.mock('@/hooks/useSocket', () => ({
  useSocket: vi.fn(() => ({ socket: null, connected: false }))
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ isAuthenticated: true, user: { id: 'test-user' } })),
  getAccessToken: vi.fn(() => 'test-token')
}));

vi.mock('@/features/observability/api/observability.api', () => ({
  fetchSystemHealth: vi.fn(),
  fetchQueueMetrics: vi.fn(),
  fetchFileLocks: vi.fn(),
  fetchAIProvidersStatus: vi.fn(),
  releaseFileLock: vi.fn(),
  toggleExecutionPause: vi.fn(),
}));

describe('useObservabilityData', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should initialize correctly without socket and await health check to determine true disconnection', () => {
    const { result } = renderHook(() => useObservabilityData({ pollingEnabled: false }), { wrapper });
    
    expect(result.current.isSocketConnected).toBe(false);
    expect(result.current.isDisconnected).toBe(false); // only true if systemHealthError also fails
  });

  it('should have loading states initially', () => {
    const { result } = renderHook(() => useObservabilityData({ pollingEnabled: true }), { wrapper });

    expect(result.current.isSystemHealthLoading).toBe(true);
    expect(result.current.isQueueMetricsLoading).toBe(true);
    expect(result.current.isFileLocksLoading).toBe(true);
    expect(result.current.isAiProvidersLoading).toBe(true);
  });

  it('should become disconnected when socket is down AND system health fails (Docker-down scenario)', async () => {
    vi.mocked(observabilityApi.fetchSystemHealth).mockRejectedValue(new Error('Service unavailable'));

    const { result } = renderHook(() => useObservabilityData({ pollingEnabled: true }), { wrapper });

    await waitFor(() => {
      expect(result.current.systemHealthError).toBeTruthy();
    });

    // isSocketConnected is false (from mock) AND systemHealthError is set → disconnected
    expect(result.current.isDisconnected).toBe(true);
  });

  it('should NOT be disconnected when socket is down but health check succeeds', async () => {
    vi.mocked(observabilityApi.fetchSystemHealth).mockResolvedValue({
      status: 'up',
      components: { database: { status: 'up', latency_ms: 5 }, rabbitmq: { status: 'up', latency_ms: 3 }, prometheus: { status: 'up', latency_ms: 2 } },
      uptime_seconds: 3600,
    } as any);

    const { result } = renderHook(() => useObservabilityData({ pollingEnabled: true }), { wrapper });

    await waitFor(() => {
      expect(result.current.systemHealthError).toBeNull();
    });

    expect(result.current.isDisconnected).toBe(false);
  });
});

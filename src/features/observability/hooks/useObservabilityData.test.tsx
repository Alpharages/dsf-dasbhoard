import { renderHook } from '@testing-library/react';
import { useObservabilityData } from './useObservabilityData';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock dependencies
jest.mock('@/hooks/useSocket', () => ({
  useSocket: jest.fn(() => ({ socket: null, connected: false }))
}));

jest.mock('../api/observability.api', () => ({
  fetchSystemHealth: jest.fn(),
  fetchQueueMetrics: jest.fn(),
  fetchFileLocks: jest.fn(),
  fetchAIProvidersStatus: jest.fn(),
  releaseFileLock: jest.fn(),
  toggleExecutionPause: jest.fn(),
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

  it('should initialize with disconnected state without socket', () => {
    const { result } = renderHook(() => useObservabilityData({ pollingEnabled: false }), { wrapper });
    
    expect(result.current.isSocketConnected).toBe(false);
    expect(result.current.isDisconnected).toBe(true);
  });

  it('should have loading states initially', () => {
    const { result } = renderHook(() => useObservabilityData({ pollingEnabled: true }), { wrapper });
    
    expect(result.current.isSystemHealthLoading).toBe(true);
    expect(result.current.isQueueMetricsLoading).toBe(true);
    expect(result.current.isFileLocksLoading).toBe(true);
    expect(result.current.isAiProvidersLoading).toBe(true);
  });
});

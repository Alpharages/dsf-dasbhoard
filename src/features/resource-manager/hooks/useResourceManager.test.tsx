import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useActiveLocks,
  useDependencyGraph,
  useCircularDependencies,
  useForceUnlockMutation,
  useReprioritizeMutation,
  resourceManagerKeys,
} from './useResourceManager';
import * as api from '../api/resource-manager.api';

// Mock the API module
vi.mock('../api/resource-manager.api', () => ({
  getActiveLocks: vi.fn(),
  getDependencyGraph: vi.fn(),
  detectCircularDependencies: vi.fn(),
  forceUnlock: vi.fn(),
  reprioritizeTicket: vi.fn(),
}));

// Mock the socket hook
vi.mock('@/hooks/useSocket', () => ({
  useSocket: () => ({ socket: null, connected: false }),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useResourceManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('test-token');
  });

  describe('useActiveLocks', () => {
    it('should fetch and return active locks', async () => {
      const mockLocks = [
        {
          id: 'lock-1',
          filePath: '/src/test.ts',
          ticketId: '123',
          executionId: 'exec-1',
          lockedAt: new Date().toISOString(),
          lockAgeMinutes: 5,
          isStale: false,
        },
      ];

      vi.mocked(api.getActiveLocks).mockResolvedValue(mockLocks);

      const { result } = renderHook(() => useActiveLocks(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockLocks);
      });

      expect(api.getActiveLocks).toHaveBeenCalled();
    });

    it('should identify stale locks correctly', async () => {
      const mockLocks = [
        {
          id: 'lock-1',
          filePath: '/src/test.ts',
          ticketId: '123',
          executionId: 'exec-1',
          lockedAt: new Date().toISOString(),
          lockAgeMinutes: 45, // > 30 minutes = stale
          isStale: true,
        },
      ];

      vi.mocked(api.getActiveLocks).mockResolvedValue(mockLocks);

      const { result } = renderHook(() => useActiveLocks(), { wrapper });

      await waitFor(() => {
        expect(result.current.data?.[0].isStale).toBe(true);
      });
    });
  });

  describe('useDependencyGraph', () => {
    it('should fetch dependency graph', async () => {
      const mockGraph = {
        nodes: [
          { id: 'ticket-1', type: 'ticket' as const, label: 'Ticket 1', data: {} },
          { id: 'file-1', type: 'file' as const, label: 'File 1', data: {} },
        ],
        edges: [
          { id: 'edge-1', source: 'ticket-1', target: 'file-1', type: 'depends_on' as const },
        ],
      };

      vi.mocked(api.getDependencyGraph).mockResolvedValue(mockGraph);

      const { result } = renderHook(() => useDependencyGraph(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockGraph);
      });

      expect(api.getDependencyGraph).toHaveBeenCalled();
    });
  });

  describe('useCircularDependencies', () => {
    it('should fetch circular dependencies', async () => {
      const mockCircularDeps = [
        {
          nodes: ['ticket-1', 'ticket-2'],
          edges: ['edge-1', 'edge-2'],
        },
      ];

      vi.mocked(api.detectCircularDependencies).mockResolvedValue(mockCircularDeps);

      const { result } = renderHook(() => useCircularDependencies(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockCircularDeps);
      });

      expect(api.detectCircularDependencies).toHaveBeenCalled();
    });
  });

  describe('useForceUnlockMutation', () => {
    it('should force unlock with audit reason', async () => {
      vi.mocked(api.forceUnlock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useForceUnlockMutation(), { wrapper });

      await result.current.mutateAsync({
        lockId: 'lock-1',
        reason: 'Test reason for audit log',
      });

      expect(api.forceUnlock).toHaveBeenCalledWith({
        lockId: 'lock-1',
        reason: 'Test reason for audit log',
      });
    });

    it('should include reason in request for audit log compatibility', async () => {
      const forceUnlockSpy = vi.mocked(api.forceUnlock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useForceUnlockMutation(), { wrapper });

      await result.current.mutateAsync({
        lockId: 'lock-1',
        reason: 'Resolving circular dependency',
      });

      const callArg = forceUnlockSpy.mock.calls[0][0];
      expect(callArg.reason).toBeDefined();
      expect(callArg.reason.length).toBeGreaterThan(0);
    });
  });

  describe('useReprioritizeMutation', () => {
    it('should reprioritize ticket', async () => {
      const mockResponse = {
        success: true,
        ticketId: 'ticket-1',
        oldPriority: 50,
        newPriority: 80,
      };

      vi.mocked(api.reprioritizeTicket).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useReprioritizeMutation(), { wrapper });

      await result.current.mutateAsync({
        ticketId: 'ticket-1',
        newPriority: 80,
        reason: 'Urgent fix needed',
      });

      expect(api.reprioritizeTicket).toHaveBeenCalledWith({
        ticketId: 'ticket-1',
        newPriority: 80,
        reason: 'Urgent fix needed',
      });
    });
  });

  describe('resourceManagerKeys', () => {
    it('should have correct query keys for cache invalidation', () => {
      expect(resourceManagerKeys.activeLocks).toEqual(['active-locks']);
      expect(resourceManagerKeys.dependencyGraph).toEqual(['dependency-graph']);
      expect(resourceManagerKeys.circularDependencies).toEqual(['circular-dependencies']);
    });
  });
});

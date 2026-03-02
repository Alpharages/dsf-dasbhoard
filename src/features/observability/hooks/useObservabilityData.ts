import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth, getAccessToken } from '@/contexts/AuthContext';
import type { SystemHealthDto, QueueMetricsDto, FileLockResponseDto, AIProvidersResponseDto } from '../types';
import {
  fetchSystemHealth,
  fetchQueueMetrics,
  fetchFileLocks,
  releaseFileLock,
  fetchAIProvidersStatus,
  toggleExecutionPause,
} from '../api/observability.api';

// Query keys for caching
const QUERY_KEYS = {
  systemHealth: ['system-health'] as const,
  queueMetrics: ['queue-metrics'] as const,
  fileLocks: ['file-locks'] as const,
  aiProviders: ['ai-providers'] as const,
};

// Polling interval (10 seconds fallback per AC#1)
const POLLING_INTERVAL = 10000;

// Real-time event names from backend
const SOCKET_EVENTS = {
  systemHealthUpdate: 'system-health-update',
  queueMetricsUpdate: 'queue-metrics-update',
  fileLocksUpdate: 'file-locks-update',
};

interface UseObservabilityDataOptions {
  /** Enable/disable polling (default: true) */
  pollingEnabled?: boolean;
  /** Polling interval in milliseconds (default: 10000) */
  pollingInterval?: number;
  /** Auth token for Socket.IO connection */
  token?: string | null;
}

interface UseObservabilityDataReturn {
  // Data
  systemHealth: SystemHealthDto | undefined;
  queueMetrics: QueueMetricsDto | undefined;
  fileLocks: FileLockResponseDto | undefined;
  aiProviders: AIProvidersResponseDto | undefined;
  
  // Loading states
  isSystemHealthLoading: boolean;
  isQueueMetricsLoading: boolean;
  isFileLocksLoading: boolean;
  isAiProvidersLoading: boolean;
  
  // Error states
  systemHealthError: Error | null;
  queueMetricsError: Error | null;
  fileLocksError: Error | null;
  aiProvidersError: Error | null;
  
  // Connection states
  isDisconnected: boolean;
  isSocketConnected: boolean;
  
  // Mutations
  releaseLock: (ticketId: string) => Promise<void>;
  isReleasingLock: boolean;
  togglePause: (paused: boolean) => Promise<void>;
  isTogglingPause: boolean;
  
  // Refetch functions
  refetchSystemHealth: () => void;
  refetchQueueMetrics: () => void;
  refetchFileLocks: () => void;
  refetchAiProviders: () => void;
}

/**
 * Hook to fetch and manage observability data
 * Implements AC#1, AC#2, AC#3 from the story:
 * - Polling fallback every 30 seconds
 * - Socket.IO real-time updates
 * - Error handling with disconnected booleans
 * - TanStack Query for state management
 */
export function useObservabilityData(
  options: UseObservabilityDataOptions = {}
): UseObservabilityDataReturn {
  const {
    pollingEnabled = true,
    pollingInterval = POLLING_INTERVAL,
  } = options;

  const { isAuthenticated } = useAuth();
  const token = options.token ?? (isAuthenticated ? getAccessToken() : null);

  const queryClient = useQueryClient();
  const { socket, connected: isSocketConnected } = useSocket(token);

  // ===================================================================
  // TanStack Query Data Fetching
  // ===================================================================

  const {
    data: systemHealth,
    isLoading: isSystemHealthLoading,
    error: systemHealthError,
    refetch: refetchSystemHealth,
  } = useQuery({
    queryKey: QUERY_KEYS.systemHealth,
    queryFn: fetchSystemHealth,
    refetchInterval: isSocketConnected ? false : pollingInterval,
    enabled: pollingEnabled,
    staleTime: pollingInterval / 2,
  });

  const {
    data: queueMetrics,
    isLoading: isQueueMetricsLoading,
    error: queueMetricsError,
    refetch: refetchQueueMetrics,
  } = useQuery({
    queryKey: QUERY_KEYS.queueMetrics,
    queryFn: fetchQueueMetrics,
    refetchInterval: isSocketConnected ? false : pollingInterval,
    enabled: pollingEnabled,
    staleTime: pollingInterval / 2,
  });

  const {
    data: fileLocks,
    isLoading: isFileLocksLoading,
    error: fileLocksError,
    refetch: refetchFileLocks,
  } = useQuery({
    queryKey: QUERY_KEYS.fileLocks,
    queryFn: fetchFileLocks,
    refetchInterval: isSocketConnected ? false : pollingInterval,
    enabled: pollingEnabled,
    staleTime: pollingInterval / 2,
  });

  const {
    data: aiProviders,
    isLoading: isAiProvidersLoading,
    error: aiProvidersError,
    refetch: refetchAiProviders,
  } = useQuery({
    queryKey: QUERY_KEYS.aiProviders,
    queryFn: fetchAIProvidersStatus,
    refetchInterval: pollingInterval, // Always poll AI providers status as it might not be through socket 
    enabled: pollingEnabled,
    staleTime: pollingInterval / 2,
  });

  // ===================================================================
  // Socket.IO Real-time Updates
  // ===================================================================

  useEffect(() => {
    if (!socket) return;

    // Listen for real-time system health updates
    socket.on(SOCKET_EVENTS.systemHealthUpdate, (data: SystemHealthDto) => {
      queryClient.setQueryData(QUERY_KEYS.systemHealth, data);
    });

    // Listen for real-time queue metrics updates
    socket.on(SOCKET_EVENTS.queueMetricsUpdate, (data: QueueMetricsDto) => {
      queryClient.setQueryData(QUERY_KEYS.queueMetrics, data);
    });

    // Listen for real-time file locks updates
    socket.on(SOCKET_EVENTS.fileLocksUpdate, (data: FileLockResponseDto) => {
      queryClient.setQueryData(QUERY_KEYS.fileLocks, data);
    });

    return () => {
      socket.off(SOCKET_EVENTS.systemHealthUpdate);
      socket.off(SOCKET_EVENTS.queueMetricsUpdate);
      socket.off(SOCKET_EVENTS.fileLocksUpdate);
    };
  }, [socket, queryClient]);

  // ===================================================================
  // File Lock Release Mutation
  // ===================================================================

  const releaseLockMutation = useMutation({
    mutationFn: releaseFileLock,
    onSuccess: () => {
      // Invalidate and refetch file locks after successful release
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fileLocks });
    },
  });

  const releaseLock = useCallback(
    async (ticketId: string) => {
      await releaseLockMutation.mutateAsync(ticketId);
    },
    [releaseLockMutation]
  );

  const togglePauseMutation = useMutation({
    mutationFn: toggleExecutionPause,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.aiProviders });
    },
  });

  const togglePause = useCallback(
    async (paused: boolean) => {
      await togglePauseMutation.mutateAsync(paused);
    },
    [togglePauseMutation]
  );

  // ===================================================================
  // Connection State
  // ===================================================================

  const isDisconnected = !isSocketConnected && !!systemHealthError;

  return {
    // Data
    systemHealth,
    queueMetrics,
    fileLocks,
    aiProviders,
    
    // Loading states
    isSystemHealthLoading,
    isQueueMetricsLoading,
    isFileLocksLoading,
    isAiProvidersLoading,
    
    // Error states
    systemHealthError,
    queueMetricsError,
    fileLocksError,
    aiProvidersError,
    
    // Connection states
    isDisconnected,
    isSocketConnected,
    
    // Mutations
    releaseLock,
    isReleasingLock: releaseLockMutation.isPending,
    togglePause,
    isTogglingPause: togglePauseMutation.isPending,
    
    // Refetch functions
    refetchSystemHealth: () => refetchSystemHealth(),
    refetchQueueMetrics: () => refetchQueueMetrics(),
    refetchFileLocks: () => refetchFileLocks(),
    refetchAiProviders: () => refetchAiProviders(),
  };
}

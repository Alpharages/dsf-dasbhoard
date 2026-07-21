/**
 * Executions Query Hooks
 * TanStack Query hooks for execution data fetching and caching
 */

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  type UseQueryOptions 
} from '@tanstack/react-query';
import { useAuth } from '@/contexts';
import { toast } from 'react-hot-toast';
import {
  getActiveExecutions,
  getExecutions,
  getExecution,
  getExecutionLogs,
  getExecutionActivities,
  getLatestExecutionActivities,
  pauseExecution,
  resumeExecution,
  emergencyStopExecution,
  controlExecution,
  exportExecutionLogs,
  retryExecution,
  type RetryExecutionResponse,
} from '@/api/executionsApi';
import type { 
  Execution, 
  ExecutionActivity,
  ExecutionLog,
  ExecutionFilters, 
  ActivityFilters,
  LogFilters,
  ExecutionControlResponse 
} from '@/types/execution';

// Query keys
export const executionKeys = {
  all: ['executions'] as const,
  active: () => [...executionKeys.all, 'active'] as const,
  recent: () => [...executionKeys.all, 'recent'] as const,
  activeFiltered: (filters: ExecutionFilters | undefined) => 
    [...executionKeys.active(), { filters }] as const,
  detail: (id: string) => [...executionKeys.all, 'detail', id] as const,
  logs: (id: string) => [...executionKeys.all, 'logs', id] as const,
  logsFiltered: (id: string, filters: LogFilters | undefined) => 
    [...executionKeys.logs(id), { filters }] as const,
  activities: (id: string) => [...executionKeys.all, 'activities', id] as const,
  activitiesFiltered: (id: string, filters: ActivityFilters | undefined) =>
    [...executionKeys.activities(id), { filters }] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook to fetch active executions
 */
export function useActiveExecutions(
  filters?: ExecutionFilters,
  options?: Omit<UseQueryOptions<Execution[], Error>, 'queryKey' | 'queryFn'>
) {
  const { user } = useAuth();
  return useQuery({
    queryKey: executionKeys.activeFiltered(filters),
    queryFn: () => getActiveExecutions(filters).then(r => r.executions),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Poll every 30s as fallback
    ...options,
    enabled: !!user,
  });
}

/**
 * Hook to fetch recent executions, including terminal history.
 */
export function useExecutions(
  options?: Omit<UseQueryOptions<Execution[], Error>, 'queryKey' | 'queryFn'>
) {
  const { user } = useAuth();
  return useQuery({
    queryKey: executionKeys.recent(),
    queryFn: () => getExecutions().then(r => r.executions),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    ...options,
    enabled: !!user,
  });
}

/**
 * Hook to fetch a single execution
 */
export function useExecution(
  executionId: string,
  options?: Omit<UseQueryOptions<Execution, Error>, 'queryKey' | 'queryFn'>
) {
  const { user } = useAuth();
  return useQuery({
    queryKey: executionKeys.detail(executionId),
    queryFn: () => getExecution(executionId),
    staleTime: 30 * 1000,
    ...options,
    enabled: !!executionId && !!user && (options?.enabled ?? true),
  });
}

/**
 * Hook to fetch execution logs
 */
export function useExecutionLogs(
  executionId: string,
  filters?: LogFilters,
  options?: Omit<UseQueryOptions<ExecutionLog[], Error>, 'queryKey' | 'queryFn'>
) {
  const { user } = useAuth();
  return useQuery({
    queryKey: executionKeys.logsFiltered(executionId, filters),
    queryFn: () => getExecutionLogs(executionId, filters).then(r => r.logs),
    staleTime: 60 * 1000, // 1 minute
    ...options,
    enabled: !!executionId && !!user,
  });
}

/**
 * Hook to fetch persisted execution activities (live activity timeline)
 */
export function useExecutionActivities(
  executionId: string,
  filters?: ActivityFilters,
  options?: Omit<UseQueryOptions<ExecutionActivity[], Error>, 'queryKey' | 'queryFn'>
) {
  const { user } = useAuth();
  return useQuery({
    queryKey: executionKeys.activitiesFiltered(executionId, filters),
    queryFn: () => getExecutionActivities(executionId, filters).then(r => r.activities),
    staleTime: 60 * 1000, // 1 minute
    ...options,
    enabled: !!executionId && !!user,
  });
}

/**
 * Hook to fetch latest N execution activities (for dashboard widget)
 */
export function useLatestExecutionActivities(
  executionId: string,
  limit = 20,
  options?: Omit<UseQueryOptions<ExecutionActivity[], Error>, 'queryKey' | 'queryFn'>
) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...executionKeys.activities(executionId), 'latest', limit] as const,
    queryFn: () => getLatestExecutionActivities(executionId, limit).then(r => r.activities),
    staleTime: 60 * 1000,
    ...options,
    enabled: !!executionId && !!user,
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook to pause an execution
 */
export function usePauseExecution() {
  const queryClient = useQueryClient();

  return useMutation<ExecutionControlResponse, Error, string>({
    mutationFn: pauseExecution,
    onSuccess: (data) => {
      toast.success(`Execution ${data.executionId} paused`);
      // Invalidate active executions to refresh the list
      queryClient.invalidateQueries({ queryKey: executionKeys.active() });
      // Invalidate specific execution
      queryClient.invalidateQueries({ 
        queryKey: executionKeys.detail(data.executionId) 
      });
    },
    onError: (error) => {
      toast.error(`Failed to pause execution: ${error.message}`);
    },
  });
}

/**
 * Hook to resume an execution
 */
export function useResumeExecution() {
  const queryClient = useQueryClient();

  return useMutation<ExecutionControlResponse, Error, string>({
    mutationFn: resumeExecution,
    onSuccess: (data) => {
      toast.success(`Execution ${data.executionId} resumed`);
      queryClient.invalidateQueries({ queryKey: executionKeys.active() });
      queryClient.invalidateQueries({ 
        queryKey: executionKeys.detail(data.executionId) 
      });
    },
    onError: (error) => {
      toast.error(`Failed to resume execution: ${error.message}`);
    },
  });
}

/**
 * Hook to emergency stop an execution
 */
export function useEmergencyStopExecution() {
  const queryClient = useQueryClient();

  return useMutation<ExecutionControlResponse, Error, string>({
    mutationFn: emergencyStopExecution,
    onSuccess: (data) => {
      toast.success(`Execution ${data.executionId} stopped`);
      queryClient.invalidateQueries({ queryKey: executionKeys.active() });
      queryClient.invalidateQueries({ 
        queryKey: executionKeys.detail(data.executionId) 
      });
    },
    onError: (error) => {
      toast.error(`Failed to stop execution: ${error.message}`);
    },
  });
}

/**
 * Hook to retry a terminal execution. On success the backend has dispatched a
 * fresh execution; refresh the list so it appears. `dispatched: false` is a
 * soft outcome (loop cap, still active, not retryable) — surface the reason.
 */
export function useRetryExecution() {
  const queryClient = useQueryClient();

  return useMutation<RetryExecutionResponse, Error, string>({
    mutationFn: retryExecution,
    onSuccess: (data) => {
      if (data.dispatched) {
        toast.success('Retry started');
        queryClient.invalidateQueries({ queryKey: executionKeys.recent() });
        queryClient.invalidateQueries({ queryKey: executionKeys.active() });
      } else {
        toast.error(`Retry not started: ${data.reason ?? 'unknown reason'}`);
      }
    },
    onError: (error) => {
      toast.error(`Failed to retry execution: ${error.message}`);
    },
  });
}

/**
 * Unified hook for execution control actions
 */
export function useControlExecution() {
  const queryClient = useQueryClient();

  return useMutation<
    ExecutionControlResponse, 
    Error, 
    { executionId: string; action: 'pause' | 'resume' | 'emergency-stop' }
  >({
    mutationFn: ({ executionId, action }) => controlExecution(executionId, action),
    onSuccess: (data, variables) => {
      const actionLabel = variables.action === 'emergency-stop' 
        ? 'stopped' 
        : `${variables.action}d`;
      toast.success(`Execution ${data.executionId} ${actionLabel}`);
      queryClient.invalidateQueries({ queryKey: executionKeys.active() });
      queryClient.invalidateQueries({ 
        queryKey: executionKeys.detail(data.executionId) 
      });
    },
    onError: (error, variables) => {
      toast.error(`Failed to ${variables.action} execution: ${error.message}`);
    },
  });
}

/**
 * Hook to export execution logs
 */
export function useExportExecutionLogs() {
  return useMutation<string, Error, string>({
    mutationFn: exportExecutionLogs,
    onSuccess: (data, executionId) => {
      // Create and download the file
      const blob = new Blob([data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `execution-${executionId}-logs.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Logs exported successfully');
    },
    onError: (error) => {
      toast.error(`Failed to export logs: ${error.message}`);
    },
  });
}

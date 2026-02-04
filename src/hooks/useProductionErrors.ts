/**
 * Production Errors Hooks
 * Story 9-U-5: Production Error Dashboard
 *
 * React Query hooks for production error data fetching.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getErrorOverview,
  getErrorList,
  getErrorDetail,
  getErrorTrends,
  getApplicationHealth,
  getApplications,
  bulkCreateTickets,
  acknowledgeError,
  exportErrors,
  trackErrorView,
  type ErrorListFilters,
  type ErrorOverview,
  type ErrorListResponse,
  type ErrorTrends,
  type ApplicationHealthResponse,
  type ErrorDetail,
  type BulkCreateTicketsResponse,
} from '@/api/production-errors';

// Query keys
export const productionErrorKeys = {
  all: ['production-errors'] as const,
  overview: () => [...productionErrorKeys.all, 'overview'] as const,
  list: (filters: ErrorListFilters) => [...productionErrorKeys.all, 'list', filters] as const,
  detail: (id: string) => [...productionErrorKeys.all, 'detail', id] as const,
  trends: (days: number) => [...productionErrorKeys.all, 'trends', days] as const,
  health: () => [...productionErrorKeys.all, 'health'] as const,
  applications: () => [...productionErrorKeys.all, 'applications'] as const,
};

/**
 * Hook to fetch error overview metrics
 */
export function useProductionErrorsOverview() {
  return useQuery<ErrorOverview>({
    queryKey: productionErrorKeys.overview(),
    queryFn: getErrorOverview,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook to fetch filtered error list
 */
export function useProductionErrors(filters: ErrorListFilters = {}) {
  return useQuery<ErrorListResponse>({
    queryKey: productionErrorKeys.list(filters),
    queryFn: () => getErrorList(filters),
    refetchInterval: 30000,
  });
}

/**
 * Hook to fetch single error detail
 */
export function useProductionErrorDetail(errorId: string | null) {
  return useQuery<ErrorDetail>({
    queryKey: productionErrorKeys.detail(errorId || ''),
    queryFn: () => getErrorDetail(errorId!),
    enabled: !!errorId,
  });
}

/**
 * Hook to fetch error trends
 */
export function useProductionErrorTrends(days: number = 7) {
  return useQuery<ErrorTrends>({
    queryKey: productionErrorKeys.trends(days),
    queryFn: () => getErrorTrends(days),
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Hook to fetch application health
 */
export function useApplicationHealth() {
  return useQuery<ApplicationHealthResponse>({
    queryKey: productionErrorKeys.health(),
    queryFn: getApplicationHealth,
    refetchInterval: 30000,
  });
}

/**
 * Hook to fetch applications list (for filters)
 */
export function useApplications() {
  return useQuery<string[]>({
    queryKey: productionErrorKeys.applications(),
    queryFn: getApplications,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Mutation hook for bulk creating tickets
 */
export function useBulkCreateTickets() {
  const queryClient = useQueryClient();

  return useMutation<BulkCreateTicketsResponse, Error, string[]>({
    mutationFn: bulkCreateTickets,
    onSuccess: () => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: productionErrorKeys.all });
    },
  });
}

/**
 * Mutation hook for acknowledging an error
 */
export function useAcknowledgeError() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { errorId: string; acknowledgedBy?: string }>({
    mutationFn: ({ errorId, acknowledgedBy }) => acknowledgeError(errorId, acknowledgedBy),
    onSuccess: (_, variables) => {
      // Invalidate the specific error detail and list
      queryClient.invalidateQueries({ 
        queryKey: productionErrorKeys.detail(variables.errorId) 
      });
      queryClient.invalidateQueries({ queryKey: productionErrorKeys.all });
    },
  });
}

/**
 * Mutation hook for exporting errors
 */
export function useExportErrors() {
  return useMutation<Blob, Error, string[] | undefined>({
    mutationFn: exportErrors,
  });
}

/**
 * Mutation hook for tracking error view (metrics)
 */
export function useTrackErrorView() {
  return useMutation<void, Error, string>({
    mutationFn: trackErrorView,
  });
}

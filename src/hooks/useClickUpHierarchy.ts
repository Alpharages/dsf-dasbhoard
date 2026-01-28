import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { HierarchyResponse } from '../types/integrations';

export * from '../types/integrations';

/**
 * Hook to fetch ClickUp hierarchy (Organizations > Spaces > Lists) for project import
 * Uses React Query for caching and automatic refetching
 */
export function useClickUpHierarchy(enabled: boolean = true, organizationId?: string) {
    return useQuery<HierarchyResponse>({
        queryKey: ['clickup-hierarchy', organizationId],
        queryFn: async () => {
            const params = organizationId ? { teamId: organizationId } : {};
            const response = await apiClient.get('/integrations/clickup/hierarchy', { params });
            return response.data;
        },
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2
    });
}

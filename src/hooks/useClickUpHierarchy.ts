import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

interface Space {
    id: string;
    name: string;
    lists?: ListItem[];
}

interface ListItem {
    id: string;
    name: string;
}

interface HierarchyResponse {
    spaces: Space[];
}

/**
 * Hook to fetch ClickUp hierarchy (Spaces > Lists) for project import
 * Uses React Query for caching and automatic refetching
 */
export function useClickUpHierarchy(enabled: boolean = true) {
    return useQuery<HierarchyResponse>({
        queryKey: ['clickup-hierarchy'],
        queryFn: async () => {
            const response = await apiClient.get('/integrations/clickup/hierarchy');
            return response.data;
        },
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2
    });
}

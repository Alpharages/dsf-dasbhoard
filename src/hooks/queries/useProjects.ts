/**
 * Projects Query Hooks
 * TanStack Query hooks for project data fetching
 */

import { 
  useQuery, 
  type UseQueryOptions 
} from '@tanstack/react-query';
import { getUserProjects } from '@/api/projectsApi';
import type { Project } from '@/types/project';

// Query keys
export const projectKeys = {
  all: ['projects'] as const,
  userProjects: () => [...projectKeys.all, 'user'] as const,
};

/**
 * Hook to fetch current user's projects
 */
export function useUserProjects(
  options?: Omit<UseQueryOptions<Project[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: projectKeys.userProjects(),
    queryFn: getUserProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes - projects don't change often
    ...options,
  });
}

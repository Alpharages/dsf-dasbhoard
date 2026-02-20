import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getGithubAccounts, type GitHubAccount } from '@/api/githubApi';

export const githubKeys = {
    all: ['github'] as const,
    accounts: () => [...githubKeys.all, 'accounts'] as const,
};

/**
 * Hook to fetch current user's connected GitHub accounts
 */
export function useGithubAccounts(
    options?: Omit<UseQueryOptions<GitHubAccount[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: githubKeys.accounts(),
        queryFn: getGithubAccounts,
        staleTime: 60 * 1000, // 1 minute
        ...options,
    });
}

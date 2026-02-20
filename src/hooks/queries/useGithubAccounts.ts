import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getGithubAccounts, getGithubRepos, type GitHubAccount, type GitHubRepo } from '@/api/githubApi';

export const githubKeys = {
    all: ['github'] as const,
    accounts: () => [...githubKeys.all, 'accounts'] as const,
    repos: (accountId: string) => [...githubKeys.all, 'repos', accountId] as const,
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

/**
 * Hook to fetch repositories for a specific GitHub account
 */
export function useGithubRepos(
    accountId: string | null,
    options?: Omit<UseQueryOptions<GitHubRepo[], Error>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: accountId ? githubKeys.repos(accountId) : [...githubKeys.all, 'repos', 'empty'],
        queryFn: () => (accountId ? getGithubRepos(accountId) : Promise.resolve([])),
        enabled: !!accountId && (options?.enabled !== false),
        staleTime: 60 * 1000, // 1 minute
        ...options,
    });
}

import api from './client';

export interface GitHubAccount {
    id: string;
    username: string;
    avatarUrl: string;
    installationId: string;
    updatedAt: string;
}

/**
 * Fetches connected GitHub accounts for the current user
 */
export async function getGithubAccounts(): Promise<GitHubAccount[]> {
    const { data } = await api.get('/github/accounts');
    return Array.isArray(data) ? data : (data?.data || []);
}

/**
 * Initiates the GitHub OAuth flow by getting the redirect URL
 */
export async function getGithubLoginUrl(): Promise<{ url: string }> {
    const { data } = await api.get('/github/auth/login');
    return data;
}

/**
 * Sends the GitHub OAuth callback code to the backend
 */
export async function saveGithubCallback(payload: { code?: string; error?: string; error_description?: string }): Promise<{ success: boolean; error?: string }> {
    const { data } = await api.post('/github/auth/callback', payload);
    return data;
}

export interface GitHubRepo {
  id: number;
  fullName: string;
  private: boolean;
  htmlUrl: string;
}

/**
 * Fetches repositories for a connected GitHub account
 */
export async function getGithubRepos(accountId: string): Promise<GitHubRepo[]> {
  const { data } = await api.get(`/github/accounts/${accountId}/repos`);
  return Array.isArray(data) ? data : (data?.data || []);
}

/**
 * Saves a selected GitHub repository to a project
 */
export async function saveProjectGithubRepo(
  projectId: string,
  payload: { githubAccountId: string; repositoryFullName: string }
): Promise<any> {
  const { data } = await api.patch(`/projects/${projectId}/github-repo`, payload);
  return data;
}

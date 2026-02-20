import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
    withCredentials: true,
});

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
    return data;
}

/**
 * Initiates the GitHub OAuth flow by getting the redirect URL
 */
export async function getGithubLoginUrl(): Promise<{ url: string }> {
    const { data } = await api.get('/github/auth/login');
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
  return data;
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

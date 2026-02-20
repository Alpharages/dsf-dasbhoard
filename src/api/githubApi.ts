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

import apiClient from './client';

export interface Project {
    id: string;
    name: string;
    key?: string;
    provider?: 'CLICKUP' | 'JIRA' | 'ASANA';
    monitor_tasks?: boolean;
    github_repository_url: string;
    status: string; // active, paused, etc.
    is_active?: boolean; // New field
}

export const projectsApi = {
    getProjects: async (): Promise<Project[]> => {
        const response = await apiClient.get('/projects');
        return response.data;
    },

    updateStatus: async (id: string, isActive: boolean): Promise<Project> => {
        const response = await apiClient.patch(`/projects/${id}/status`, { isActive });
        return response.data;
    },

    updateRepository: async (id: string, repositoryUrl: string): Promise<Project> => {
        const response = await apiClient.patch(`/projects/${id}/repository`, { repositoryUrl });
        return response.data;
    },

    syncProject: async (id: string): Promise<Project> => {
        const response = await apiClient.post(`/projects/${id}/sync`);
        return response.data;
    },

    deleteProject: async (id: string, force = false): Promise<void> => {
        await apiClient.delete(`/projects/${id}${force ? '?force=true' : ''}`);
    }
};

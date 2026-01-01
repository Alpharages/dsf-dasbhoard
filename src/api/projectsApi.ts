import apiClient from './client';

export interface Project {
    id: string;
    name: string;
    key?: string;
}

export const projectsApi = {
    getProjects: async (_token: string): Promise<Project[]> => {
        const response = await apiClient.get('/pm-dashboard/projects');
        return response.data;
    }
};

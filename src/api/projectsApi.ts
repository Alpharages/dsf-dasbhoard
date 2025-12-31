import axios from 'axios';

export interface Project {
    id: string;
    name: string;
    key?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const projectsApi = {
    getProjects: async (token: string): Promise<Project[]> => {
        const response = await axios.get(`${API_BASE_URL}/pm-dashboard/projects`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};

import apiClient from './client';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'USER';
}

export const userApi = {
    getUsers: async (role?: string): Promise<User[]> => {
        const params = role ? { role } : {};
        const response = await apiClient.get('/users', { params });
        return response.data;
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await apiClient.get('/users/me');
        return response.data;
    }
};

import apiClient from './client';
import type { GetUsersParams, UpdateUserRequest, User, UsersResponse } from '@/types/user';

export const usersApi = {
    getUsers: async (params: GetUsersParams): Promise<UsersResponse> => {
        // Filter out 'all' values to avoid sending them to API if backend expects omission
        const queryParams: Record<string, any> = { ...params };
        if (queryParams.role === 'all') delete queryParams.role;
        if (queryParams.isActive === 'all') delete queryParams.isActive;

        const response = await apiClient.get<UsersResponse>('/users', { params: queryParams });
        return response.data;
    },

    getUser: async (id: string): Promise<User> => {
        const response = await apiClient.get<User>(`/users/${id}`);
        return response.data;
    },

    updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
        const response = await apiClient.patch<User>(`/users/${id}`, data);
        return response.data;
    },

    deactivateUser: async (id: string): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    },
};

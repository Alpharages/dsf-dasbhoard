import apiClient from './client';
import type { LoginCredentials, LoginResponse } from '@/types/auth';

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    },

    changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
        const response = await apiClient.post<{ message: string }>('/auth/change-password', data);
        return response.data;
    },

    logout: async (refreshToken: string): Promise<{ message: string }> => {
        const response = await apiClient.post<{ message: string }>('/auth/logout', { refreshToken });
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    }
};

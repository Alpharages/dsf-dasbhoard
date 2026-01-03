import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper to get access token from storage
const getAccessToken = (): string | null => {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
};

// Helper to get refresh token from storage
const getRefreshToken = (): string | null => {
    return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
};

// Helper to redirect to login with returnUrl
const redirectToLogin = (returnUrl?: string) => {
    const url = returnUrl || window.location.pathname;
    window.location.href = `/login?returnUrl=${encodeURIComponent(url)}`;
};

// Track if we're currently refreshing to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

// Interceptor to add auth token to requests
apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor for error handling with token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized with token refresh attempt
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Queue the request while refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return apiClient(originalRequest);
                }).catch((err) => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                // No refresh token, redirect to login
                isRefreshing = false;
                redirectToLogin();
                return Promise.reject(error);
            }

            try {
                // Attempt to refresh the access token
                const response = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
                    refreshToken
                });

                const { accessToken } = response.data;

                // Update access token in storage
                const rememberMe = localStorage.getItem('refresh_token') !== null;
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('access_token', accessToken);

                // Update authorization header
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }

                processQueue(null);
                isRefreshing = false;

                // Retry the original request with new token
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                processQueue(error);
                isRefreshing = false;

                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                sessionStorage.removeItem('access_token');
                sessionStorage.removeItem('refresh_token');

                toast.error('Session expired. Please log in again.');
                redirectToLogin();
                return Promise.reject(refreshError);
            }
        }

        // Handle 403 Forbidden (permission denied)
        if (error.response?.status === 403) {
            toast.error("You don't have permission to access this resource");
        }

        return Promise.reject(error);
    }
);

export default apiClient;

import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add auth token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || 'dummy-token';
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle global errors like 401 Unauthorized
        if (error.response?.status === 401) {
            console.error('Unauthorized, redirecting to login...');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;

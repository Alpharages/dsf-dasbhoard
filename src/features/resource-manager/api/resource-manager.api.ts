import axios from 'axios';
import type { 
  FileLock, 
  DependencyGraph, 
  ForceUnlockRequest, 
  ReprioritizeRequest, 
  ReprioritizeResponse,
  CircularDependency 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getActiveLocks = async (): Promise<FileLock[]> => {
  const response = await apiClient.get<{locks: FileLock[], total: number}>('/file-locks');
  return response.data.locks;
};

export const getDependencyGraph = async (): Promise<DependencyGraph> => {
  const response = await apiClient.get<DependencyGraph>('/dependencies/graph');
  return response.data;
};

export const detectCircularDependencies = async (): Promise<CircularDependency[]> => {
  const response = await apiClient.get<CircularDependency[]>('/dependencies/circular');
  return response.data;
};

export const forceUnlock = async (request: ForceUnlockRequest): Promise<void> => {
  await apiClient.delete(`/locks/${request.lockId}`, {
    data: { reason: request.reason },
  });
};

export const reprioritizeTicket = async (request: ReprioritizeRequest): Promise<ReprioritizeResponse> => {
  const response = await apiClient.post<ReprioritizeResponse>('/queue/reprioritize', request);
  return response.data;
};

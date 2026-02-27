import apiClient from '@/api/client';
import type {
  FileLock,
  DependencyGraph,
  ForceUnlockRequest,
  ReprioritizeRequest,
  ReprioritizeResponse,
  CircularDependency,
} from '../types';

export const getActiveLocks = async (): Promise<FileLock[]> => {
  const response = await apiClient.get<{ locks: FileLock[]; total: number }>('/file-locks');
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
  await apiClient.delete(`/file-locks/${request.lockId}`, {
    data: { reason: request.reason },
  });
};

export const reprioritizeTicket = async (
  request: ReprioritizeRequest,
): Promise<ReprioritizeResponse> => {
  const response = await apiClient.post<ReprioritizeResponse>('/queue/reprioritize', request);
  return response.data;
};

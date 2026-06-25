import apiClient from '@/api/client';
import type {
  SystemHealthDto,
  QueueMetricsDto,
  FileLockResponseDto
} from '../types';

// ===================================================================
// Dashboard API Functions
// ===================================================================

/**
 * Fetch system health status
 * GET /api/v1/dashboard/system-health
 */
export async function fetchSystemHealth(): Promise<SystemHealthDto> {
  const response = await apiClient.get<SystemHealthDto>('/dashboard/system-health');
  return response.data;
}

/**
 * Fetch queue metrics
 * GET /api/v1/dashboard/queue-metrics
 */
export async function fetchQueueMetrics(): Promise<QueueMetricsDto> {
  const response = await apiClient.get<QueueMetricsDto>('/dashboard/queue-metrics');
  return response.data;
}

/**
 * Fetch file locks
 * GET /api/v1/dashboard/file-locks
 */
export async function fetchFileLocks(): Promise<FileLockResponseDto> {
  const response = await apiClient.get<FileLockResponseDto>('/dashboard/file-locks');
  return response.data;
}

/**
 * Release a file lock for a ticket
 * DELETE /api/v1/dashboard/file-locks/:ticketId
 */
export async function releaseFileLock(ticketId: string): Promise<void> {
  await apiClient.delete(`/dashboard/file-locks/${ticketId}`);
}


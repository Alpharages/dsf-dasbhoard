/**
 * Executions API Client
 * API calls for execution monitoring and control
 */

import apiClient from './client';
import type { 
  Execution, 
  ExecutionFilters, 
  LogFilters,
  ActiveExecutionsResponse,
  ExecutionLogsResponse,
  ExecutionControlResponse 
} from '@/types/execution';

const BASE_URL = '/executions';

/**
 * Get all active executions
 */
export async function getActiveExecutions(
  filters?: ExecutionFilters
): Promise<ActiveExecutionsResponse> {
  const params = new URLSearchParams();
  
  if (filters?.status?.length) {
    filters.status.forEach(s => params.append('status', s));
  }
  if (filters?.projectId) {
    params.append('projectId', filters.projectId);
  }
  if (filters?.aiProvider) {
    params.append('aiProvider', filters.aiProvider);
  }
  if (filters?.startTimeFrom) {
    params.append('startTimeFrom', filters.startTimeFrom);
  }
  if (filters?.startTimeTo) {
    params.append('startTimeTo', filters.startTimeTo);
  }

  const response = await apiClient.get(`${BASE_URL}/active?${params.toString()}`);
  return response.data;
}

/**
 * Get execution by ID
 */
export async function getExecution(executionId: string): Promise<Execution> {
  const response = await apiClient.get(`${BASE_URL}/${executionId}`);
  return response.data;
}

/**
 * Get execution logs
 */
export async function getExecutionLogs(
  executionId: string,
  filters?: LogFilters & { limit?: number; offset?: number }
): Promise<ExecutionLogsResponse> {
  const params = new URLSearchParams();
  
  if (filters?.level?.length) {
    filters.level.forEach(l => params.append('level', l));
  }
  if (filters?.timestampFrom) {
    params.append('timestampFrom', filters.timestampFrom);
  }
  if (filters?.timestampTo) {
    params.append('timestampTo', filters.timestampTo);
  }
  if (filters?.searchQuery) {
    params.append('search', filters.searchQuery);
  }
  if (filters?.limit) {
    params.append('limit', String(filters.limit));
  }
  if (filters?.offset) {
    params.append('offset', String(filters.offset));
  }

  const response = await apiClient.get(
    `${BASE_URL}/${executionId}/logs?${params.toString()}`
  );
  return response.data;
}

/**
 * Export execution logs as text
 */
export async function exportExecutionLogs(executionId: string): Promise<string> {
  const response = await apiClient.get(
    `${BASE_URL}/${executionId}/logs/export`,
    { responseType: 'text' }
  );
  return response.data;
}

/**
 * Pause an execution
 */
export async function pauseExecution(
  executionId: string
): Promise<ExecutionControlResponse> {
  const response = await apiClient.post(`${BASE_URL}/${executionId}/pause`);
  return response.data;
}

/**
 * Resume a paused execution
 */
export async function resumeExecution(
  executionId: string
): Promise<ExecutionControlResponse> {
  const response = await apiClient.post(`${BASE_URL}/${executionId}/resume`);
  return response.data;
}

/**
 * Emergency stop an execution
 */
export async function emergencyStopExecution(
  executionId: string
): Promise<ExecutionControlResponse> {
  const response = await apiClient.post(`${BASE_URL}/${executionId}/emergency-stop`);
  return response.data;
}

/**
 * Control execution (unified method)
 */
export async function controlExecution(
  executionId: string,
  action: 'pause' | 'resume' | 'emergency-stop'
): Promise<ExecutionControlResponse> {
  switch (action) {
    case 'pause':
      return pauseExecution(executionId);
    case 'resume':
      return resumeExecution(executionId);
    case 'emergency-stop':
      return emergencyStopExecution(executionId);
    default:
      throw new Error(`Unknown control action: ${action}`);
  }
}

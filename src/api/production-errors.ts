/**
 * Production Errors API
 * Story 9-U-5: Production Error Dashboard
 *
 * API functions for the production error dashboard.
 */

import apiClient from './client';

export type ErrorSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ErrorOverview {
  totalActiveErrors: number;
  newErrors24h: number;
  criticalErrors: number;
  highErrors: number;
  mediumErrors: number;
  lowErrors: number;
  mttrHours?: number;
}

export interface ErrorListItem {
  id: string;
  application: string;
  error_type: string;
  error_message: string;
  severity: ErrorSeverity;
  occurred_at: string;
  affected_users: number;
  occurrence_count: number;
  fix_ticket_id?: string;
  fix_ticket_url?: string;
  resolved: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
}

export interface ErrorListResponse {
  errors: ErrorListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorListFilters {
  severity?: ErrorSeverity[];
  application?: string[];
  status?: 'active' | 'ticket_created' | 'in_progress' | 'resolved';
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'severity' | 'occurred_at' | 'affected_users' | 'application';
  sortOrder?: 'asc' | 'desc';
}

export interface ErrorTrends {
  dates: string[];
  trendsBySeverity: {
    CRITICAL: number[];
    HIGH: number[];
    MEDIUM: number[];
    LOW: number[];
  };
}

export type HealthStatus = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

export interface ApplicationHealth {
  application: string;
  errorCount24h: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  healthStatus: HealthStatus;
  lastErrorAt?: string;
}

export interface ApplicationHealthResponse {
  applications: ApplicationHealth[];
}

export interface BulkCreateTicketsResponse {
  created: number;
  skipped: number;
  errors: string[];
}

export interface ErrorDetail extends ErrorListItem {
  stack_trace?: string;
  parsed_stack_trace?: {
    frames: Array<{
      function: string;
      filename: string;
      lineno: number;
      colno: number;
    }>;
  };
  user_context?: {
    user_ids: string[];
    session_ids: string[];
    user_agents: string[];
  };
  deployment_context?: {
    deployment_id: string;
    commit_sha: string;
    branch: string;
    deployed_at: string;
  };
  related_commits: Array<{
    sha: string;
    message: string;
    author: string;
    committed_at: string;
    github_url: string;
  }>;
}

// API Functions

export async function getErrorOverview(): Promise<ErrorOverview> {
  const response = await apiClient.get('/monitoring/errors/overview');
  return response.data;
}

export async function getErrorList(filters: ErrorListFilters = {}): Promise<ErrorListResponse> {
  const params = new URLSearchParams();
  
  if (filters.severity?.length) {
    filters.severity.forEach(s => params.append('severity', s));
  }
  if (filters.application?.length) {
    filters.application.forEach(a => params.append('application', a));
  }
  if (filters.status) {
    params.append('status', filters.status);
  }
  if (filters.dateFrom) {
    params.append('dateFrom', filters.dateFrom.toISOString());
  }
  if (filters.dateTo) {
    params.append('dateTo', filters.dateTo.toISOString());
  }
  if (filters.page) {
    params.append('page', filters.page.toString());
  }
  if (filters.limit) {
    params.append('limit', filters.limit.toString());
  }
  if (filters.sortBy) {
    params.append('sortBy', filters.sortBy);
  }
  if (filters.sortOrder) {
    params.append('sortOrder', filters.sortOrder);
  }

  const response = await apiClient.get(`/monitoring/errors?${params.toString()}`);
  return response.data;
}

export async function getErrorDetail(errorId: string): Promise<ErrorDetail> {
  const response = await apiClient.get(`/monitoring/errors/${errorId}`);
  return response.data;
}

export async function getErrorTrends(days: number = 7): Promise<ErrorTrends> {
  const response = await apiClient.get(`/monitoring/errors/trends?days=${days}`);
  return response.data;
}

export async function getApplicationHealth(): Promise<ApplicationHealthResponse> {
  const response = await apiClient.get('/monitoring/applications/health');
  return response.data;
}

export async function getApplications(): Promise<string[]> {
  const response = await apiClient.get('/monitoring/applications');
  return response.data;
}

export async function bulkCreateTickets(errorIds: string[]): Promise<BulkCreateTicketsResponse> {
  const response = await apiClient.post('/monitoring/errors/bulk-create-tickets', { errorIds });
  return response.data;
}

export async function acknowledgeError(errorId: string, acknowledgedBy?: string): Promise<void> {
  await apiClient.post(`/monitoring/errors/${errorId}/acknowledge`, { acknowledgedBy });
}

export async function trackErrorView(errorId: string): Promise<void> {
  await apiClient.post(`/monitoring/errors/${errorId}/view`);
}

export async function exportErrors(errorIds?: string[]): Promise<Blob> {
  const params = new URLSearchParams();
  if (errorIds?.length) {
    errorIds.forEach(id => params.append('ids', id));
  }
  
  const response = await apiClient.get(`/monitoring/errors/export?${params.toString()}`, {
    responseType: 'blob',
  });
  return response.data;
}

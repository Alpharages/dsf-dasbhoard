import apiClient from '@/api/client';
import type { AIDecisionLog, PaginatedResponse } from '../types';

export const getAuditTimeline = async (ticketId: string): Promise<AIDecisionLog[]> => {
  // The backend returns { ticketId, decisions, totalDecisions } — not a bare array.
  // Returning the wrapper object made the timeline call `logs.map` on a non-array,
  // crashing the page to a white screen. Normalize to the decisions array here so
  // the component can stay untouched (tolerate a bare array too, defensively).
  const response = await apiClient.get<{ decisions?: AIDecisionLog[] } | AIDecisionLog[]>(
    `/audit/timeline/${ticketId}`,
  );
  const data = response.data;
  if (Array.isArray(data)) return data;
  return data?.decisions ?? [];
};

export const getLowConfidenceAudits = async (
  minConfidence: number = 0.5,
  page: number = 1,
  limit: number = 50
): Promise<PaginatedResponse<AIDecisionLog>> => {
  const response = await apiClient.get<PaginatedResponse<AIDecisionLog>>(`/audit/low-confidence`, {
    params: { minConfidence, page, limit },
  });
  return response.data;
};

export interface AuditSearchFilters {
  agent_name?: string;
  action?: string;
  ticketId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const searchAudits = async (filters: AuditSearchFilters): Promise<PaginatedResponse<AIDecisionLog>> => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
  const response = await apiClient.get<PaginatedResponse<AIDecisionLog>>(`/audit/search`, {
    params,
  });
  return response.data;
};

export const requestRework = async (ticketId: string, reasoning: string): Promise<void> => {
  await apiClient.post(`/audit/rework`, { ticketId, reasoning });
};

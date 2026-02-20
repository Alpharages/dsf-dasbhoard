import apiClient from '@/api/client';
import type { AIDecisionLog, PaginatedResponse } from '../types';

export const getAuditTimeline = async (ticketId: string): Promise<AIDecisionLog[]> => {
  const response = await apiClient.get<AIDecisionLog[]>(`/audit/timeline/${ticketId}`);
  return response.data;
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
  const response = await apiClient.get<PaginatedResponse<AIDecisionLog>>(`/audit/search`, {
    params: filters,
  });
  return response.data;
};

export const requestRework = async (ticketId: string, reasoning: string): Promise<void> => {
  await apiClient.post(`/audit/rework`, { ticketId, reasoning });
};

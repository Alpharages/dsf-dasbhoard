/**
 * Tickets API Client
 * Listing tickets per project and dispatching them to execution manually
 * (for projects with `manual_dispatch` enabled).
 */

import apiClient from './client';

export interface TicketRow {
  id: string;
  clickup_task_id: string;
  name: string;
  project_id: string;
  project_name: string;
  /** DSF's internal lifecycle status */
  status: string;
  /** Status on the PM board — this is what decides which skill a manual run uses */
  provider_status: string | null;
  /** Branch this ticket's work branch forks from; null = the project default */
  base_branch: string | null;
  updated_at: string;
}

export interface TicketOptions {
  statuses: { name: string; color: string | null }[];
  branches: string[];
  defaultBranch: string;
}

export interface TicketPage {
  data: TicketRow[];
  pagination: { page: number; limit: number; total: number; total_pages: number };
}

export interface DispatchAck {
  accepted: number;
  ticketIds: string[];
}

/**
 * Reuses the PM-dashboard ticket search. Every filter is applied server-side —
 * a blank query lists everything in scope, and only one page is ever fetched.
 */
export async function listTickets(params: {
  projectId?: string;
  query?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<TicketPage> {
  const response = await apiClient.get<TicketPage>('/pm-dashboard/tickets/search', {
    params: {
      project_id: params.projectId,
      query: params.query || undefined,
      status: params.status || undefined,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
  });
  return response.data;
}

/** TicketStatus values, for the status filter. Mirrors the Prisma enum. */
export const TICKET_STATUSES = [
  'RECEIVED',
  'VALIDATED',
  'VALIDATION_FAILED',
  'QUEUED',
  'AI_PROCESSING',
  'QA_REVIEW',
  'QA_FAILED',
  'GITHUB_PUSH',
  'DEPLOYING',
  'DEPLOYED',
  'MONITORING',
  'FAILED',
  'COMPLETED',
  'BLOCKED_CIRCULAR',
  'WAITING',
  'AWAITING_DEPENDENCY_RELEASE',
  'WAITING_FOR_LOCKS',
  'AWAITING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'AWAITING_REWORK',
] as const;

/**
 * Send one or many tickets to execution. Single dispatch is just a one-element array.
 * Returns as soon as the runs are accepted — they start in the background, so watch
 * the Executions page (or the ticket status) for progress.
 */
export async function dispatchTickets(ticketIds: string[]): Promise<DispatchAck> {
  const response = await apiClient.post<DispatchAck>('/tickets/dispatch', { ticketIds });
  return response.data;
}

/** Board statuses + repo branches for a project's ticket editor, in one call. */
export async function getTicketOptions(projectId: string): Promise<TicketOptions> {
  const response = await apiClient.get<TicketOptions>('/tickets/options', {
    params: { project_id: projectId },
  });
  return response.data;
}

/**
 * Update a ticket's base branch and/or board status. A status change is written
 * through to ClickUp, so the two never drift apart.
 */
export async function updateTicket(
  ticketId: string,
  payload: { base_branch?: string; status?: string },
): Promise<TicketRow> {
  const response = await apiClient.patch<TicketRow>(`/tickets/${ticketId}`, payload);
  return response.data;
}

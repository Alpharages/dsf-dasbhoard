/**
 * PM Approval Hook
 * Data fetching and mutations for the PM Approval Dashboard
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts';
import apiClient from '../api/client';
import type {
  ApprovalExecution,
  ApprovalActionPayload,
  ApprovalActionResponse,
  ApprovalQueueSummary,
} from '../types/approval';
import { toast } from 'react-hot-toast';

const QUERY_KEYS = {
  approvalQueue: 'approval-queue',
  approvalSummary: 'approval-summary',
} as const;

export const useApprovals = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  /**
   * Fetch all executions awaiting approval
   */
  const useApprovalQueue = () => {
    return useQuery({
      queryKey: [QUERY_KEYS.approvalQueue],
      queryFn: async () => {
        const { data } = await apiClient.get('/executions/approval-gate/pending');
        return (data.data || data) as ApprovalExecution[];
      },
      refetchInterval: 30000, // Poll every 30 seconds (AC#3, was 15s)
      enabled: !!user,
    });
  };

  /**
   * Fetch summary stats for the approval queue
   */
  const useApprovalSummary = () => {
    return useQuery({
      queryKey: [QUERY_KEYS.approvalSummary],
      queryFn: async () => {
        try {
          const { data } = await apiClient.get('/pm-dashboard/summary');
          // Map dashboard summary to approval summary
          return {
            totalPending: data?.tickets?.awaiting_approval ?? 0,
            oldestPendingHours: 0,
            avgWaitTimeMinutes: 0,
            approvedToday: 0,
            rejectedToday: 0,
            reworkedToday: 0,
          } as ApprovalQueueSummary;
        } catch {
          return {
            totalPending: 0,
            oldestPendingHours: 0,
            avgWaitTimeMinutes: 0,
            approvedToday: 0,
            rejectedToday: 0,
            reworkedToday: 0,
          } as ApprovalQueueSummary;
        }
      },
      refetchInterval: 30000,
      enabled: !!user,
    });
  };

  /**
   * Submit approval decision (Approve/Reject/Rework/Escalate)
   */
  const useSubmitDecision = () => {
    return useMutation({
      mutationFn: async ({
        executionId,
        payload,
      }: {
        executionId: string;
        payload: ApprovalActionPayload;
      }) => {
        const { data } = await apiClient.post(
          `/executions/${executionId}/gate-decision`,
          payload,
        );
        return data as ApprovalActionResponse;
      },
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.approvalQueue] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.approvalSummary] });

        const decisionLabels: Record<string, string> = {
          APPROVE: '✅ Execution approved — PR merged',
          REJECT: '❌ Execution rejected',
          REWORK: '🔄 Execution sent for rework',
          ESCALATE: '⬆️ Execution escalated',
        };
        toast.success(decisionLabels[variables.payload.decision] || 'Decision submitted');
      },
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || 'Failed to submit decision');
      },
    });
  };

  return {
    useApprovalQueue,
    useApprovalSummary,
    useSubmitDecision,
  };
};

/**
 * PM Approval Hook
 * Data fetching and mutations for the PM Approval Dashboard
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type {
  ApprovalExecution,
  ApprovalDetailData,
  ApprovalActionPayload,
  ApprovalActionResponse,
  ApprovalQueueSummary,
} from '../types/approval';
import { toast } from 'react-hot-toast';

const QUERY_KEYS = {
  approvalQueue: 'approval-queue',
  approvalDetail: 'approval-detail',
  approvalSummary: 'approval-summary',
} as const;

export const useApprovals = () => {
  const queryClient = useQueryClient();

  /**
   * Fetch all executions awaiting approval
   */
  const useApprovalQueue = () => {
    return useQuery({
      queryKey: [QUERY_KEYS.approvalQueue],
      queryFn: async () => {
        const { data } = await apiClient.get('/executions/active', {
          params: { status: 'AWAITING_APPROVAL' },
        });
        return (data.executions || data.data || data) as ApprovalExecution[];
      },
      refetchInterval: 15000, // Poll every 15 seconds
    });
  };

  /**
   * Fetch detailed info for a specific execution (diffs, QA results, history)
   */
  const useApprovalDetail = (executionId: string | null) => {
    return useQuery({
      queryKey: [QUERY_KEYS.approvalDetail, executionId],
      queryFn: async () => {
        if (!executionId) return null;

        // Fetch execution details, QA results, and approval history in parallel
        const [executionRes, qaRes] = await Promise.allSettled([
          apiClient.get(`/executions/${executionId}`),
          apiClient.get(`/qa-results/${executionId}`),
        ]);

        const execution =
          executionRes.status === 'fulfilled'
            ? executionRes.value.data?.data || executionRes.value.data
            : null;

        const qaResult =
          qaRes.status === 'fulfilled'
            ? qaRes.value.data?.data || qaRes.value.data
            : null;

        // Build diffs from code_output or files_changed
        const diffs: ApprovalDetailData['diffs'] = [];
        if (execution?.filesChanged && Array.isArray(execution.filesChanged)) {
          execution.filesChanged.forEach((filePath: string) => {
            diffs.push({
              fileName: filePath,
              oldCode: '// Original file content not available',
              newCode: execution.codeOutput || '// Generated code',
              language: detectLanguage(filePath),
            });
          });
        }

        return {
          execution: execution as ApprovalExecution,
          diffs,
          approvalHistory: [],
          qaResult,
        } as ApprovalDetailData & { qaResult: unknown };
      },
      enabled: !!executionId,
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
          `/executions/${executionId}/approve`,
          payload,
        );
        return data as ApprovalActionResponse;
      },
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.approvalQueue] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.approvalSummary] });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.approvalDetail, variables.executionId],
        });

        const decisionLabels: Record<string, string> = {
          APPROVE: '✅ Execution approved — GitHub push triggered',
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
    useApprovalDetail,
    useApprovalSummary,
    useSubmitDecision,
  };
};

/**
 * Detect file language from extension
 */
function detectLanguage(filePath: string): string | undefined {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    go: 'go',
    rs: 'rust',
    java: 'java',
    css: 'css',
    html: 'html',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    sql: 'sql',
  };
  return ext ? map[ext] : undefined;
}

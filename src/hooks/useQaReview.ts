import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts';
import apiClient from '../api/client';
import type { QaReviewSample, QaSampleDetail, QaReviewDecision, QaWorkloadSummary } from '../types/qa-review';
import { toast } from 'react-hot-toast';

export const useQaReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const useQueue = (filters: Record<string, unknown> = {}) => {
    return useQuery({
      queryKey: ['qa-review-queue', filters],
      queryFn: async () => {
        const { data } = await apiClient.get('/qa-review/samples', { params: filters });
        return data.data as QaReviewSample[];
      },
      enabled: !!user,
    });
  };

  const useSampleDetail = (id: string | null) => {
    return useQuery({
      queryKey: ['qa-sample-detail', id],
      queryFn: async () => {
        if (!id) return null;
        const { data } = await apiClient.get(`/qa-review/samples/${id}`);
        return data.data as QaSampleDetail;
      },
      enabled: !!id && !!user,
    });
  };

  const useWorkloadSummary = (period: string = '30d') => {
    return useQuery({
      queryKey: ['qa-workload-summary', period],
      queryFn: async () => {
        const { data } = await apiClient.get('/qa-workload/summary', { params: { period } });
        return data as QaWorkloadSummary;
      },
      enabled: !!user,
    });
  };

  const useSubmitDecision = () => {
    return useMutation({
      mutationFn: async ({ id, decision }: { id: string; decision: QaReviewDecision }) => {
        const { data } = await apiClient.post(`/qa-review/samples/${id}/decision`, decision);
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['qa-review-queue'] });
        toast.success('Review decision submitted successfully');
      },
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || 'Failed to submit decision');
      },
    });
  };

  return {
    useQueue,
    useSampleDetail,
    useWorkloadSummary,
    useSubmitDecision,
  };
};

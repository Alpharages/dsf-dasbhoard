import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { architectureReviewApi } from '../api/architectureReviewApi';
import type { AdrQueueFilters } from '../types/architectureReview';
import { toast } from 'react-hot-toast';

export function useAdrQueue(filters: AdrQueueFilters) {
    const token = localStorage.getItem('token') || '';

    return useQuery({
        queryKey: ['adrQueue', filters],
        queryFn: () => architectureReviewApi.getAdrQueue(filters, token),
        staleTime: 30000, // 30s cache
        enabled: !!token
    });
}

export function useSubmitAdrReview() {
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token') || '';

    return useMutation({
        mutationFn: ({ adrId, action, notes }: { adrId: string, action: 'APPROVE' | 'REJECT' | 'MODIFY' | 'DEFER', notes?: string }) =>
            architectureReviewApi.submitAdrReview(adrId, action, notes, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adrQueue'] });
            toast.success('ADR review submitted successfully');
        },
        onError: (error: any) => {
            toast.error(`Failed to submit review: ${error.message || 'Unknown error'}`);
        }
    });
}

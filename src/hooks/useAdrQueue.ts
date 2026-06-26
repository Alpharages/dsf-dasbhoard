import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { architectureReviewApi } from '../api/architectureReviewApi';
import type { AdrQueueFilters } from '../types/architectureReview';
import { toast } from 'react-hot-toast';
import { getAccessToken } from '../contexts/AuthContext';

export function useAdrQueue(filters: AdrQueueFilters) {
    // Read via the shared accessor (checks both localStorage and sessionStorage);
    // reading localStorage directly left these queries disabled on a normal session-only login.
    const token = getAccessToken() || '';

    return useQuery({
        queryKey: ['adrQueue', filters],
        queryFn: () => architectureReviewApi.getAdrQueue(filters, token),
        staleTime: 30000, // 30s cache
        enabled: !!token
    });
}

export function useSubmitAdrReview() {
    const queryClient = useQueryClient();
    // Read via the shared accessor (checks both localStorage and sessionStorage);
    // reading localStorage directly left these queries disabled on a normal session-only login.
    const token = getAccessToken() || '';

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

export function useProvideGuidance() {
    const queryClient = useQueryClient();
    // Read via the shared accessor (checks both localStorage and sessionStorage);
    // reading localStorage directly left these queries disabled on a normal session-only login.
    const token = getAccessToken() || '';

    return useMutation({
        mutationFn: ({ adrId, guidance, applyGlobally, updateThresholds }: { adrId: string, guidance: string, applyGlobally: boolean, updateThresholds: boolean }) =>
            architectureReviewApi.provideGuidance(adrId, guidance, applyGlobally, updateThresholds, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adrQueue'] });
            toast.success('Guidance provided and retry triggered');
        },
        onError: (error: any) => {
            toast.error(`Failed to provide guidance: ${error.message || 'Unknown error'}`);
        }
    });
}

export function useDelegateReview() {
    const queryClient = useQueryClient();
    // Read via the shared accessor (checks both localStorage and sessionStorage);
    // reading localStorage directly left these queries disabled on a normal session-only login.
    const token = getAccessToken() || '';

    return useMutation({
        mutationFn: ({ adrId, architectId, notes }: { adrId: string, architectId: string, notes?: string }) =>
            architectureReviewApi.delegateReview(adrId, architectId, notes, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adrQueue'] });
            toast.success('Review delegated successfully');
        },
        onError: (error: any) => {
            toast.error(`Failed to delegate review: ${error.message || 'Unknown error'}`);
        }
    });
}

export function useEscalationMetrics() {
    // Read via the shared accessor (checks both localStorage and sessionStorage);
    // reading localStorage directly left these queries disabled on a normal session-only login.
    const token = getAccessToken() || '';

    return useQuery({
        queryKey: ['escalationMetrics'],
        queryFn: () => architectureReviewApi.getEscalationMetrics(token),
        staleTime: 60000, // 1 min cache
        enabled: !!token
    });
}

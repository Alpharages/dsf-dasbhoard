import { useQuery } from '@tanstack/react-query';
import { architectureReviewApi } from '../../api/architectureReviewApi';
import type { AdrMetricsFilters } from '../../types/architectureReview';

export function useAdrMetrics(filters: AdrMetricsFilters) {
    const token = localStorage.getItem('token') || '';

    return useQuery({
        queryKey: ['adrMetrics', filters],
        queryFn: () => architectureReviewApi.getMetrics(filters, token),
        enabled: !!token,
        refetchInterval: 60000 // 1 min refresh
    });
}

export function useAdrTrends(filters: AdrMetricsFilters) {
    const token = localStorage.getItem('token') || '';

    return useQuery({
        queryKey: ['adrTrends', filters],
        queryFn: () => architectureReviewApi.getTrends(filters, token),
        enabled: !!token,
        refetchInterval: 60000 // 1 min refresh
    });
}

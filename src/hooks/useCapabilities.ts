import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { capabilitiesApi } from '../api/capabilitiesApi';
import type { CreateLimitationDto, UpdateLimitationDto } from '../types/capabilities';

/**
 * Hook to fetch capability dashboard data
 */
export function useCapabilityDashboard() {
    const token = localStorage.getItem('token') || '';

    return useQuery({
        queryKey: ['capabilityDashboard'],
        queryFn: () => capabilitiesApi.getDashboard(token),
        staleTime: 60000, // 1 minute cache
        enabled: !!token,
    });
}

/**
 * Hook to create a new limitation
 */
export function useCreateLimitation() {
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token') || '';

    return useMutation({
        mutationFn: (data: CreateLimitationDto) =>
            capabilitiesApi.createLimitation(data, token),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['capabilityDashboard'] });
            toast.success(response.message || 'Limitation documented successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create limitation');
        }
    });
}

/**
 * Hook to update an existing limitation
 */
export function useUpdateLimitation() {
    const queryClient = useQueryClient();
    const token = localStorage.getItem('token') || '';

    return useMutation({
        mutationFn: ({ taskType, data }: { taskType: string; data: UpdateLimitationDto }) =>
            capabilitiesApi.updateLimitation(taskType, data, token),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['capabilityDashboard'] });
            toast.success(response.message || 'Limitation updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update limitation');
        }
    });
}

/**
 * Hook to fetch knowledge base markdown
 */
export function useKnowledgeBase() {
    const token = localStorage.getItem('token') || '';

    return useQuery({
        queryKey: ['knowledgeBase'],
        queryFn: () => capabilitiesApi.getKnowledgeBase(token),
        staleTime: 300000, // 5 minute cache
        enabled: !!token,
    });
}

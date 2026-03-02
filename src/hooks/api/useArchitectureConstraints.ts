import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { architectureReviewApi } from '../../api/architectureReviewApi';
import type { CreateConstraintDto, UpdateConstraintDto, ArchitectureConstraint } from '../../types/architectureConstraint';
import { toast } from 'react-hot-toast';
import { useAuth, getAccessToken } from '@/contexts/AuthContext';

function getAuthToken(): string {
    const token = getAccessToken();
    if (!token) {
        throw new Error('Authentication required. Please log in.');
    }
    return token;
}

export function useArchitectureConstraints(projectId?: string) {
    const { isAuthenticated } = useAuth();
    const token = getAccessToken();
    
    return useQuery({
        queryKey: ['architectureConstraints', projectId],
        queryFn: () => architectureReviewApi.getArchitectureConstraints(projectId, getAuthToken()),
        staleTime: 60000, // 60s cache
        enabled: isAuthenticated && !!token,
    });
}

export function useCreateConstraint() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateConstraintDto) => architectureReviewApi.createConstraint(data, getAuthToken()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['architectureConstraints'] });
            toast.success('✅ Constraint created successfully');
        },
        onError: (error: any) => {
            toast.error(`Failed to create constraint: ${error.message}`);
        }
    });
}

export function useUpdateConstraint() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateConstraintDto }) =>
            architectureReviewApi.updateConstraint(id, data, getAuthToken()),
        onSuccess: (result: ArchitectureConstraint) => {
            queryClient.invalidateQueries({ queryKey: ['architectureConstraints'] });
            toast.success(`✅ Constraint updated (v${result.version})`);
        },
        onError: (error: any) => {
            toast.error(`Failed to update constraint: ${error.message}`);
        }
    });
}

export function useDeleteConstraint() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => architectureReviewApi.deleteConstraint(id, getAuthToken()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['architectureConstraints'] });
            toast.success('✅ Constraint deleted');
        },
        onError: (error: any) => {
            toast.error(`Failed to delete constraint: ${error.message}`);
        }
    });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

interface ImportProjectRequest {
    provider: 'CLICKUP' | 'JIRA' | 'ASANA';
    resourceId: string;
    accountId?: string;
}

interface ImportProjectResponse {
    project: {
        id: string;
        name: string;
        provider: string;
        github_repository_url: string;
        monitor_tasks: boolean;
    };
    integrationCreated: boolean;
}

interface UseImportProjectOptions {
    onSuccess?: (data: ImportProjectResponse) => void;
    onError?: (error: any) => void;
}

/**
 * Hook to import a project from external provider (ClickUp, Jira, Asana)
 * Invalidates projects query on success to refetch the updated list
 */
export function useImportProject(options?: UseImportProjectOptions) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: ImportProjectRequest) => {
            const response = await apiClient.post('/projects/import', data);
            return response.data;
        },
        onSuccess: (data) => {
            // Invalidate projects query to refetch updated list
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            options?.onSuccess?.(data);
        },
        onError: (error) => {
            options?.onError?.(error);
        }
    });
}

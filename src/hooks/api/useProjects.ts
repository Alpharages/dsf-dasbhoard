import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../../api/projectsApi';

export function useProjects() {
    const token = localStorage.getItem('access_token') || '';

    return useQuery({
        queryKey: ['projects'],
        queryFn: () => projectsApi.getProjects(),
        enabled: !!token,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
}

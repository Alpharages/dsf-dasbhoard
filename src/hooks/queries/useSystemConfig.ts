import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { useEffect } from 'react';
import { useSocket } from '../useSocket';
import type { SystemConfig } from '@/types/config.ts';

export const useSystemConfig = () => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem('access_token');
    const { socket } = useSocket(token);

    // Real-time sync
    useEffect(() => {
        if (socket) {
            const handleUpdate = () => {
                queryClient.invalidateQueries({ queryKey: ['systemConfig'] });
            };

            socket.on('CONFIG_UPDATED', handleUpdate);

            return () => {
                socket.off('CONFIG_UPDATED', handleUpdate);
            };
        }
    }, [socket, queryClient]);

    const query = useQuery({
        queryKey: ['systemConfig'],
        queryFn: async () => {
            const { data } = await apiClient.get<SystemConfig[]>('/config');
            return data;
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (config: { key: string; value: string; description?: string; is_secret?: boolean }) => {
            const { data } = await apiClient.patch(`/config/${config.key}`, config);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['systemConfig'] });
        }
    });

    // Helper to get value by key
    const getValue = (key: string, defaultValue = ''): string => {
        if (!query.data) return defaultValue;
        const item = query.data.find(c => c.key === key);
        return item ? item.value : defaultValue;
    };

    return {
        ...query,
        updateConfig: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        getValue
    };
};

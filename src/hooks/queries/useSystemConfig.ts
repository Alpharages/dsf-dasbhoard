import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { SystemConfig } from '../../types/config';
import { useEffect } from 'react';
import { useSocket } from '../useSocket';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const useSystemConfig = () => {
    const token = localStorage.getItem('token');
    const queryClient = useQueryClient();
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
            const { data } = await axios.get<SystemConfig[]>(`${API_BASE_URL}/config`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (config: { key: string; value: string; description?: string; is_secret?: boolean }) => {
            const { data } = await axios.patch(`${API_BASE_URL}/config/${config.key}`, config, {
                headers: { Authorization: `Bearer ${token}` }
            });
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

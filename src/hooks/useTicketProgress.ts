import { useState, useEffect, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import type { Execution, ExecutionProgressPayload } from '../types';
import apiClient from '../api/client';

export const useTicketProgress = (
    socket: Socket | null,
    ticketId: string | null,
    executionId: string | null,
    isSocketConnected: boolean
) => {
    const [execution, setExecution] = useState<Partial<Execution> | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = useCallback(async () => {
        if (!executionId) return;

        try {
            const { data } = await apiClient.get(`/executions/${executionId}/status`);
            setExecution(data);
        } catch (err: any) {
            console.error('Polling error:', err);
            setError(err.message);
        }
    }, [executionId]);

    useEffect(() => {
        if (!socket || !ticketId) return;

        // Join ticket-specific room
        socket.emit('subscribe-to-ticket', ticketId);

        const handleProgress = (data: ExecutionProgressPayload) => {
            if (data.ticketId === ticketId) {
                setExecution((prev: Partial<Execution> | null) => ({
                    ...prev,
                    status: data.status,
                    updatedAt: data.timestamp,
                    provider: data.aiProvider,
                    // If percentage or message is added later
                }));
            }
        };

        const handleComplete = (data: { executionId: string; ticketId: string }) => {
            if (data.ticketId === ticketId) {
                setExecution((prev: Partial<Execution> | null) => ({
                    ...prev,
                    status: 'COMPLETED',
                    updatedAt: new Date().toISOString(),
                }));
            }
        };

        socket.on('execution-progress-update', handleProgress);
        socket.on('execution-completed', handleComplete);

        return () => {
            socket.off('execution-progress-update', handleProgress);
            socket.off('execution-completed', handleComplete);
        };
    }, [socket, ticketId]);

    // Polling fallback if socket is disconnected and we have an active execution
    useEffect(() => {
        let interval: any;

        if (!isSocketConnected && executionId && execution?.status !== 'COMPLETED' && execution?.status !== 'FAILED') {
            interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isSocketConnected, executionId, execution?.status, fetchStatus]);

    return { execution, loading: false, error, refetch: fetchStatus };
};

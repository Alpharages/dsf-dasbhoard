import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Socket } from 'socket.io-client';
import type { Project } from '../types';

export const useProjectUpdates = (
    socket: Socket | null,
    projectsQueryKey: readonly unknown[],
) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!socket) return;

        // Each updater returns undefined when the projects query has no cached list yet, which
        // makes setQueryData a no-op. Seeding `[]` instead would create a cache entry with a
        // fresh dataUpdatedAt, and the query's 60s staleTime would then skip its initial fetch.
        socket.on('project-updated', (updatedProject: Project) => {
            queryClient.setQueryData<Project[]>(projectsQueryKey, (prev) =>
                prev?.map((p) => (p.id === updatedProject.id ? updatedProject : p))
            );
        });

        socket.on('ticket-updated', (data: { project_id: string; tickets: Project['tickets'] }) => {
            queryClient.setQueryData<Project[]>(projectsQueryKey, (prev) =>
                prev?.map((p) =>
                    p.id === data.project_id ? { ...p, tickets: data.tickets } : p
                )
            );
        });

        // CS3-4: pm-sync-failed event — increment sync_pending count on affected project
        socket.on('pm-sync-failed', (data: {
            projectId: string;
            ticketId: string;
            provider: string;
            reason: string;
            missingFields: unknown[];
        }) => {
            queryClient.setQueryData<Project[]>(projectsQueryKey, (prev) =>
                prev?.map((p) =>
                    p.id === data.projectId
                        ? { ...p, tickets: { ...p.tickets, sync_pending: (p.tickets.sync_pending ?? 0) + 1 } }
                        : p
                )
            );
        });

        return () => {
            socket.off('project-updated');
            socket.off('ticket-updated');
            socket.off('pm-sync-failed');
        };
    }, [projectsQueryKey, queryClient, socket]);
};

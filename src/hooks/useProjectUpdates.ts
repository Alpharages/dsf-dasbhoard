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
        const onProjectUpdated = (updatedProject: Project) => {
            queryClient.setQueryData<Project[]>(projectsQueryKey, (prev) =>
                prev?.map((p) => (p.id === updatedProject.id ? updatedProject : p))
            );
        };

        const onTicketUpdated = (data: { project_id: string; tickets: Project['tickets'] }) => {
            queryClient.setQueryData<Project[]>(projectsQueryKey, (prev) =>
                prev?.map((p) =>
                    p.id === data.project_id ? { ...p, tickets: data.tickets } : p
                )
            );
        };

        // CS3-4: pm-sync-failed event — increment sync_pending count on affected project
        const onPmSyncFailed = (data: {
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
        };

        socket.on('project-updated', onProjectUpdated);
        socket.on('ticket-updated', onTicketUpdated);
        socket.on('pm-sync-failed', onPmSyncFailed);

        // Pass the handler to `off` — the one-arg form drops every listener for the event,
        // including the pm-sync-failed toast that Dashboard registers on the same socket.
        return () => {
            socket.off('project-updated', onProjectUpdated);
            socket.off('ticket-updated', onTicketUpdated);
            socket.off('pm-sync-failed', onPmSyncFailed);
        };
    }, [projectsQueryKey, queryClient, socket]);
};

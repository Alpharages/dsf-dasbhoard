import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import type { Project } from '../types';

export const useProjectUpdates = (
    socket: Socket | null,
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
) => {
    useEffect(() => {
        if (!socket) return;

        socket.on('project-updated', (updatedProject: Project) => {
            setProjects((prev) =>
                prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
            );
        });

        socket.on('ticket-updated', (data: { project_id: string; tickets: any }) => {
            setProjects((prev) =>
                prev.map((p) =>
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
            setProjects((prev) =>
                prev.map((p) =>
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
    }, [socket, setProjects]);
};

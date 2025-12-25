import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import type { Project } from '../types';

export const useProjectUpdates = (
    socket: Socket | null,
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>
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

        return () => {
            socket.off('project-updated');
            socket.off('ticket-updated');
        };
    }, [socket, setProjects]);
};

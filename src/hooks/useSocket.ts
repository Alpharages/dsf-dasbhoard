import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (token: string | null, namespace: string = '/dashboard') => {
    const socketRef = useRef<Socket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!token) return;

        const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
        const socket = io(`${WS_URL}${namespace}`, {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('Connected to dashboard namespace');
            setConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from dashboard namespace');
            setConnected(false);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, [token]);

    return { socket: socketRef.current, connected };
};

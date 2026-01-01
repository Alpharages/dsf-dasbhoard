import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../api/client';

export const useExecutionSocket = (token: string | null) => {
    const socketRef = useRef<Socket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!token) return;

        const socket = io(`${BASE_URL}/execution`, {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('Connected to execution namespace');
            setConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from execution namespace');
            setConnected(false);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, [token]);

    return { socket: socketRef.current, connected };
};

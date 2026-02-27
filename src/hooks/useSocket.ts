import { useSocketContext } from '../contexts/SocketContext';

const isDev = import.meta.env.DEV;

/**
 * Refactored useSocket hook to consume the centralized SocketContext.
 * This ensures that a single WebSocket connection is shared across all components.
 * AC#2: Given multiple components require real-time updates, only a single WebSocket
 * connection is established and shared.
 *
 * Note: `_namespace` is accepted for backward compatibility but only /dashboard is
 * supported via SocketContext. Multi-namespace support is not yet implemented (M-4).
 */
export const useSocket = (_token?: string | null, _namespace: string = '/dashboard') => {
    if (isDev && _namespace !== '/dashboard') {
        console.warn(`[useSocket] Namespace "${_namespace}" requested but SocketContext only supports /dashboard.`);
    }
    const { socket, connected } = useSocketContext();
    return { socket, connected };
};

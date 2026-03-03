import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth, getAccessToken } from './AuthContext';

const isDev = import.meta.env.DEV;

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
  isConnecting: boolean;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // H-1: Use state (not ref) so context consumers re-render when socket changes
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  // Initialize isConnecting to true if we already have a token so the UI shows
  // "Connecting…" instead of "Offline" during the brief window before the socket
  // effect runs and the WebSocket handshake completes.
  const [isConnecting, setIsConnecting] = useState(() => !!getAccessToken());
  // H-3: Track active token so we reconnect when it rotates via silent refresh
  const [token, setToken] = useState<string | null>(getAccessToken);

  // H-3: Re-read token on storage changes (cross-tab) or tokenRefreshed events (same-tab)
  useEffect(() => {
    const handleTokenChange = () => setToken(getAccessToken());
    window.addEventListener('storage', handleTokenChange);
    window.addEventListener('tokenRefreshed', handleTokenChange);
    return () => {
      window.removeEventListener('storage', handleTokenChange);
      window.removeEventListener('tokenRefreshed', handleTokenChange);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsConnecting(false);
      return;
    }

    const WS_URL = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';

    setIsConnecting(true);

    const newSocket = io(`${WS_URL}/dashboard`, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      isDev && console.log('[SocketContext] Connected to /dashboard');
      setConnected(true);
      setIsConnecting(false);
    });

    newSocket.on('connect_error', () => {
      setIsConnecting(false);
    });

    newSocket.on('disconnect', () => {
      isDev && console.log('[SocketContext] Disconnected');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      isDev && console.log('[SocketContext] Cleaning up socket');
      newSocket.disconnect();
      setSocket(null);
      setConnected(false);
      setIsConnecting(false);
    };
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket, connected, isConnecting }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};

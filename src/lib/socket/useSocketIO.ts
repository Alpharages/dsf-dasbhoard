import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ConnectionEvents, 
  RoomEvents, 
  RoomNames,
  ExecutionEvents,
  type ExecutionEventPayload,
  type ExecutionLogPayload,
  type ContainerActivityPayload,
  type NotificationPayload 
} from './socketEvents';

// Logger utility that can be disabled in production
const isDev = import.meta.env.DEV;
const logger = {
  log: (...args: unknown[]) => { if (isDev) console.log(...args); },
  error: (...args: unknown[]) => { if (isDev) console.error(...args); },
  warn: (...args: unknown[]) => { if (isDev) console.warn(...args); },
  debug: (...args: unknown[]) => { if (isDev) console.debug(...args); },
};

export interface SocketState {
  socket: Socket | null;
  connected: boolean;
  connecting: boolean;
  error: Error | null;
  reconnectAttempts: number;
}

export interface UseSocketIOOptions {
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  projectIds?: string[]; // Project IDs to join rooms for
}

/**
 * Enhanced Socket.IO hook with room subscription support
 * Handles authentication, room management, and connection state
 */
export function useSocketIO(options: UseSocketIOOptions = {}) {
  const { 
    autoConnect = true, 
    reconnectionAttempts = 5, 
    reconnectionDelay = 1000,
    projectIds: initialProjectIds = []
  } = options;
  
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const joinedRoomsRef = useRef<Set<string>>(new Set());
  
  const [state, setState] = useState<SocketState>({
    socket: null,
    connected: false,
    connecting: false,
    error: null,
    reconnectAttempts: 0,
  });

  // Initialize socket connection
  useEffect(() => {
    if (!autoConnect || !isAuthenticated || !user) {
      return;
    }

    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token) {
      setState(prev => ({ ...prev, error: new Error('No authentication token found') }));
      return;
    }

    setState(prev => ({ ...prev, connecting: true, error: null }));

    const WS_URL = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    const socket = io(`${WS_URL}`, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts,
      reconnectionDelay,
      transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on(ConnectionEvents.CONNECT, () => {
      logger.log('[Socket.IO] Connected to server');
      setState(prev => ({ 
        ...prev, 
        connected: true, 
        connecting: false, 
        error: null,
        reconnectAttempts: 0 
      }));
      
      // Join rooms based on user role and projects
      joinUserRooms(socket, user, initialProjectIds);
    });

    socket.on(ConnectionEvents.DISCONNECT, (reason) => {
      logger.log(`[Socket.IO] Disconnected: ${reason}`);
      setState(prev => ({ ...prev, connected: false }));
      joinedRoomsRef.current.clear();
    });

    socket.on(ConnectionEvents.CONNECT_ERROR, (error) => {
      logger.error('[Socket.IO] Connection error:', error);
      setState(prev => ({ 
        ...prev, 
        connected: false, 
        connecting: false, 
        error 
      }));
    });

    socket.on(ConnectionEvents.RECONNECT_ATTEMPT, (attemptNumber) => {
      logger.log(`[Socket.IO] Reconnection attempt ${attemptNumber}`);
      setState(prev => ({ ...prev, reconnectAttempts: attemptNumber }));
    });

    socket.on(ConnectionEvents.RECONNECT, (attemptNumber) => {
      logger.log(`[Socket.IO] Reconnected after ${attemptNumber} attempts`);
      setState(prev => ({ ...prev, reconnectAttempts: 0 }));
    });

    // Room event handlers
    socket.on(RoomEvents.ROOM_JOINED, ({ room }: { room: string }) => {
      logger.log(`[Socket.IO] Joined room: ${room}`);
      joinedRoomsRef.current.add(room);
    });

    socket.on(RoomEvents.ROOM_LEFT, ({ room }: { room: string }) => {
      logger.log(`[Socket.IO] Left room: ${room}`);
      joinedRoomsRef.current.delete(room);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      joinedRoomsRef.current.clear();
    };
  }, [autoConnect, isAuthenticated, user, reconnectionAttempts, reconnectionDelay]);

  // Join rooms based on user role and projects
  const joinUserRooms = useCallback((socket: Socket, userData: typeof user, projects: string[]) => {
    if (!userData) return;

    // User and Role rooms are auto-joined by backend on connection (RealtimeGateway.handleConnection)
    // No need to emit join events for them manually.

    // Join project rooms for user's projects
    if (projects.length > 0) {
      projects.forEach(projectId => {
        const room = RoomNames.project(projectId);
        if (!joinedRoomsRef.current.has(room)) {
          // Fix: Use specific 'joinProject' event with projectId payload
          socket.emit('joinProject', { projectId });
        }
      });
    }
  }, []);

  // Subscribe to an event
  const subscribe = useCallback(<T = unknown>(
    event: string,
    callback: (data: T) => void
  ) => {
    const socket = socketRef.current;
    if (!socket) {
      logger.warn(`[Socket.IO] Cannot subscribe to ${event}: socket not connected`);
      return () => {}; // Return no-op unsubscribe
    }

    socket.on(event, callback);
    
    return () => {
      socket.off(event, callback);
    };
  }, []);

  // Subscribe to multiple events at once
  const subscribeToEvents = useCallback(<T = unknown>(
    events: Record<string, (data: T) => void>
  ) => {
    const unsubscribers: (() => void)[] = [];
    
    Object.entries(events).forEach(([event, callback]) => {
      const unsubscribe = subscribe(event, callback);
      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [subscribe]);

  // Join a specific room
  const joinRoom = useCallback((room: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      logger.warn(`[Socket.IO] Cannot join room ${room}: socket not connected`);
      return false;
    }

    socket.emit(RoomEvents.JOIN_ROOM, { room });
    return true;
  }, []);

  // Leave a specific room
  const leaveRoom = useCallback((room: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      logger.warn(`[Socket.IO] Cannot leave room ${room}: socket not connected`);
      return false;
    }

    socket.emit(RoomEvents.LEAVE_ROOM, { room });
    return true;
  }, []);

  // Join project rooms (call this after fetching user's projects)
  const joinProjectRooms = useCallback((projectIds: string[]) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return false;

    projectIds.forEach(projectId => {
      const room = RoomNames.project(projectId);
      if (!joinedRoomsRef.current.has(room)) {
        // Fix: Use specific 'joinProject' event with projectId payload
        socket.emit('joinProject', { projectId });
      }
    });

    return true;
  }, []);

  // Check if connected to a specific room
  const isInRoom = useCallback((room: string): boolean => {
    return joinedRoomsRef.current.has(room);
  }, []);

  return {
    ...state,
    socket: socketRef.current,
    subscribe,
    subscribeToEvents,
    joinRoom,
    leaveRoom,
    joinProjectRooms,
    isInRoom,
    joinedRooms: Array.from(joinedRoomsRef.current),
  };
}

// ============================================================================
// Typed Event Subscriptions
// ============================================================================

/**
 * Subscribe to execution events with typed payloads
 * Includes debouncing for progress events to prevent API flooding
 */
export function useExecutionEvents(
  socket: Socket | null,
  handlers: {
    onStarted?: (payload: ExecutionEventPayload) => void;
    onProgress?: (payload: ExecutionEventPayload) => void;
    onCompleted?: (payload: ExecutionEventPayload) => void;
    onFailed?: (payload: ExecutionEventPayload) => void;
    onTimeout?: (payload: ExecutionEventPayload) => void;
    onCancelled?: (payload: ExecutionEventPayload) => void;
    onPaused?: (payload: ExecutionEventPayload) => void;
    onResumed?: (payload: ExecutionEventPayload) => void;
    onEmergencyStopped?: (payload: ExecutionEventPayload) => void;
  },
  options?: {
    progressDebounceMs?: number; // Debounce progress events (default: 500ms)
  }
) {
  const { progressDebounceMs = 500 } = options || {};
  
  // Store handlers in a ref to avoid effect re-runs when handlers change
  const handlersRef = useRef(handlers);
  
  // Update handlers ref on every render
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!socket) return;

    // Direct handling without debounce to debug the issue
    const handleProgress = (payload: ExecutionEventPayload) => {
      // logger.debug('[Socket.IO] Raw progress event:', payload.executionId, payload.percentComplete);
      if (handlersRef.current.onProgress) {
        handlersRef.current.onProgress(payload);
      }
    };

    const handleStarted = (payload: ExecutionEventPayload) => handlersRef.current.onStarted?.(payload);
    const handleCompleted = (payload: ExecutionEventPayload) => handlersRef.current.onCompleted?.(payload);
    const handleFailed = (payload: ExecutionEventPayload) => handlersRef.current.onFailed?.(payload);
    const handleTimeout = (payload: ExecutionEventPayload) => handlersRef.current.onTimeout?.(payload);
    const handleCancelled = (payload: ExecutionEventPayload) => handlersRef.current.onCancelled?.(payload);
    const handlePaused = (payload: ExecutionEventPayload) => handlersRef.current.onPaused?.(payload);
    const handleResumed = (payload: ExecutionEventPayload) => handlersRef.current.onResumed?.(payload);
    const handleEmergencyStopped = (payload: ExecutionEventPayload) => handlersRef.current.onEmergencyStopped?.(payload);

    socket.on('execution.started', handleStarted);
    socket.on('execution.progress', handleProgress);
    socket.on('execution.completed', handleCompleted);
    socket.on('execution.failed', handleFailed);
    socket.on('execution.timeout', handleTimeout);
    socket.on('execution.cancelled', handleCancelled);
    socket.on('execution.paused', handlePaused);
    socket.on('execution.resumed', handleResumed);
    socket.on('execution.emergency_stopped', handleEmergencyStopped);

    return () => {
      socket.off('execution.started', handleStarted);
      socket.off('execution.progress', handleProgress);
      socket.off('execution.completed', handleCompleted);
      socket.off('execution.failed', handleFailed);
      socket.off('execution.timeout', handleTimeout);
      socket.off('execution.cancelled', handleCancelled);
      socket.off('execution.paused', handlePaused);
      socket.off('execution.resumed', handleResumed);
      socket.off('execution.emergency_stopped', handleEmergencyStopped);
    };
  }, [socket, progressDebounceMs]); // handlers removed from dependency array
}

/**
 * Subscribe to log events with typed payloads
 */
export function useLogEvents(
  socket: Socket | null,
  onLog: (payload: ExecutionLogPayload) => void
) {
  useEffect(() => {
    if (!socket) return;

    socket.on('execution.log', onLog);
    return () => {
      socket.off('execution.log', onLog);
    };
  }, [socket, onLog]);
}

/**
 * Subscribe to container activity events (PM dashboard timeline)
 * These are human-readable, structured activity updates from inside the container
 */
export function useActivityEvents(
  socket: Socket | null,
  onActivity: (payload: ContainerActivityPayload) => void
) {
  useEffect(() => {
    if (!socket) return;

    socket.on(ExecutionEvents.ACTIVITY, onActivity);
    return () => {
      socket.off(ExecutionEvents.ACTIVITY, onActivity);
    };
  }, [socket, onActivity]);
}

/**
 * Subscribe to notification events with typed payloads
 */
export function useNotificationEvents(
  socket: Socket | null,
  handlers: {
    onNew?: (payload: NotificationPayload) => void;
    onRead?: (payload: { notificationId: string }) => void;
    onReadAll?: () => void;
  }
) {
  const { onNew, onRead, onReadAll } = handlers;
  
  useEffect(() => {
    if (!socket) return;

    if (onNew) socket.on('notification.new', onNew);
    if (onRead) socket.on('notification.read', onRead);
    if (onReadAll) socket.on('notification.read_all', onReadAll);

    return () => {
      if (onNew) socket.off('notification.new', onNew);
      if (onRead) socket.off('notification.read', onRead);
      if (onReadAll) socket.off('notification.read_all', onReadAll);
    };
  }, [socket, onNew, onRead, onReadAll]);
}

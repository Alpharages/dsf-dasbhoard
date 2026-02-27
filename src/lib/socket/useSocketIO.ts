import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { useSocketContext } from '@/contexts/SocketContext';
import { 
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
  /** @deprecated Connection lifecycle moved to SocketContext; always false */
  connecting: boolean;
  /** @deprecated Connection lifecycle moved to SocketContext; always null */
  error: Error | null;
  /** @deprecated Connection lifecycle moved to SocketContext; always 0 */
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
    projectIds: initialProjectIds = []
  } = options;
  
  const { user } = useAuth();
  const { socket: sharedSocket, connected: sharedConnected } = useSocketContext();
  const joinedRoomsRef = useRef<Set<string>>(new Set());
  
  const [state, setState] = useState<SocketState>({
    socket: sharedSocket,
    connected: sharedConnected,
    connecting: false,
    error: null,
    reconnectAttempts: 0,
  });

  // Sync state with shared socket
  useEffect(() => {
    setState(prev => ({
      ...prev,
      socket: sharedSocket,
      connected: sharedConnected
    }));
  }, [sharedSocket, sharedConnected]);

  // Room management for project rooms
  useEffect(() => {
    if (!sharedSocket || !sharedConnected || !user) {
      return;
    }

    // Join rooms based on user role and projects
    joinUserRooms(sharedSocket as Socket, user, initialProjectIds);

    // Initial project join
    if (initialProjectIds.length > 0) {
      initialProjectIds.forEach(projectId => {
        const room = RoomNames.project(projectId);
        if (!joinedRoomsRef.current.has(room)) {
          sharedSocket.emit('joinProject', { projectId });
          joinedRoomsRef.current.add(room); // M-1: track to prevent duplicate emits
        }
      });
    }

  }, [sharedSocket, sharedConnected, user, initialProjectIds]);

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
          socket.emit('joinProject', { projectId });
          joinedRoomsRef.current.add(room); // M-1: track to prevent duplicate emits
        }
      });
    }
  }, []);

  // Subscribe to an event
  const subscribe = useCallback(<T = unknown>(
    event: string,
    callback: (data: T) => void
  ) => {
    const socket = sharedSocket;
    if (!socket) {
      logger.warn(`[Socket.IO] Cannot subscribe to ${event}: socket not connected`);
      return () => {}; // Return no-op unsubscribe
    }

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [sharedSocket]); // H-2: include sharedSocket so stale null is not captured

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
    const socket = sharedSocket;
    if (!socket || !sharedConnected) {
      logger.warn(`[Socket.IO] Cannot join room ${room}: socket not connected`);
      return false;
    }

    socket.emit(RoomEvents.JOIN_ROOM, { room });
    joinedRoomsRef.current.add(room); // M-1: track joined room
    return true;
  }, [sharedSocket, sharedConnected]); // H-2: include live socket/connected state

  // Leave a specific room
  const leaveRoom = useCallback((room: string) => {
    const socket = sharedSocket;
    if (!socket || !sharedConnected) {
      logger.warn(`[Socket.IO] Cannot leave room ${room}: socket not connected`);
      return false;
    }

    socket.emit(RoomEvents.LEAVE_ROOM, { room });
    joinedRoomsRef.current.delete(room); // M-1: untrack on leave
    return true;
  }, [sharedSocket, sharedConnected]); // H-2: include live socket/connected state

  // Join project rooms (call this after fetching user's projects)
  const joinProjectRooms = useCallback((projectIds: string[]) => {
    const socket = sharedSocket;
    if (!socket || !sharedConnected) return false;

    projectIds.forEach(projectId => {
      const room = RoomNames.project(projectId);
      if (!joinedRoomsRef.current.has(room)) {
        socket.emit('joinProject', { projectId });
        joinedRoomsRef.current.add(room); // M-1: track to prevent duplicate emits
      }
    });

    return true;
  }, [sharedSocket, sharedConnected]); // H-2: include live socket/connected state

  // Check if connected to a specific room
  const isInRoom = useCallback((room: string): boolean => {
    return joinedRoomsRef.current.has(room);
  }, []);

  return {
    ...state,
    socket: sharedSocket,
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

/**
 * Socket.IO Event Types
 * Defines all event types used for real-time communication between backend and frontend
 */

// ============================================================================
// Execution Events
// ============================================================================

export const ExecutionEvents = {
  // Execution lifecycle events
  STARTED: 'execution.started',
  PROGRESS: 'execution.progress',
  COMPLETED: 'execution.completed',
  FAILED: 'execution.failed',
  TIMEOUT: 'execution.timeout',
  CANCELLED: 'execution.cancelled',
  
  // Control confirmation events
  PAUSED: 'execution.paused',
  RESUMED: 'execution.resumed',
  EMERGENCY_STOPPED: 'execution.emergency_stopped',
  
  // Log streaming events
  LOG: 'execution.log',
  
  // Container activity events (PM dashboard)
  ACTIVITY: 'execution-activity',

  // QA failure state (WR-4.1 backend, FE-1.1 frontend)
  QA_FAILED: 'execution.qa_failed',
} as const;

export type ExecutionEventType = typeof ExecutionEvents[keyof typeof ExecutionEvents];

// ============================================================================
// Notification Events
// ============================================================================

export const NotificationEvents = {
  NEW: 'notification.new',
  READ: 'notification.read',
  READ_ALL: 'notification.read_all',
} as const;

export type NotificationEventType = typeof NotificationEvents[keyof typeof NotificationEvents];

// ============================================================================
// Connection Events
// ============================================================================

export const ConnectionEvents = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
  RECONNECT_ATTEMPT: 'reconnect_attempt',
} as const;

// ============================================================================
// Room Events
// ============================================================================

export const RoomEvents = {
  JOIN_ROOM: 'joinRoom',
  LEAVE_ROOM: 'leaveRoom',
  ROOM_JOINED: 'room_joined',
  ROOM_LEFT: 'room_left',
} as const;

// ============================================================================
// Event Payload Types
// ============================================================================

export interface ExecutionEventPayload {
  executionId: string;
  ticketId: string;
  projectId: string | null;
  status: 'QUEUED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'TIMEOUT' | 'CANCELLED' | 'AWAITING_APPROVAL' | 'QA_FAILED';
  currentStep?: string;
  percentComplete?: number;
  errorMessage?: string;
  aiProvider?: string;
  startedAt?: string;
  provider?: string;
  timestamp?: string;
  lastUpdated?: string;
  payload?: Record<string, unknown>;
  progress?: {
    currentStep: string;
    percentComplete: number;
  };
  metadata?: {
    projectName?: string;
    aiProvider?: string;
    startTime?: string;
    duration?: number;
  };
}

/** Payload emitted with the 'execution.qa_failed' WebSocket event (FE-1.1) */
export interface QAFailedEventPayload {
  executionId: string;
  ticketId: string;
  projectId: string | null;
  provider: string;
  status: string; // always 'QA_FAILED'
  timestamp: string;
  payload: {
    errorMessage: string;
    branchName: string | null;
    qaRetryCount?: number;
  };
}

export interface ExecutionLogPayload {
  executionId: string;
  ticketId: string | null;
  message: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'STDOUT' | 'STDERR';
  source?: string;
  projectId?: string | null;
}

export type ActivityCategory =
  | 'SETUP'
  | 'DEPENDENCY'
  | 'GIT'
  | 'AI_THINKING'
  | 'AI_CODING'
  | 'BUILD'
  | 'TEST'
  | 'LINT'
  | 'FILE_OP'
  | 'DEPLOY'
  | 'ERROR'
  | 'SYSTEM';

export interface ContainerActivityPayload {
  executionId: string;
  ticketId: string;
  timestamp: string;
  activity: string;
  detail?: string;
  rawContent?: string;
  category: ActivityCategory;
  icon: string;
  suggestedPercent?: number;
  projectId?: string | null;
}

export interface NotificationPayload {
  notificationId: string;
  title: string;
  message: string;
  eventType: string;
  channels: ('slack' | 'email' | 'in_app')[];
  createdAt: string;
  read: boolean;
}

export interface JoinRoomPayload {
  room: string;
}

// ============================================================================
// Room Name Helpers
// ============================================================================

export const RoomNames = {
  role: (role: string): string => `role:${role}`,
  project: (projectId: string): string => `project:${projectId}`,
  user: (userId: string): string => `user:${userId}`,
} as const;

/**
 * Notification Types
 * Type definitions for notification preferences and in-app notifications
 */

export type NotificationChannel = 'slack' | 'email' | 'in_app';

export type NotificationEventType = 
  | 'execution.started'
  | 'execution.completed'
  | 'execution.failed'
  | 'execution.paused'
  | 'execution.resumed'
  | 'execution.timeout'
  | 'execution.cancelled'
  | 'quality_gate.failed'
  | 'quality_gate.passed'
  | 'approval.required'
  | 'deployment.completed'
  | 'error.production';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface NotificationPreference {
  id: string;
  userId: string;
  eventType: NotificationEventType;
  channels: NotificationChannel[];
  enabled: boolean;
  filters?: {
    projectIds?: string[];
    severities?: SeverityLevel[];
    providers?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  eventType: NotificationEventType;
  channels: NotificationChannel[];
  metadata?: {
    executionId?: string;
    projectId?: string;
    ticketId?: string;
    [key: string]: unknown;
  };
  read: boolean;
  createdAt: string;
}

export interface NotificationPreferencesResponse {
  preferences: NotificationPreference[];
}

export interface InAppNotificationsResponse {
  notifications: InAppNotification[];
  unreadCount: number;
  total: number;
}

export interface CreatePreferenceRequest {
  eventType: NotificationEventType;
  channels: NotificationChannel[];
  enabled: boolean;
  filters?: {
    projectIds?: string[];
    severities?: SeverityLevel[];
    providers?: string[];
  };
}

export interface UpdatePreferenceRequest {
  channels?: NotificationChannel[];
  enabled?: boolean;
  filters?: {
    projectIds?: string[];
    severities?: SeverityLevel[];
    providers?: string[];
  };
}

export interface MarkAsReadResponse {
  success: boolean;
  notificationId: string;
}

export interface MarkAllAsReadResponse {
  success: boolean;
  count: number;
}

// Available event types for selection
export const AVAILABLE_EVENT_TYPES: { value: NotificationEventType; label: string }[] = [
  { value: 'execution.started', label: 'Execution Started' },
  { value: 'execution.completed', label: 'Execution Completed' },
  { value: 'execution.failed', label: 'Execution Failed' },
  { value: 'execution.paused', label: 'Execution Paused' },
  { value: 'execution.resumed', label: 'Execution Resumed' },
  { value: 'execution.timeout', label: 'Execution Timeout' },
  { value: 'execution.cancelled', label: 'Execution Cancelled' },
  { value: 'quality_gate.failed', label: 'Quality Gate Failed' },
  { value: 'quality_gate.passed', label: 'Quality Gate Passed' },
  { value: 'approval.required', label: 'Approval Required' },
  { value: 'deployment.completed', label: 'Deployment Completed' },
  { value: 'error.production', label: 'Production Error' },
];

// Available channels
export const AVAILABLE_CHANNELS: { value: NotificationChannel; label: string; icon: string }[] = [
  { value: 'slack', label: 'Slack', icon: 'MessageSquare' },
  { value: 'email', label: 'Email', icon: 'Mail' },
  { value: 'in_app', label: 'In-App', icon: 'Bell' },
];

// Severity levels
export const SEVERITY_LEVELS: { value: SeverityLevel; label: string; color: string }[] = [
  { value: 'LOW', label: 'Low', color: 'text-blue-400' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-400' },
  { value: 'HIGH', label: 'High', color: 'text-orange-400' },
  { value: 'CRITICAL', label: 'Critical', color: 'text-red-400' },
];

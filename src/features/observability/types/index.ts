// ===================================================================
// AC#1: System Health DTOs
// ===================================================================

export type ComponentStatus = 'up' | 'degraded' | 'down';

export interface ComponentHealthDto {
  status: ComponentStatus;
  latency_ms: number;
  details?: Record<string, unknown>;
}

export interface SystemHealthDto {
  status: ComponentStatus;
  components: {
    database: ComponentHealthDto;
    rabbitmq: ComponentHealthDto;
    prometheus: ComponentHealthDto;
  };
  uptime_seconds: number;
}

// ===================================================================
// AC#2: Queue Metrics DTOs
// ===================================================================

export interface QueueMetricDto {
  depth: number;
  rate: number; // tickets per hour
  oldest_message_age_seconds: number;
}

export type QueueName = 'ai-execution-queue' | 'qa-check-queue' | 'deployment-queue';

export interface QueueMetricsDto {
  'ai-execution-queue': QueueMetricDto;
  'qa-check-queue': QueueMetricDto;
  'deployment-queue': QueueMetricDto;
}

// ===================================================================
// AC#3: File Lock DTOs
// ===================================================================

export interface WaitingTicketDto {
  ticket_id: string;
  requested_at: Date;
  wait_time_seconds: number;
}

export interface FileLockDto {
  file_path: string;
  locked_by_ticket_id: string;
  locked_at: Date;
  waiting_count: number;
  waiting_tickets: WaitingTicketDto[];
}

export interface FileLockResponseDto {
  locks: FileLockDto[];
}

// ===================================================================
// UI Types
// ===================================================================

export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'disconnected';

export interface HealthIndicatorProps {
  label: string;
  status: HealthStatus;
  latency?: number;
  details?: string;
}

export interface QueueAlertConfig {
  depthThreshold: number;
  ageThresholdSeconds: number;
}

export interface FileLockWithConflict extends FileLockDto {
  hasConflict: boolean;
}

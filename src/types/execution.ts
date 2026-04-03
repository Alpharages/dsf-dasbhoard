/**
 * Execution Types
 * Type definitions for AI execution monitoring and control
 */

export type ExecutionStatus = 
  | 'QUEUED' 
  | 'IN_PROGRESS' 
  | 'PAUSED' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'TIMEOUT' 
  | 'CANCELLED'
  | 'AWAITING_APPROVAL'
  | 'QA_FAILED'; // FE-1.1: hard QA failure state (WR-4.1)

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'STDOUT' | 'STDERR';

export interface Execution {
  id: string;
  ticketId: string;
  projectId: string;
  projectName: string;
  status: ExecutionStatus;
  aiProvider: string;
  currentStep: string;
  percentComplete: number;
  startTime: string;
  duration: number; // in seconds
  errorMessage?: string;
  qaRetryCount?: number;           // FE-1.1: populated from execution.qa_failed event
  qaFailedBranch?: string | null;  // FE-1.1: branch name for PM resolution (FE-1.2)
  metadata?: Record<string, unknown>;
}

export interface ExecutionLog {
  id: string;
  executionId: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source?: string;
}

export interface ExecutionControlResponse {
  success: boolean;
  message: string;
  executionId: string;
  newStatus: ExecutionStatus;
}

export interface ActiveExecutionsResponse {
  executions: Execution[];
  total: number;
}

export interface ExecutionLogsResponse {
  logs: ExecutionLog[];
  total: number;
  hasMore: boolean;
}

export interface ExecutionFilters {
  status?: ExecutionStatus[];
  projectId?: string;
  aiProvider?: string;
  startTimeFrom?: string;
  startTimeTo?: string;
}

export interface LogFilters {
  level?: LogLevel[];
  timestampFrom?: string;
  timestampTo?: string;
  searchQuery?: string;
}

// Execution activity (persisted live activity event)
export interface ExecutionActivity {
  id: string;
  executionId: string;
  activity: string;
  detail?: string | null;
  rawContent?: string | null;
  category: string;
  icon: string;
  suggestedPercent?: number | null;
  timestamp: string;
}

export interface ExecutionActivitiesResponse {
  activities: ExecutionActivity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ActivityFilters {
  category?: string[];
  page?: number;
  limit?: number;
}

// Control action types
export type ControlAction = 'pause' | 'resume' | 'emergency-stop';

export interface ControlButtonConfig {
  action: ControlAction;
  label: string;
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon: string;
  showFor: ExecutionStatus[];
  requirePermission: boolean;
}

/** Response from POST /executions/:id/resolve-qa-failure (FE-1.2) */
export interface QAResolutionResult {
  action: 'open_pr' | 'cancel';
  prUrl?: string;
  prNumber?: number;
  branchName?: string | null;
}

// Control button visibility matrix
export const CONTROL_BUTTON_MATRIX: Record<ExecutionStatus, ControlAction[]> = {
  'QUEUED': ['emergency-stop'],
  'IN_PROGRESS': ['pause', 'emergency-stop'],
  'PAUSED': ['resume', 'emergency-stop'],
  'AWAITING_APPROVAL': ['emergency-stop'],
  'COMPLETED': [],
  'FAILED': [],
  'TIMEOUT': [],
  'CANCELLED': [],
  'QA_FAILED': [], // FE-1.1: terminal-ish state pending PM action
};

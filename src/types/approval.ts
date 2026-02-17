/**
 * PM Approval Types
 * Type definitions for PM Approval Dashboard
 */

export type ApprovalDecision = 'APPROVE' | 'REJECT' | 'REWORK' | 'ESCALATE';

export interface ApprovalExecution {
  id: string;
  ticketId: string;
  ticketTitle: string;
  ticketDescription: string | null;
  projectId: string | null;
  projectName: string | null;
  status: 'AWAITING_APPROVAL';
  aiProvider: string;
  confidenceScore: number | null;
  complexityScore: number | null;
  filesChanged: string[];
  codeOutput: string | null;
  retryCount: number;
  startedAt: string;
  updatedAt: string;
  durationMs: number;
  qaResult: ApprovalQaResult | null;
}

export interface ApprovalQaResult {
  linting_passed: boolean;
  tests_passed: boolean;
  test_coverage: number | null;
  security_score: number | null;
  overall_passed: boolean;
}

export interface ApprovalDetailData {
  execution: ApprovalExecution;
  diffs: ApprovalDiff[];
  approvalHistory: ApprovalRecord[];
}

export interface ApprovalDiff {
  fileName: string;
  oldCode: string;
  newCode: string;
  language?: string;
}

export interface ApprovalRecord {
  id: string;
  executionId: string;
  pmId: string;
  pmName?: string;
  decision: ApprovalDecision;
  reasoning: string | null;
  createdAt: string;
}

export interface ApprovalActionPayload {
  decision: ApprovalDecision;
  reasoning?: string;
}

export interface ApprovalActionResponse {
  success: boolean;
  status: string;
}

export interface ApprovalQueueSummary {
  totalPending: number;
  oldestPendingHours: number;
  avgWaitTimeMinutes: number;
  approvedToday: number;
  rejectedToday: number;
  reworkedToday: number;
}

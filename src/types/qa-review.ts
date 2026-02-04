export type QaReviewStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
export const QaReviewStatus = {
  PENDING: 'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export const RiskLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export type SamplingStrategy = 'RANDOM' | 'RISK_BASED' | 'NEW_PROVIDER' | 'MANUAL';
export const SamplingStrategy = {
  RANDOM: 'RANDOM',
  RISK_BASED: 'RISK_BASED',
  NEW_PROVIDER: 'NEW_PROVIDER',
  MANUAL: 'MANUAL',
} as const;

export interface QaReviewSample {
  id: string;
  ticket_id: string;
  execution_id: string;
  project_id: string | null;
  project_name?: string;
  status: QaReviewStatus;
  risk_level: RiskLevel;
  risk_factors: Record<string, unknown>;
  sampling_strategy: SamplingStrategy;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  ai_quality_score?: number;
  ticket_title?: string;
  ticket_description?: string;
}

export interface QaReviewDecision {
  decision: 'APPROVED' | 'REJECTED';
  severity?: 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR';
  remediation_guidance?: string;
  notes?: string;
}

export interface CodeDiff {
  fileName: string;
  oldCode: string;
  newCode: string;
  language?: string;
}

export interface QaSampleDetail extends QaReviewSample {
  diffs: CodeDiff[];
  qa_summary: {
    linting_passed: boolean;
    tests_passed: boolean;
    test_coverage: number;
    security_score: number;
    quality_score: number;
  };
}

export interface QaWorkloadSummary {
  period: string;
  summary: {
    total_reviews_completed: number;
    total_reviews_pending: number;
    reviews_by_decision: {
      approved: number;
      rejected: number;
      escalated: number;
    };
    avg_review_time_minutes: number;
    sla_compliance_percent: number;
  };
  queue_health: {
    current_depth: number;
    oldest_pending_hours: number;
    at_risk_count: number;
    trend: 'improving' | 'stable' | 'declining';
  };
}

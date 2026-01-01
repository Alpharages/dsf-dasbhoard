export interface AdrQueueFilters {
    risk_level?: 'HIGH' | 'MEDIUM' | 'LOW';
    project_id?: string;
    min_confidence?: number;
    max_confidence?: number;
    sort_by?: 'risk_level' | 'created_at' | 'confidence';
    sort_order?: 'asc' | 'desc';
}

export interface RiskFactors {
    scope: 'single-file' | 'module' | 'cross-module';
    reversibility: 'easy' | 'migration-required' | 'irreversible';
    confidence: number;
    domain_complexity: 'low' | 'medium' | 'high';
}

export interface AdrQueueItem {
    id: string;
    title: string;
    status: 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'MODIFIED' | 'DEFERRED';
    risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
    risk_factors: RiskFactors;
    confidence: number;
    context: string;
    decision: string;
    consequences: string;
    alternatives: string;
    created_at: string;
    estimated_review_time_minutes: number;
    ticket: {
        id: string;
        title: string;
        clickup_task_id: string;
    };
    execution_id: string;
    escalation_reason?: 'LOW_CONFIDENCE' | 'MISSING_CONTEXT' | 'CONFLICTING_REQUIREMENTS' | 'NO_BEST_PRACTICE' | 'SECURITY_CONCERN' | 'PERFORMANCE_TRADEOFF' | 'MULTIPLE_VALID_APPROACHES' | 'UNKNOWN';
    escalation_context?: {
        questions?: string[];
        trade_offs?: string[];
        uncertain_constraints?: string[];
    };
}

export interface AdrQueueResponse {
    items: AdrQueueItem[];
    total: number;
}

export interface EscalationMetrics {
    totalEscalations: number;
    escalationRate: number;
    topReasons: { reason: string; count: number }[];
    avgResolutionTimeMinutes: number;
    delegationRate: number;
}

export interface AdrMetricsFilters {
    projectId?: string;
    startDate?: string; // ISO Date
    endDate?: string;   // ISO Date
    riskLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface AdrMetricsSummary {
    reviewVolume: { current: number; previous: number; trend: number };
    averageReviewTimeMinutes: { current: number; previous: number; trend: number };
    queueDepth: { current: number; previous: number; trend: number };
    estimatedThroughputMinutes: number;
}

export interface AdrApprovalRateTrend {
    date: string;
    approvalRate: number; // 0-100
    rejectionRate: number; // 0-100
}

export interface AdrRiskDistribution {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    count: number;
    percentage: number;
    [key: string]: any; // For Recharts compatibility
}

export interface AdrRejectionReason {
    reason: string;
    count: number;
}

export interface AdrWorkloadByProject {
    projectId: string;
    projectName: string;
    reviewCount: number;
}

export interface AiInsight {
    id: string;
    type: 'PATTERN' | 'IMPROVEMENT' | 'REGRESSION';
    message: string;
    metric: string;
    change: number; // percentage
    trend: 'UP' | 'DOWN';
}

export interface AdrDashboardMetrics {
    summary: AdrMetricsSummary;
    trends: {
        approvalRate: AdrApprovalRateTrend[];
        riskDistribution: AdrRiskDistribution[];
        rejectionReasons: AdrRejectionReason[];
        workloadByProject: AdrWorkloadByProject[];
    };
    insights: AiInsight[];
}

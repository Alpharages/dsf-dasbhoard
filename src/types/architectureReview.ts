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
}

export interface AdrQueueResponse {
    items: AdrQueueItem[];
    total: number;
}

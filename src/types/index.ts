export type ProjectStatus = 'active' | 'completed' | 'paused' | 'on-hold';

export interface TicketCounts {
    total: number;
    in_progress: number;
    completed: number;
    blocked: number;
    awaiting_approval: number;
    sync_pending: number;
}

export interface Project {
    id: string;
    name: string;
    status: ProjectStatus;
    pm_id: string;
    client_name: string;
    clickup_list_id?: string;
    github_repository_url?: string;
    default_branch?: string;
    created_at: string;
    updated_at: string;
    tickets: TicketCounts; // Renamed from ticket_counts to match backend tickets object
    last_activity?: string | null;
}

export interface DashboardSummary {
    total_projects: number;
    active_projects: number;
    total_tickets: number;
    in_progress_tickets?: number;
    completed_tickets?: number;
    blocked_tickets: number;
    avg_completion_rate?: number;
    utilization_percent: number;
    success_rate?: number;
    avg_completion_time_hours?: number;
    active_ai_executions?: number;
    queued_ai_executions?: number;
    daily_avg_completion_hours?: number[];
    pr_merge_rate?: number;
    qa_first_pass_rate?: number;
    provider_distribution?: ProviderDistributionItem[];
    sync_pending_tickets: number;
}

export interface ProviderDistributionItem {
    provider: string;
    percentage: number;
    count: number;
}

export interface FinancialSummary {
    cost_per_ticket: number | null;
    daily_budget_burn: number[];
    budget_ceiling: number;
    budget_forecast: number;
}

export type ExecutionStatus = 'QUEUED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'TIMEOUT' | 'CANCELLED' | 'AWAITING_APPROVAL';

export type AIProvider = 'CURSOR_HEADLESS' | 'CLAUDE_CODE';

export interface Execution {
    id: string;
    ticketId: string;
    status: ExecutionStatus;
    provider: AIProvider;
    startedAt?: string;
    completedAt?: string;
    failedAt?: string;
    errorMessage?: string;
    retryCount: number;
    filesChanged?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ExecutionProgressPayload {
    executionId: string;
    ticketId: string;
    status: ExecutionStatus;
    timestamp: string;
    aiProvider: AIProvider;
    percentage?: number;
    message?: string;
}

// Export new types for execution monitoring and notifications
export * from './execution';
export * from './notifications';
export * from './project';

/**
 * TypeScript types for AI Capability Management
 * Matches backend DTOs from Story 7.7
 */

export type TaskType =
    | 'CODE_GENERATION'
    | 'TEST_GENERATION'
    | 'REFACTORING'
    | 'DOCUMENTATION'
    | 'ARCHITECTURE_REVIEW'
    | 'BUG_FIX';

export type TrendIndicator = 'UP' | 'DOWN' | 'STABLE';

export interface CapabilityMetric {
    taskType: TaskType;
    successRate: number; // 0-100
    trend: TrendIndicator;
}

export interface Limitation {
    taskType: TaskType;
    failureRate: number; // 0-100
    knownIssues?: string;
    workaround?: string;
    isDisabled: boolean;
}

export interface CapabilityDashboardResponse {
    capabilities: CapabilityMetric[];
    topLimitations: Limitation[];
}

export interface CreateLimitationDto {
    taskType: TaskType;
    knownIssues?: string;
    workaround?: string;
    isDisabled?: boolean;
}

export interface UpdateLimitationDto {
    knownIssues?: string;
    workaround?: string;
    isDisabled?: boolean;
}

// UI-specific types
export interface LimitationFormData extends CreateLimitationDto {
    taskType: TaskType;
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
    CODE_GENERATION: 'Code Generation',
    TEST_GENERATION: 'Test Generation',
    REFACTORING: 'Refactoring',
    DOCUMENTATION: 'Documentation',
    ARCHITECTURE_REVIEW: 'Architecture Review',
    BUG_FIX: 'Bug Fix',
};

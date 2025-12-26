export type ConversationStatus = 'uploaded' | 'transcribing' | 'analyzing' | 'completed' | 'failed';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type Priority = 'high' | 'medium' | 'low';

export interface ActionItem {
    id: string;
    owner: string;
    task: string;
    due_date: string;
    priority: Priority;
}

export interface ConversationResponseDto {
    id: string;
    title: string;
    project_id: string;
    conversation_date: string;
    audio_file_url?: string;
    transcript?: string;
    summary?: string;
    action_items?: ActionItem[];
    sentiment?: Sentiment;
    status: ConversationStatus;
    processing_cost?: number;
    pm: {
        id: string;
        name: string;
        email: string;
    };
    project: {
        id: string;
        name: string;
    };
    created_at: string;
    updated_at: string;
}

export interface SearchConversationsDto {
    query?: string;
    project_ids?: string[];
    sentiment?: Sentiment;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
}

export interface PaginatedConversationsResponseDto {
    data: ConversationResponseDto[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}

export interface CreateConversationDto {
    transcript: string;
    project_id: string;
    conversation_date: string;
    title?: string;
}

export interface CreateTicketsResponseDto {
    message: string;
    count: number;
    clickup_task_ids?: string[];
}

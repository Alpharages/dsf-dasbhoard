export interface AIDecisionLog {
  id: string;
  agent_name: string;
  action: string;
  reasoning: string;
  ticket_id: string;
  execution_id?: string;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  confidence: number;
  timestamp: string;
  
  // Explicitly mentioned in ACs, these might be populated from output_data/metadata
  prompt_tokens?: number;
  completion_tokens?: number;
  model_used?: string;
  
  // Execution metadata if joined
  execution?: {
    id: string;
    status: string;
    ai_provider: string;
    ticket_id?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

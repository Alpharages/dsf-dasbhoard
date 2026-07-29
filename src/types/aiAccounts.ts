// Mirrors the backend A4 DTOs (src/ai-accounts). Credentials are NEVER present on the wire —
// the API returns only this redacted shape.
export type AiAccountProvider = 'openai' | 'claude';
export type AiAccountRuntime = 'oh' | 'claude';

export interface AiAccount {
  id: string;
  label: string;
  provider: AiAccountProvider;
  runtime: AiAccountRuntime;
  enabled: boolean;
  quota_config: unknown;
  created_at: string;
  updated_at: string;
}

export interface CreateAiAccountRequest {
  label: string;
  provider: AiAccountProvider;
  runtime: AiAccountRuntime;
  credentials: Record<string, string>;
  quota_config?: Record<string, unknown>;
  enabled?: boolean;
}

export interface UpdateAiAccountRequest {
  label?: string;
  credentials?: Record<string, string>;
  quota_config?: Record<string, unknown>;
  enabled?: boolean;
}

export interface AiAccountImportRowError {
  row: number;
  reason: string;
}

export interface AiAccountImportSummary {
  imported: number;
  skipped: number;
  errors: AiAccountImportRowError[];
}

// Claude login-session state per claude account (backend probes each account's CLAUDE_CONFIG_DIR).
export type ClaudeSessionStatus = 'active' | 'expiring' | 'expired' | 'unknown' | 'missing';

export interface ClaudeSessionInfo {
  id: string;
  label: string;
  email: string | null;
  enabled: boolean;
  configDir: string;
  status: ClaudeSessionStatus;
  expiresAt: string | null;
  lastLoginAt: string | null;
}

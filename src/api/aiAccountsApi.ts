import apiClient from '@/api/client';
import type {
  AiAccount,
  AiAccountImportSummary,
  ClaudeSessionInfo,
  CreateAiAccountRequest,
  UpdateAiAccountRequest,
} from '@/types/aiAccounts';

export const aiAccountsApi = {
  /** List pool accounts (redacted — no credentials). */
  list: async (): Promise<AiAccount[]> => {
    const response = await apiClient.get<AiAccount[]>('admin/ai-accounts');
    return response.data;
  },

  /** Add a single account to the pool. */
  create: async (payload: CreateAiAccountRequest): Promise<AiAccount> => {
    const response = await apiClient.post<AiAccount>('admin/ai-accounts', payload);
    return response.data;
  },

  /** Edit an account — label, quota, credentials, and/or enabled. */
  update: async (id: string, payload: UpdateAiAccountRequest): Promise<AiAccount> => {
    const response = await apiClient.patch<AiAccount>(`admin/ai-accounts/${id}`, payload);
    return response.data;
  },

  /** Remove an account from the pool. */
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`admin/ai-accounts/${id}`);
  },

  /** Import accounts from a CSV file. Returns the import summary (counts + redacted per-row errors). */
  importCsv: async (file: File): Promise<AiAccountImportSummary> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<AiAccountImportSummary>(
      'admin/ai-accounts/import',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  /** Claude login-session status per claude account (active/expiring/expired/unknown/missing). */
  claudeSessions: async (): Promise<ClaudeSessionInfo[]> => {
    const response = await apiClient.get<ClaudeSessionInfo[]>('admin/ai-accounts/claude-sessions');
    return response.data;
  },
};

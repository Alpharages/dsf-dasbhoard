import apiClient from '@/api/client';
import type { AiAccount, AiAccountImportSummary } from '@/types/aiAccounts';

export const aiAccountsApi = {
  /** List pool accounts (redacted — no credentials). */
  list: async (): Promise<AiAccount[]> => {
    const response = await apiClient.get<AiAccount[]>('admin/ai-accounts');
    return response.data;
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

  /** Enable/disable an account. */
  setEnabled: async (id: string, enabled: boolean): Promise<AiAccount> => {
    const response = await apiClient.patch<AiAccount>(`admin/ai-accounts/${id}`, { enabled });
    return response.data;
  },
};

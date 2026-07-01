import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { aiAccountsApi } from '@/api/aiAccountsApi';
import type { AiAccount } from '@/types/aiAccounts';

export const aiAccountKeys = {
  all: ['ai-accounts'] as const,
};

export const useAiAccounts = (enabled: boolean = true) => {
  return useQuery({
    queryKey: aiAccountKeys.all,
    queryFn: aiAccountsApi.list,
    enabled,
    staleTime: 30 * 1000,
  });
};

export const useImportAiAccounts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => aiAccountsApi.importCsv(file),
    onSuccess: (summary) => {
      toast.success(`Imported ${summary.imported}, skipped ${summary.skipped}`);
      queryClient.invalidateQueries({ queryKey: aiAccountKeys.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'CSV import failed');
    },
  });
};

export const useSetAiAccountEnabled = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      aiAccountsApi.setEnabled(id, enabled),
    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: aiAccountKeys.all });
      const previous = queryClient.getQueryData<AiAccount[]>(aiAccountKeys.all);
      queryClient.setQueryData<AiAccount[]>(aiAccountKeys.all, (rows) =>
        rows?.map((r) => (r.id === id ? { ...r, enabled } : r)),
      );
      return { previous };
    },
    onError: (error: any, _vars, context) => {
      queryClient.setQueryData(aiAccountKeys.all, context?.previous);
      toast.error(error?.response?.data?.message || 'Failed to update account');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: aiAccountKeys.all });
    },
  });
};

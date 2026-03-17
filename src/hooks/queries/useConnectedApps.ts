import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectedAppsApi } from '@/api/connectedAppsApi';
import { toast } from 'react-hot-toast';

export const connectedAppsKeys = {
  all: ['connected-apps'] as const,
  list: () => [...connectedAppsKeys.all, 'list'] as const,
  hierarchy: (accountId: string, teamId?: string) =>
    [...connectedAppsKeys.all, 'hierarchy', accountId, teamId] as const,
};

export const useConnectedApps = () => {
  return useQuery({
    queryKey: connectedAppsKeys.all,
    queryFn: connectedAppsApi.getConnectedApps,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useAppHierarchy = (accountId: string | null, teamId?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: connectedAppsKeys.hierarchy(accountId || '', teamId),
    queryFn: () => connectedAppsApi.getAppHierarchy(accountId!, teamId),
    enabled: !!accountId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useDisconnectConnectedApp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => connectedAppsApi.disconnectApp(id),
    onSuccess: () => {
      toast.success('Account disconnected successfully');
      queryClient.invalidateQueries({ queryKey: ['connected-apps'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to disconnect account';
      toast.error(message);
    },
  });
};

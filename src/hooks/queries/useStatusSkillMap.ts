import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { statusSkillMapApi } from '@/api/statusSkillMapApi';
import { toast } from 'react-hot-toast';
import type { StatusSkillEntry } from '@/types/statusSkillMap';

export const statusSkillMapKeys = {
  all: ['status-skill-map'] as const,
};

export const useStatusSkillMap = (enabled: boolean = true) => {
  return useQuery({
    queryKey: statusSkillMapKeys.all,
    queryFn: statusSkillMapApi.getStatusSkillMap,
    enabled,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false, // don't clobber an admin's unsaved edits on tab refocus
  });
};

export const useUpdateStatusSkillMap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entries: StatusSkillEntry[]) => statusSkillMapApi.updateStatusSkillMap(entries),
    onSuccess: () => {
      toast.success('Status → skill map saved');
      queryClient.invalidateQueries({ queryKey: statusSkillMapKeys.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to save status → skill map');
    },
  });
};

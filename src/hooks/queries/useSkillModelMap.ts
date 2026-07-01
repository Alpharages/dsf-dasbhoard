import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skillModelMapApi } from '@/api/skillModelMapApi';
import { toast } from 'react-hot-toast';
import type { SkillModelMapEntry } from '@/types/skillModelMap';

export const skillModelMapKeys = {
  all: ['skill-model-map'] as const,
};

export const useSkillModelMap = (enabled: boolean = true) => {
  return useQuery({
    queryKey: skillModelMapKeys.all,
    queryFn: skillModelMapApi.getSkillModelMap,
    enabled,
    staleTime: 30 * 1000,
  });
};

export const useUpdateSkillModelMapEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ skill, entry }: { skill: string; entry: Pick<SkillModelMapEntry, 'model' | 'provider' | 'runtime'> }) =>
      skillModelMapApi.updateSkillModelMapEntry(skill, entry),
    onSuccess: () => {
      toast.success('Skill → model mapping saved');
      queryClient.invalidateQueries({ queryKey: skillModelMapKeys.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to save skill → model mapping');
    },
  });
};

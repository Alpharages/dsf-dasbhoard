import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGlobalAiRoutingConfig,
  updateGlobalAiRoutingConfig,
  getProjectAiRoutingConfig,
  getEffectiveProjectAiRoutingConfig,
  updateProjectAiRoutingConfig,
  resetProjectAiRoutingConfig,
} from '@/api/aiRoutingConfigApi';
import type { AiRoutingConfigPayload } from '@/api/aiRoutingConfigApi';

export const aiRoutingConfigKeys = {
  global: ['aiRoutingConfig', 'global'] as const,
  projectConfig: (projectId: string) => ['aiRoutingConfig', 'project', projectId] as const,
  projectEffective: (projectId: string) =>
    ['aiRoutingConfig', 'project', projectId, 'effective'] as const,
};

export function useGlobalAiRoutingConfig() {
  return useQuery({
    queryKey: aiRoutingConfigKeys.global,
    queryFn: getGlobalAiRoutingConfig,
    staleTime: 60_000,
  });
}

export function useProjectAiRoutingConfig(projectId: string) {
  return useQuery({
    queryKey: aiRoutingConfigKeys.projectConfig(projectId),
    queryFn: () => getProjectAiRoutingConfig(projectId),
    enabled: !!projectId,
    staleTime: 60_000,
  });
}

export function useEffectiveProjectAiRoutingConfig(projectId: string) {
  return useQuery({
    queryKey: aiRoutingConfigKeys.projectEffective(projectId),
    queryFn: () => getEffectiveProjectAiRoutingConfig(projectId),
    enabled: !!projectId,
    staleTime: 60_000,
  });
}

export function useUpdateGlobalAiRoutingConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AiRoutingConfigPayload) => updateGlobalAiRoutingConfig(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiRoutingConfigKeys.global });
      // Also invalidate all per-project effective queries — they inherit from global
      queryClient.invalidateQueries({ queryKey: ['aiRoutingConfig', 'project'] });
    },
  });
}

export function useUpdateProjectAiRoutingConfig(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AiRoutingConfigPayload) => updateProjectAiRoutingConfig(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiRoutingConfigKeys.projectConfig(projectId) });
      queryClient.invalidateQueries({ queryKey: aiRoutingConfigKeys.projectEffective(projectId) });
    },
  });
}

export function useResetProjectAiRoutingConfig(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => resetProjectAiRoutingConfig(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiRoutingConfigKeys.projectConfig(projectId) });
      queryClient.invalidateQueries({ queryKey: aiRoutingConfigKeys.projectEffective(projectId) });
    },
  });
}

import apiClient from './client';

export type AIProvider = 'CLAUDE_CODE' | 'GEMINI' | 'CODEX' | 'KIMI';

export interface AiRoutingConfigPayload {
  primaryProviderOverride?: AIProvider | null;
  complexityThresholdMedium?: number | null;
  complexityThresholdHigh?: number | null;
  tierLowProvider?: AIProvider | null;
  tierLowFallback?: AIProvider | null;
  tierMediumProvider?: AIProvider | null;
  tierMediumFallback?: AIProvider | null;
  tierHighProvider?: AIProvider | null;
  tierHighFallback?: AIProvider | null;
}

export interface EffectiveAiRoutingConfig {
  primaryProviderOverride: AIProvider | null;
  complexityThresholdMedium: number;
  complexityThresholdHigh: number;
  tierLowProvider: AIProvider;
  tierLowFallback: AIProvider | null;
  tierMediumProvider: AIProvider;
  tierMediumFallback: AIProvider | null;
  tierHighProvider: AIProvider;
  tierHighFallback: AIProvider | null;
}

export const getGlobalAiRoutingConfig = async (): Promise<EffectiveAiRoutingConfig> => {
  const { data } = await apiClient.get('/ai-routing/config/global');
  return data;
};

export const updateGlobalAiRoutingConfig = async (
  payload: AiRoutingConfigPayload,
): Promise<EffectiveAiRoutingConfig> => {
  const { data } = await apiClient.put('/ai-routing/config/global', payload);
  return data;
};

export const getProjectAiRoutingConfig = async (
  projectId: string,
): Promise<AiRoutingConfigPayload> => {
  const { data } = await apiClient.get(`/ai-routing/config/project/${projectId}`);
  return data ?? {};
};

export const getEffectiveProjectAiRoutingConfig = async (
  projectId: string,
): Promise<EffectiveAiRoutingConfig> => {
  const { data } = await apiClient.get(`/ai-routing/config/project/${projectId}/effective`);
  return data;
};

export const updateProjectAiRoutingConfig = async (
  projectId: string,
  payload: AiRoutingConfigPayload,
): Promise<AiRoutingConfigPayload> => {
  const { data } = await apiClient.put(`/ai-routing/config/project/${projectId}`, payload);
  return data;
};

export const resetProjectAiRoutingConfig = async (projectId: string): Promise<void> => {
  await apiClient.delete(`/ai-routing/config/project/${projectId}`);
};

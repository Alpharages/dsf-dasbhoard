import apiClient from '@/api/client';
import type { SkillModelMapEntry } from '@/types/skillModelMap';

export const skillModelMapApi = {
  /**
   * List the 3 global skill -> model map entries
   */
  getSkillModelMap: async (): Promise<SkillModelMapEntry[]> => {
    const response = await apiClient.get<SkillModelMapEntry[]>('admin/skill-model-map');
    return response.data;
  },

  /**
   * Update one skill -> model map entry
   */
  updateSkillModelMapEntry: async (
    skill: string,
    entry: Pick<SkillModelMapEntry, 'model' | 'provider' | 'runtime' | 'fallbacks'>,
  ): Promise<SkillModelMapEntry> => {
    const response = await apiClient.put<SkillModelMapEntry>(`admin/skill-model-map/${skill}`, entry);
    return response.data;
  },
};

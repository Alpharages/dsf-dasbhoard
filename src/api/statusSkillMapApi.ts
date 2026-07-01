import apiClient from '@/api/client';
import type { GlobalStatusSkillMap, StatusSkillEntry } from '@/types/statusSkillMap';

export const statusSkillMapApi = {
  /**
   * Get the global default status -> skill map (+ read-only loop context)
   */
  getStatusSkillMap: async (): Promise<GlobalStatusSkillMap> => {
    const response = await apiClient.get<GlobalStatusSkillMap>('config/status-skill-map');
    return response.data;
  },

  /**
   * Replace the whole global default map (backend is whole-array replace)
   */
  updateStatusSkillMap: async (entries: StatusSkillEntry[]): Promise<StatusSkillEntry[]> => {
    const response = await apiClient.put<StatusSkillEntry[]>('config/status-skill-map', { entries });
    return response.data;
  },
};

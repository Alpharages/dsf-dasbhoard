import apiClient from '@/api/client';
import type { HierarchyResponse } from '@/types/integrations';

export interface ConnectedApp {
  id: string;
  provider: 'clickup' | 'jira' | 'asana';
  workspace_id: string;
  workspace_name: string;
  bot_user_id: string;
  bot_username: string;
  created_at: string;
}

export const connectedAppsApi = {
  /**
   * Fetch all connected provider accounts for the current user
   */
  getConnectedApps: async (): Promise<ConnectedApp[]> => {
    const response = await apiClient.get<ConnectedApp[]>('/api/v1/apps/connected');
    return response.data;
  },

  /**
   * Get the ClickUp OAuth connect URL
   * @param returnTo Optional parameter to tell the callback where to return (e.g., 'settings')
   */
  getClickUpConnectUrl: async (returnTo?: string): Promise<{ url: string }> => {
    const params = new URLSearchParams();
    if (returnTo) params.append('returnTo', returnTo);
    
    const response = await apiClient.get<{ url: string }>(
      `/api/v1/apps/clickup/connect${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  /**
   * Disconnect a specific app account
   * @param id The ID of the ConnectedApp record
   */
  disconnectApp: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/apps/${id}`);
  },

  /**
   * Get the hierarchy (orgs/spaces) for a specific connected account
   * @param id The ID of the ConnectedApp record
   * @param teamId Optional teamId for ClickUp
   */
  getAppHierarchy: async (id: string, teamId?: string): Promise<HierarchyResponse> => {
    const response = await apiClient.get<HierarchyResponse>(`/api/v1/apps/${id}/hierarchy`, {
      params: { teamId }
    });
    return response.data;
  },
};

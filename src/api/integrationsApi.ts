import api from './client';

export interface NormalizedStatus {
  id: string; // ClickUp: status name used as ID (e.g., "in progress")
  name: string; // Display name (e.g., "In Progress")
  color: string | null;
  type: 'todo' | 'in_progress' | 'done' | 'cancelled' | 'other';
}

export interface SyncConfigResponse {
  id: string;
  provider: string;
  ai_trigger_status: string | null;
  container_id: string | null;
  polling_enabled: boolean;
  polling_interval_min: number;
  webhook_enabled: boolean;
  webhook_id: string | null;
}

export interface UpdateSyncConfig {
  ai_trigger_status?: string | null;
  container_id?: string | null;
}

export interface PmIntegration {
    id: string;
    projectId: string;
    provider: 'CLICKUP' | 'JIRA' | 'ASANA';
    status: 'ACTIVE' | 'INACTIVE';
    botUserId?: string;
    botUsername?: string;
    workspaceName?: string;
    createdAt: string;
    updatedAt: string;
    pollingEnabled?: boolean;
    pollingIntervalMin?: number;
    pollingLastRunAt?: string;
    webhookEnabled?: boolean;
    webhookId?: string;
}

export interface SyncSettingsUpdate {
    polling_enabled: boolean;
    polling_interval_min: number;
    webhook_enabled: boolean;
}

/**
 * Fetches connected PM integrations for a project
 */
export async function getPmIntegrations(projectId: string): Promise<PmIntegration[]> {
    const { data } = await api.get(`/projects/${projectId}/integrations`);
    return Array.isArray(data) ? data : (data?.data || []);
}

/**
 * Gets the OAuth connect URL for a specific provider
 */
export async function getPmConnectUrl(provider: string, projectId: string): Promise<{ url: string }> {
    const { data } = await api.get(`/integrations/${provider.toLowerCase()}/connect?project_id=${projectId}`);
    return data;
}

/**
 * Disconnects a PM integration
 */
export async function deletePmIntegration(projectId: string, provider: string): Promise<{ success: boolean }> {
    const { data } = await api.delete(`/integrations/${provider.toLowerCase()}`, { params: { project_id: projectId } });
    return data;
}

/**
 * Updates sync settings for a PM integration
 */
export async function updateSyncSettings(integrationId: string, data: SyncSettingsUpdate): Promise<PmIntegration> {
    const response = await api.patch(`/integrations/${integrationId}/sync-settings`, data);
    return response.data;
}

/**
 * Fetches live workflow statuses for a PM integration
 * Requires containerId (e.g., ClickUp list ID)
 */
export async function getIntegrationStatuses(
  integrationId: string,
  containerId: string,
): Promise<NormalizedStatus[]> {
  const { data } = await api.get(`/integrations/${integrationId}/statuses`, {
    params: { containerId },
  });
  return Array.isArray(data) ? data : (data?.data ?? []);
}

/**
 * Fetches the sync config (ai_trigger_status + container_id) for a project integration
 */
export async function getSyncConfig(projectId: string): Promise<SyncConfigResponse> {
  const { data } = await api.get(`/projects/${projectId}/integration/sync-config`);
  return data;
}

/**
 * Updates sync config: ai_trigger_status and/or container_id
 */
export async function updateSyncConfig(
  projectId: string,
  body: UpdateSyncConfig,
): Promise<SyncConfigResponse> {
  const { data } = await api.patch(`/projects/${projectId}/integration/sync-config`, body);
  return data;
}

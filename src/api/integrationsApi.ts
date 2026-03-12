import api from './client';

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

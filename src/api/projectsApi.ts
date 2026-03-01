/**
 * Projects API Client
 * API calls for project management
 */

import apiClient from './client';
import type { Project } from '@/types/project';

export interface CreateProjectPayload {
  name: string;
  clickup_list_id: string;
  client_name: string;
  pm_id: string;
  github_repository_url?: string;
}

const BASE_URL = '/projects';

/**
 * Create a new project
 */
export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  const response = await apiClient.post<Project>(BASE_URL, payload);
  return response.data;
}

/**
 * Get current user's accessible projects
 */
export async function getUserProjects(): Promise<Project[]> {
  const response = await apiClient.get(`${BASE_URL}/my-projects`);
  return response.data;
}

/**
 * Get all projects (admin only)
 */
export async function getAllProjects(): Promise<Project[]> {
  const response = await apiClient.get(BASE_URL);
  return response.data;
}

/**
 * Get project by ID
 */
export async function getProject(projectId: string): Promise<Project> {
  const response = await apiClient.get(`${BASE_URL}/${projectId}`);
  return response.data;
}

/**
 * Legacy API object for backward compatibility
 * @deprecated Use individual functions instead
 */
export const projectsApi = {
  /**
   * Get all projects
   * @deprecated Use getAllProjects() instead
   */
  getProjects: getAllProjects,
  
  /**
   * Get current user's projects
   * @deprecated Use getUserProjects() instead
   */
  getUserProjects,
  
  /**
   * Get project by ID
   * @deprecated Use getProject() instead
   */
  getProject,
};

// Re-export Project type for backward compatibility
export type { Project };

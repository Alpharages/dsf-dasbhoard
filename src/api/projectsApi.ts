/**
 * Projects API Client
 * API calls for project management
 */

import apiClient from './client';
import type { Project } from '@/types/project';

const BASE_URL = '/projects';

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

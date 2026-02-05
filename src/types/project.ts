/**
 * Project Type Definitions
 */

export interface Project {
  id: string;
  name: string;
  clickup_list_id?: string;
  github_repository_url?: string;
  default_branch?: string;
  pm_id?: string;
  status: string;
  is_active: boolean;
  client_name?: string;
  created_at: string;
  updated_at: string;
  deactivated_at?: string | null;
}

export interface ProjectFilters {
  status?: string;
  isActive?: boolean;
}

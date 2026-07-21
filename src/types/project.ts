/**
 * Project Type Definitions
 */

export interface Project {
  id: string;
  name: string;
  clickup_list_id?: string;
  github_account_id?: string | null;
  github_repository_url?: string;
  default_branch?: string;
  pm_id?: string;
  status: string;
  is_active: boolean;
  client_name?: string;
  /** null = inherit the global `execution.concurrency_limit` system setting */
  execution_concurrency_limit?: number | null;
  /** Per-project Lore MCP server URL; null = inherit global LORE_SERVER_URL */
  lore_server_url?: string | null;
  /** True when a per-project Lore key is stored. The key itself is never returned. */
  lore_configured?: boolean;
  created_at: string;
  updated_at: string;
  deactivated_at?: string | null;
}

export interface ProjectFilters {
  status?: string;
  isActive?: boolean;
}

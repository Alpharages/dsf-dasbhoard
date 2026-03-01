import type { Project } from '../types';
import type { ProjectFilters } from '../components/dashboard/ProjectFilterSheet';

/**
 * Filters a list of projects based on the given filter criteria.
 * Status values use UI display labels (e.g. 'On Hold') which are normalised
 * to backend values (e.g. 'on-hold') before comparison against ProjectStatus.
 */
export function filterProjects(projects: Project[], filters: ProjectFilters): Project[] {
  return projects.filter((project) => {
    // Client Name: case-insensitive substring match on client_name and project name
    if (filters.clientName) {
      const q = filters.clientName.toLowerCase();
      const matchesClient = project.client_name?.toLowerCase().includes(q) ?? false;
      const matchesName = project.name.toLowerCase().includes(q);
      if (!matchesClient && !matchesName) return false;
    }

    // Status: normalises UI label (e.g. 'On Hold') to backend value (e.g. 'on-hold')
    if (filters.statuses.length > 0) {
      const normalized = filters.statuses.map((s) => s.toLowerCase().replace(/ /g, '-'));
      if (!normalized.includes(project.status.toLowerCase())) return false;
    }

    // Date Range: project.created_at must fall within [startDate, endDate]
    if (filters.dateRange.startDate || filters.dateRange.endDate) {
      const projectDate = new Date(project.created_at);
      if (filters.dateRange.startDate && projectDate < filters.dateRange.startDate) return false;
      if (filters.dateRange.endDate && projectDate > filters.dateRange.endDate) return false;
    }

    return true;
  });
}

import type { Project } from '../types';
import type { SortOption } from '../pages/Dashboard';

export function sortProjects(projects: Project[], sortOption: SortOption): Project[] {
  if (!projects || projects.length === 0) return [];
  const sorted = [...projects];

  switch (sortOption) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'tickets-desc':
      return sorted.sort((a, b) => (b.tickets?.total || 0) - (a.tickets?.total || 0));
    case 'blocked-desc':
      return sorted.sort((a, b) => (b.tickets?.blocked || 0) - (a.tickets?.blocked || 0));
    case 'activity-desc':
    default:
      return sorted.sort((a, b) => {
        const timeA = new Date(a.last_activity || a.updated_at).getTime();
        const timeB = new Date(b.last_activity || b.updated_at).getTime();
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      });
  }
}

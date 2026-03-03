import { describe, it, expect } from 'vitest';
import { sortProjects } from '@/utils/projectSort';
import type { Project } from '@/types';

const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: '1',
  name: 'Test Project',
  status: 'active',
  pm_id: 'pm-1',
  client_name: 'Acme Corp',
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
  tickets: { total: 5, in_progress: 1, completed: 3, blocked: 0, awaiting_approval: 0 },
  ...overrides,
});

describe('sortProjects', () => {
  it('returns empty array when given empty array', () => {
    expect(sortProjects([], 'activity-desc')).toHaveLength(0);
  });

  it('returns empty array when given null-like input', () => {
    expect(sortProjects([] as Project[], 'name-asc')).toHaveLength(0);
  });

  it('does not mutate the original array', () => {
    const projects = [makeProject({ id: '1', name: 'Beta' }), makeProject({ id: '2', name: 'Alpha' })];
    const original = [...projects];
    sortProjects(projects, 'name-asc');
    expect(projects[0].name).toBe(original[0].name);
  });

  describe('name-asc', () => {
    it('sorts projects alphabetically A-Z by name', () => {
      const projects = [
        makeProject({ id: '1', name: 'Zeta Project' }),
        makeProject({ id: '2', name: 'Alpha Project' }),
        makeProject({ id: '3', name: 'Mango Project' }),
      ];
      const result = sortProjects(projects, 'name-asc');
      expect(result.map((p) => p.name)).toEqual(['Alpha Project', 'Mango Project', 'Zeta Project']);
    });

    it('handles single project', () => {
      const projects = [makeProject({ name: 'Solo' })];
      expect(sortProjects(projects, 'name-asc')[0].name).toBe('Solo');
    });
  });

  describe('tickets-desc', () => {
    it('sorts by total ticket count descending', () => {
      const projects = [
        makeProject({ id: '1', tickets: { total: 3, in_progress: 0, completed: 0, blocked: 0, awaiting_approval: 0 } }),
        makeProject({ id: '2', tickets: { total: 10, in_progress: 0, completed: 0, blocked: 0, awaiting_approval: 0 } }),
        makeProject({ id: '3', tickets: { total: 7, in_progress: 0, completed: 0, blocked: 0, awaiting_approval: 0 } }),
      ];
      const result = sortProjects(projects, 'tickets-desc');
      expect(result.map((p) => p.id)).toEqual(['2', '3', '1']);
    });

    it('treats undefined tickets as 0 (null safety)', () => {
      const projects = [
        makeProject({ id: '1', tickets: undefined as any }),
        makeProject({ id: '2', tickets: { total: 5, in_progress: 0, completed: 0, blocked: 0, awaiting_approval: 0 } }),
      ];
      const result = sortProjects(projects, 'tickets-desc');
      expect(result[0].id).toBe('2');
    });
  });

  describe('blocked-desc', () => {
    it('sorts by blocked ticket count descending', () => {
      const projects = [
        makeProject({ id: '1', tickets: { total: 10, in_progress: 0, completed: 0, blocked: 1, awaiting_approval: 0 } }),
        makeProject({ id: '2', tickets: { total: 5, in_progress: 0, completed: 0, blocked: 5, awaiting_approval: 0 } }),
        makeProject({ id: '3', tickets: { total: 8, in_progress: 0, completed: 0, blocked: 3, awaiting_approval: 0 } }),
      ];
      const result = sortProjects(projects, 'blocked-desc');
      expect(result.map((p) => p.id)).toEqual(['2', '3', '1']);
    });

    it('treats undefined tickets.blocked as 0 (null safety)', () => {
      const projects = [
        makeProject({ id: '1', tickets: undefined as any }),
        makeProject({ id: '2', tickets: { total: 2, in_progress: 0, completed: 0, blocked: 2, awaiting_approval: 0 } }),
      ];
      const result = sortProjects(projects, 'blocked-desc');
      expect(result[0].id).toBe('2');
    });
  });

  describe('activity-desc (default)', () => {
    it('sorts by last_activity descending (most recent first)', () => {
      const projects = [
        makeProject({ id: '1', last_activity: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }),
        makeProject({ id: '2', last_activity: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' }),
        makeProject({ id: '3', last_activity: '2026-02-01T00:00:00Z', updated_at: '2026-02-01T00:00:00Z' }),
      ];
      const result = sortProjects(projects, 'activity-desc');
      expect(result.map((p) => p.id)).toEqual(['2', '3', '1']);
    });

    it('falls back to updated_at when last_activity is null', () => {
      const projects = [
        makeProject({ id: '1', last_activity: null, updated_at: '2026-01-01T00:00:00Z' }),
        makeProject({ id: '2', last_activity: null, updated_at: '2026-03-01T00:00:00Z' }),
      ];
      const result = sortProjects(projects, 'activity-desc');
      expect(result[0].id).toBe('2');
    });

    it('treats invalid date strings as 0 without throwing', () => {
      const projects = [
        makeProject({ id: '1', last_activity: 'not-a-date', updated_at: 'not-a-date' }),
        makeProject({ id: '2', last_activity: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }),
      ];
      expect(() => sortProjects(projects, 'activity-desc')).not.toThrow();
      const result = sortProjects(projects, 'activity-desc');
      expect(result[0].id).toBe('2');
    });

    it('is the default sort when option falls through to default case', () => {
      const projects = [
        makeProject({ id: '1', last_activity: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }),
        makeProject({ id: '2', last_activity: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z' }),
      ];
      const result = sortProjects(projects, 'activity-desc');
      expect(result[0].id).toBe('2');
    });
  });
});

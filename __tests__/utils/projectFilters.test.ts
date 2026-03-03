import { describe, it, expect } from 'vitest';
import { filterProjects } from '../../utils/projectFilters';
import type { Project } from '../../types';

const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: '1',
  name: 'Test Project',
  status: 'active',
  pm_id: 'pm-1',
  client_name: 'Acme Corp',
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
  tickets: { total: 0, in_progress: 0, completed: 0, blocked: 0, awaiting_approval: 0 },
  ...overrides,
});

const emptyFilters = {
  statuses: [],
  clientName: '',
  dateRange: { startDate: null, endDate: null },
};

describe('filterProjects', () => {
  it('returns all projects when no filters are active', () => {
    const projects = [makeProject({ id: '1' }), makeProject({ id: '2' })];
    expect(filterProjects(projects, emptyFilters)).toHaveLength(2);
  });

  it('returns empty array when projects list is empty', () => {
    expect(filterProjects([], emptyFilters)).toHaveLength(0);
  });

  describe('client name filter', () => {
    it('matches by client_name (case-insensitive)', () => {
      const projects = [
        makeProject({ id: '1', client_name: 'Acme Corp' }),
        makeProject({ id: '2', client_name: 'BetaCo' }),
      ];
      const result = filterProjects(projects, { ...emptyFilters, clientName: 'acme' });
      expect(result).toHaveLength(1);
      expect(result[0].client_name).toBe('Acme Corp');
    });

    it('matches partial client_name substring', () => {
      const projects = [makeProject({ client_name: 'Global Industries Ltd' })];
      expect(filterProjects(projects, { ...emptyFilters, clientName: 'dustries' })).toHaveLength(1);
    });

    it('matches by project name as fallback', () => {
      const projects = [
        makeProject({ id: '1', name: 'Acme Dashboard', client_name: 'OtherCo' }),
        makeProject({ id: '2', name: 'Beta App', client_name: 'BetaCo' }),
      ];
      const result = filterProjects(projects, { ...emptyFilters, clientName: 'acme' });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Acme Dashboard');
    });

    it('excludes projects with no matching client_name or project name', () => {
      const projects = [makeProject({ client_name: 'Acme Corp', name: 'Project X' })];
      expect(filterProjects(projects, { ...emptyFilters, clientName: 'zzz' })).toHaveLength(0);
    });

    it('treats empty clientName as no filter', () => {
      const projects = [makeProject({ id: '1' }), makeProject({ id: '2' })];
      expect(filterProjects(projects, { ...emptyFilters, clientName: '' })).toHaveLength(2);
    });
  });

  describe('status filter', () => {
    it('filters by single active status', () => {
      const projects = [
        makeProject({ id: '1', status: 'active' }),
        makeProject({ id: '2', status: 'paused' }),
      ];
      const result = filterProjects(projects, { ...emptyFilters, statuses: ['Active'] });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('filters by multiple statuses (OR logic)', () => {
      const projects = [
        makeProject({ id: '1', status: 'active' }),
        makeProject({ id: '2', status: 'paused' }),
        makeProject({ id: '3', status: 'completed' }),
      ];
      const result = filterProjects(projects, { ...emptyFilters, statuses: ['Active', 'Paused'] });
      expect(result).toHaveLength(2);
      expect(result.map((p) => p.id)).toEqual(['1', '2']);
    });

    it('maps "On Hold" UI label to on-hold backend status', () => {
      const projects = [
        makeProject({ id: '1', status: 'on-hold' }),
        makeProject({ id: '2', status: 'active' }),
      ];
      const result = filterProjects(projects, { ...emptyFilters, statuses: ['On Hold'] });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('maps "Completed" UI label to completed backend status', () => {
      const projects = [
        makeProject({ id: '1', status: 'completed' }),
        makeProject({ id: '2', status: 'active' }),
      ];
      const result = filterProjects(projects, { ...emptyFilters, statuses: ['Completed'] });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('maps "Paused" UI label to paused backend status', () => {
      const projects = [
        makeProject({ id: '1', status: 'paused' }),
        makeProject({ id: '2', status: 'active' }),
      ];
      const result = filterProjects(projects, { ...emptyFilters, statuses: ['Paused'] });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('returns no projects when no status matches', () => {
      const projects = [makeProject({ status: 'active' })];
      const result = filterProjects(projects, { ...emptyFilters, statuses: ['Completed'] });
      expect(result).toHaveLength(0);
    });

    it('treats empty statuses array as no filter', () => {
      const projects = [makeProject({ status: 'active' }), makeProject({ status: 'paused' })];
      expect(filterProjects(projects, { ...emptyFilters, statuses: [] })).toHaveLength(2);
    });
  });

  describe('date range filter', () => {
    it('excludes projects created before startDate', () => {
      const projects = [
        makeProject({ id: '1', created_at: '2026-01-01T10:00:00Z' }),
        makeProject({ id: '2', created_at: '2026-02-01T10:00:00Z' }),
      ];
      const result = filterProjects(projects, {
        ...emptyFilters,
        dateRange: { startDate: new Date('2026-01-15T00:00:00Z'), endDate: null },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('excludes projects created after endDate', () => {
      const projects = [
        makeProject({ id: '1', created_at: '2026-01-10T10:00:00Z' }),
        makeProject({ id: '2', created_at: '2026-03-01T10:00:00Z' }),
      ];
      const result = filterProjects(projects, {
        ...emptyFilters,
        dateRange: { startDate: null, endDate: new Date('2026-01-31T23:59:59Z') },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('applies both startDate and endDate as inclusive range', () => {
      const projects = [
        makeProject({ id: '1', created_at: '2025-12-01T10:00:00Z' }),
        makeProject({ id: '2', created_at: '2026-01-15T10:00:00Z' }),
        makeProject({ id: '3', created_at: '2026-03-01T10:00:00Z' }),
      ];
      const result = filterProjects(projects, {
        ...emptyFilters,
        dateRange: {
          startDate: new Date('2026-01-01T00:00:00Z'),
          endDate: new Date('2026-01-31T23:59:59Z'),
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('skips date filter when both dates are null', () => {
      const projects = [makeProject({ created_at: '2020-01-01T10:00:00Z' })];
      expect(filterProjects(projects, emptyFilters)).toHaveLength(1);
    });

    it('includes project created exactly at startDate', () => {
      const ts = '2026-01-15T00:00:00Z';
      const projects = [makeProject({ created_at: ts })];
      const result = filterProjects(projects, {
        ...emptyFilters,
        dateRange: { startDate: new Date(ts), endDate: null },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('combined filters', () => {
    it('applies status AND client name filters together', () => {
      const projects = [
        makeProject({ id: '1', status: 'active', client_name: 'Acme Corp' }),
        makeProject({ id: '2', status: 'paused', client_name: 'Acme Corp' }),
        makeProject({ id: '3', status: 'active', client_name: 'BetaCo' }),
      ];
      const result = filterProjects(projects, {
        ...emptyFilters,
        statuses: ['Active'],
        clientName: 'acme',
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('applies status AND date range filters together', () => {
      const projects = [
        makeProject({ id: '1', status: 'active', created_at: '2026-01-10T00:00:00Z' }),
        makeProject({ id: '2', status: 'active', created_at: '2026-03-10T00:00:00Z' }),
        makeProject({ id: '3', status: 'paused', created_at: '2026-01-10T00:00:00Z' }),
      ];
      const result = filterProjects(projects, {
        statuses: ['Active'],
        clientName: '',
        dateRange: {
          startDate: new Date('2026-01-01T00:00:00Z'),
          endDate: new Date('2026-01-31T23:59:59Z'),
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('returns empty array when filters produce no match', () => {
      const projects = [makeProject({ status: 'active', client_name: 'Acme Corp' })];
      const result = filterProjects(projects, {
        ...emptyFilters,
        statuses: ['Paused'],
        clientName: 'acme',
      });
      expect(result).toHaveLength(0);
    });
  });
});

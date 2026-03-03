import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProjectCardListView } from '@/components/dashboard/ProjectCardListView';
import type { Project } from '@/types';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal() as typeof import('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockNavigate = vi.fn();

const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'proj-1',
  name: 'Alpha Project',
  status: 'active',
  pm_id: 'pm-1',
  client_name: 'Acme Corp',
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
  last_activity: '2026-02-01T10:00:00Z',
  tickets: { total: 10, in_progress: 3, completed: 5, blocked: 2, awaiting_approval: 0 },
  ...overrides,
});

const renderList = (projects: Project[], onReview = vi.fn()) =>
  render(
    <MemoryRouter>
      <ProjectCardListView projects={projects} onReview={onReview} />
    </MemoryRouter>,
  );

beforeEach(() => {
  mockNavigate.mockClear();
});

describe('ProjectCardListView', () => {
  describe('AC 2 — column header order', () => {
    it('renders column headers in the AC 2 specified order: Name, Status, Client, Tickets, Blocked, Last Activity', () => {
      renderList([makeProject()]);
      const headers = screen.getAllByRole('columnheader').map((th) => th.textContent?.trim());
      expect(headers).toEqual(['Project Name', 'Status', 'Client', 'Tickets', 'Blocked', 'Last Activity', 'Actions']);
    });
  });

  describe('AC 2 — semantic HTML table structure', () => {
    it('renders a native <table> element', () => {
      const { container } = renderList([makeProject()]);
      expect(container.querySelector('table')).not.toBeNull();
    });

    it('renders <thead> and <tbody>', () => {
      const { container } = renderList([makeProject()]);
      expect(container.querySelector('thead')).not.toBeNull();
      expect(container.querySelector('tbody')).not.toBeNull();
    });

    it('renders one <tr> per project in <tbody>', () => {
      const projects = [makeProject({ id: '1' }), makeProject({ id: '2' }), makeProject({ id: '3' })];
      const { container } = renderList(projects);
      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(3);
    });
  });

  describe('row data display', () => {
    it('shows project name, client, status, ticket count, blocked count', () => {
      renderList([makeProject({
        name: 'My Project',
        client_name: 'ClientCo',
        status: 'active',
        tickets: { total: 8, in_progress: 2, completed: 4, blocked: 3, awaiting_approval: 0 },
      })]);

      expect(screen.getByText('My Project')).toBeInTheDocument();
      expect(screen.getByText('ClientCo')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('shows last_activity timestamp when present', () => {
      renderList([makeProject({ last_activity: '2026-02-15T14:30:00Z' })]);
      // Date formatting produces a string — verify the cell is not empty
      const activityCell = screen.getByRole('cell', { name: /feb 15/i });
      expect(activityCell).toBeInTheDocument();
    });

    it('shows "Never" for last activity when last_activity and updated_at are missing', () => {
      renderList([makeProject({ last_activity: null, updated_at: '' })]);
      expect(screen.getByText(/never/i)).toBeInTheDocument();
    });
  });

  describe('Actions column', () => {
    it('shows "Review" button when awaiting_approval > 0', () => {
      renderList([makeProject({
        tickets: { total: 5, in_progress: 1, completed: 2, blocked: 0, awaiting_approval: 1 },
      })]);
      expect(screen.getByRole('button', { name: /review/i })).toBeInTheDocument();
    });

    it('calls onReview with the project when Review is clicked', () => {
      const project = makeProject({
        tickets: { total: 5, in_progress: 1, completed: 2, blocked: 0, awaiting_approval: 1 },
      });
      const onReview = vi.fn();
      renderList([project], onReview);
      fireEvent.click(screen.getByRole('button', { name: /review/i }));
      expect(onReview).toHaveBeenCalledWith(project);
    });

    it('shows "Details" button when awaiting_approval is 0', () => {
      renderList([makeProject({
        tickets: { total: 5, in_progress: 1, completed: 2, blocked: 0, awaiting_approval: 0 },
      })]);
      expect(screen.getByRole('button', { name: /details/i })).toBeInTheDocument();
    });

    it('navigates to project detail page when project name is clicked', () => {
      renderList([makeProject({ id: 'proj-99', name: 'Clickable Project' })]);
      fireEvent.click(screen.getByText('Clickable Project'));
      expect(mockNavigate).toHaveBeenCalledWith('/projects/proj-99');
    });
  });

  describe('null safety (M1 guard)', () => {
    it('renders without crashing when tickets is undefined', () => {
      const project = makeProject({ tickets: undefined as any });
      expect(() => renderList([project])).not.toThrow();
    });

    it('displays 0 for ticket counts when tickets is undefined', () => {
      const project = makeProject({ tickets: undefined as any });
      renderList([project]);
      // Two "0" cells for total and blocked
      const zeroCells = screen.getAllByText('0');
      expect(zeroCells.length).toBeGreaterThanOrEqual(2);
    });

    it('shows Details button (not Review) when tickets is undefined', () => {
      renderList([makeProject({ tickets: undefined as any })]);
      expect(screen.getByRole('button', { name: /details/i })).toBeInTheDocument();
    });
  });

  describe('status badge colors', () => {
    it('applies emerald styling for active status', () => {
      const { container } = renderList([makeProject({ status: 'active' })]);
      const badge = container.querySelector('.text-emerald-500');
      expect(badge).not.toBeNull();
    });

    it('applies amber styling for on-hold status', () => {
      const { container } = renderList([makeProject({ status: 'on-hold' })]);
      const badge = container.querySelector('.text-amber-500');
      expect(badge).not.toBeNull();
    });

    it('falls back to paused styling for unknown status', () => {
      const { container } = renderList([makeProject({ status: 'unknown-status' as any })]);
      const badge = container.querySelector('.text-slate-500');
      expect(badge).not.toBeNull();
    });
  });

  describe('empty state', () => {
    it('renders a table with no rows when projects array is empty', () => {
      const { container } = renderList([]);
      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(0);
    });
  });
});

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';

const mockUseAuth = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children?: ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children?: ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children?: ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

import { ImprovedSidebar } from '@/components/improved/Sidebar';

const renderSidebar = (initialPath = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ImprovedSidebar />
    </MemoryRouter>,
  );
};

describe('ImprovedSidebar', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'u-1',
        role: 'ADMIN',
        fullName: 'Test User',
        email: 'test@example.com',
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders navigation from shared config (including PM Approvals item)', () => {
    renderSidebar('/approvals');

    expect(screen.getByRole('link', { name: 'PM Approvals' })).toBeInTheDocument();
  });

  it('uses PanelLeftClose/PanelLeftOpen icon pair for sidebar toggle', () => {
    renderSidebar('/');

    const collapseButton = screen.getByRole('button', { name: 'Collapse sidebar' });
    expect(screen.getByTestId('sidebar-collapse-icon')).toBeInTheDocument();

    fireEvent.click(collapseButton);

    screen.getByRole('button', { name: 'Expand sidebar' });
    expect(screen.getByTestId('sidebar-expand-icon')).toBeInTheDocument();
  });

  it('auto-expands the group containing the active route on initial render', () => {
    // /architecture-review/queue belongs to the "architecture" group which is NOT in the default expanded list
    renderSidebar('/architecture-review/queue');

    // The Architecture group header should be visible and the active link rendered
    expect(screen.getByRole('link', { name: 'Review Queue' })).toBeInTheDocument();
  });

  it('updates the relative Last sync timestamp over time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-02T12:00:00.000Z'));

    renderSidebar('/');

    const lastSync = screen.getByTestId('last-sync-value');
    const initialValue = lastSync.textContent;

    act(() => {
      vi.advanceTimersByTime(120_000);
    });

    expect(lastSync.textContent).not.toEqual(initialValue);
    expect(lastSync.textContent).toContain('ago');
  });
});

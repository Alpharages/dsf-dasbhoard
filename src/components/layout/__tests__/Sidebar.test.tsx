import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { ComponentProps, ReactNode } from 'react';

const mockUseAuth = vi.fn();

vi.mock('@/contexts', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/components/notifications/NotificationCenter', () => ({
  NotificationCenter: () => <div data-testid="notification-center" />,
}));

vi.mock('@/components/improved/ThemeToggle', () => ({
  ThemeToggleCompact: () => <button type="button">Theme</button>,
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children?: ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children?: ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children?: ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children?: ReactNode }) => <div role="tooltip">{children}</div>,
}));

vi.mock('framer-motion', () => ({
  motion: {
    header: ({ children, ...props }: { children?: ReactNode } & ComponentProps<'header'>) => (
      <header {...props}>{children}</header>
    ),
  },
}));

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

const renderWithRouter = (ui: ReactNode, initialPath = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      {ui}
    </MemoryRouter>
  );
};

describe('Sidebar responsive navigation', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'u-1',
        role: 'ADMIN',
        fullName: 'Test User',
        email: 'test@example.com',
      },
      logout: vi.fn(),
    });
  });

  it('renders tablet icon links with accessible labels and active state', () => {
    renderWithRouter(<Sidebar />, '/projects/sync');

    const tabletDashboard = screen.getByTestId('tablet-nav-root');
    const tabletProjects = screen.getByTestId('tablet-nav-projects-sync');

    expect(tabletDashboard).toHaveAttribute('aria-label', 'Dashboard');
    expect(tabletProjects).toHaveAttribute('aria-label', 'Projects');
    expect(tabletProjects).toHaveAttribute('aria-current', 'page');
  });

  it('includes per-item tooltip content for tablet navigation links', () => {
    renderWithRouter(<Sidebar />, '/');

    expect(screen.getByRole('tooltip', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('tooltip', { name: 'Projects' })).toBeInTheDocument();
    expect(screen.getByRole('tooltip', { name: 'Capacity Monitor' })).toBeInTheDocument();
  });
});

describe('Header mobile drawer integration', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'u-2',
        role: 'ADMIN',
        fullName: 'Drawer User',
        email: 'drawer@example.com',
      },
      logout: vi.fn(),
    });
  });

  it('opens mobile sidebar from Header Open menu button and closes on navigation click', async () => {
    renderWithRouter(<Header />, '/');

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('link', { name: 'Projects' }));
    await waitFor(() => {
      expect(screen.queryByText('Overview')).not.toBeInTheDocument();
    });
  });

  it('closes mobile sidebar when pressing Escape', async () => {
    renderWithRouter(<Header />, '/');

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    // Escape is the standard keyboard dismissal for Radix Sheet/Dialog.
    // Preferred over querying internal `data-slot` attributes which are
    // unstable shadcn/ui implementation details.
    fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape', charCode: 27 });

    await waitFor(() => {
      expect(screen.queryByText('Overview')).not.toBeInTheDocument();
    });
  });
});

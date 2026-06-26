// @vitest-environment jsdom
import { render, waitFor } from '@testing-library/react';
import { PmIntegrationCallback } from '@/pages/settings/PmIntegrationCallback';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

vi.mock('react-hot-toast');

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderWithRouter = (initialEntries: string[]) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/settings/pm-callback" element={<PmIntegrationCallback />} />
          <Route path="/settings/connected-apps" element={<div>Connected Apps Page</div>} />
          <Route path="/projects/:projectId/settings/integrations" element={<div>Project Integrations Page</div>} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          <Route path="/projects/sync" element={<div>Projects Sync Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('PmIntegrationCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('redirects to connected apps settings when returnTo=settings', async () => {
    renderWithRouter(['/settings/pm-callback?integration=connected&returnTo=settings']);

    await waitFor(() => {
      expect(screen.getByText('Connected Apps Page')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    expect(toast.success).toHaveBeenCalledWith('Account connected successfully!');
  });

  it('redirects to project integrations when state=projectId is provided', async () => {
    renderWithRouter(['/settings/pm-callback?integration=connected&state=project-123']);

    await waitFor(() => {
      expect(screen.getByText('Project Integrations Page')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('redirects to dashboard by default', async () => {
    renderWithRouter(['/settings/pm-callback?integration=connected']);

    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('handles error state and redirects to connected-apps if returnTo=settings', async () => {
    renderWithRouter(['/settings/pm-callback?integration=error&returnTo=settings']);

    await waitFor(() => {
      expect(screen.getByText('Connected Apps Page')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(toast.error).toHaveBeenCalledWith('Failed to connect account.');
  });

  it('redirects to /projects/sync?openImport=true on success when returnTo=import', async () => {
    renderWithRouter(['/settings/pm-callback?integration=connected&returnTo=import']);

    await waitFor(() => {
      expect(screen.getByText('Projects Sync Page')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(toast.success).toHaveBeenCalledWith('Account connected! Resuming import...');
  });

  it('redirects to /projects/sync on error when returnTo=import', async () => {
    renderWithRouter(['/settings/pm-callback?integration=error&returnTo=import']);

    await waitFor(() => {
      expect(screen.getByText('Projects Sync Page')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(toast.error).toHaveBeenCalledWith('Failed to connect account.');
  });
});

// Import screen here to fix the reference in tests
import { screen } from '@testing-library/react';

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinancialMetricsSection } from '@/components/financial/FinancialMetricsSection';
import { useAuth } from '@/contexts/AuthContext';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/components/financial/CostPerFeatureChart', () => ({
  CostPerFeatureChart: ({ projectId }: { projectId: string }) => <div data-testid="cost-project">{projectId}</div>,
}));
vi.mock('@/components/financial/RoiGaugeWidget', () => ({
  RoiGaugeWidget: ({ projectId }: { projectId: string }) => <div data-testid="roi-project">{projectId}</div>,
}));
vi.mock('@/components/financial/BudgetTrendChart', () => ({
  BudgetTrendChart: ({ projectId }: { projectId: string }) => <div data-testid="budget-project">{projectId}</div>,
}));
vi.mock('@/components/financial/ModelEfficiencyTable', () => ({
  ModelEfficiencyTable: ({ projectId }: { projectId: string }) => <div data-testid="efficiency-project">{projectId}</div>,
}));

function renderSection(projectId?: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <FinancialMetricsSection projectId={projectId} />
    </QueryClientProvider>,
  );
}

describe('FinancialMetricsSection', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'admin-1',
        role: 'ADMIN',
        email: 'admin@example.com',
        fullName: 'Admin User',
        isActive: true,
        lastLoginAt: null,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
    });
  });

  it('uses the current project prop instead of a stale saved project', async () => {
    localStorage.setItem('lastSelectedFinancialProject', 'deleted-project');

    renderSection('active-project');

    expect(screen.getByTestId('budget-project')).toHaveTextContent('active-project');
    await waitFor(() => {
      expect(localStorage.getItem('lastSelectedFinancialProject')).toBe('active-project');
    });
  });

  it('does not query widgets while no current project is available', () => {
    localStorage.setItem('lastSelectedFinancialProject', 'deleted-project');

    renderSection();

    expect(screen.getByText('Select a project to view financial metrics')).toBeInTheDocument();
    expect(screen.queryByTestId('budget-project')).not.toBeInTheDocument();
  });
});

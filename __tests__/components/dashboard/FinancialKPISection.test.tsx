import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinancialKPISection } from '../../../components/dashboard/FinancialKPISection';
import apiClient from '../../../api/client';
import { useAuth } from '../../../contexts/AuthContext';

vi.mock('../../../api/client');
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <FinancialKPISection />
    </QueryClientProvider>,
  );
}

type AuthValue = ReturnType<typeof useAuth>;

function makeAuthValue(role: 'MANAGER' | 'PM' | 'ADMIN'): AuthValue {
  return {
    user: {
      id: `u-${role.toLowerCase()}`,
      role,
      email: `${role.toLowerCase()}@example.com`,
      fullName: `${role} User`,
      isActive: true,
      lastLoginAt: null,
    },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
  };
}

describe('FinancialKPISection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders KPI values for MANAGER role', async () => {
    vi.mocked(useAuth).mockReturnValue(makeAuthValue('MANAGER'));
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        cost_per_ticket: 50,
        daily_budget_burn: [5, 10, 15, 20, 25, 30, 15, 10, 5, 8, 9, 11, 13, 7],
        budget_ceiling: 1000,
        budget_forecast: 850,
      },
    } as never);

    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Cost per Ticket')).toBeInTheDocument();
      expect(screen.getByText('$50.00')).toBeInTheDocument();
      expect(screen.getByText('Budget Burn Rate')).toBeInTheDocument();
    });
  });

  it('does not render for PM role and does not fetch data', () => {
    vi.mocked(useAuth).mockReturnValue(makeAuthValue('PM'));

    renderSection();

    expect(screen.queryByText('Cost per Ticket')).not.toBeInTheDocument();
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it('shows graceful no-data fallback', async () => {
    vi.mocked(useAuth).mockReturnValue(makeAuthValue('ADMIN'));
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        cost_per_ticket: null,
        daily_budget_burn: Array(14).fill(0),
        budget_ceiling: 0,
        budget_forecast: 0,
      },
    } as never);

    renderSection();

    await waitFor(() => {
      expect(screen.getAllByText('No data yet').length).toBeGreaterThan(0);
    });
  });
});

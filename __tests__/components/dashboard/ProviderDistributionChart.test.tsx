import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProviderDistributionChart } from '@/components/dashboard/ProviderDistributionChart.tsx';
import type { DashboardSummary } from '@/types';

describe('ProviderDistributionChart', () => {
  it('shows no-data fallback when distribution is empty', () => {
    const summary: DashboardSummary = {
      total_projects: 0,
      active_projects: 0,
      total_tickets: 0,
      blocked_tickets: 0,
      utilization_percent: 0,
      provider_distribution: [],
    };

    render(<ProviderDistributionChart summary={summary} />);

    expect(screen.getByText('AI Provider Distribution')).toBeInTheDocument();
    expect(screen.getByText('No data yet')).toBeInTheDocument();
  });

  it('renders chart container when provider distribution exists', () => {
    const summary: DashboardSummary = {
      total_projects: 1,
      active_projects: 1,
      total_tickets: 4,
      blocked_tickets: 0,
      utilization_percent: 20,
      provider_distribution: [
        { provider: 'CLAUDE', percentage: 50, count: 2 },
        { provider: 'CURSOR', percentage: 50, count: 2 },
        { provider: 'WINDSURF', percentage: 0, count: 0 },
      ],
    };

    const { container } = render(<ProviderDistributionChart summary={summary} />);

    expect(screen.getByText('AI Provider Distribution')).toBeInTheDocument();
    expect(screen.queryByText('No data yet')).not.toBeInTheDocument();
    expect(container.querySelector('.recharts-responsive-container')).not.toBeNull();
  });
});

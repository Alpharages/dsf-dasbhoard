import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import type { DashboardSummary } from '@/types';

describe('StatsGrid', () => {
  it('renders quality KPI widget labels and values', () => {
    const summary: DashboardSummary = {
      total_projects: 5,
      active_projects: 3,
      total_tickets: 10,
      blocked_tickets: 1,
      utilization_percent: 40,
      pr_merge_rate: 0.8,
      qa_first_pass_rate: 0.6,
    };

    render(<StatsGrid summary={summary} />);

    expect(screen.getByText('PR Merge Rate')).toBeInTheDocument();
    expect(screen.getByText('QA First-Pass Rate')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('gracefully degrades when quality metrics are missing', () => {
    const summary: DashboardSummary = {
      total_projects: 5,
      active_projects: 3,
      total_tickets: 10,
      blocked_tickets: 1,
      utilization_percent: 40,
    };

    render(<StatsGrid summary={summary} />);

    expect(screen.getAllByText('No data yet').length).toBeGreaterThan(0);
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CostPerFeatureChart } from '@/components/financial/CostPerFeatureChart';
import { financialApi } from '@/api/financialApi';

vi.mock('@/api/financialApi', () => ({
  financialApi: {
    getEpics: vi.fn(),
    getCostPerFeature: vi.fn(),
    downloadCostPerFeatureCsv: vi.fn(),
  },
}));

function renderChart(projectId?: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <CostPerFeatureChart projectId={projectId} />
    </QueryClientProvider>,
  );
}

describe('CostPerFeatureChart — epic selector is data-driven (BUG-04)', () => {
  beforeEach(() => {
    vi.mocked(financialApi.getEpics).mockResolvedValue([
      { epicId: 'epic-9', epicTitle: 'Epic 9' },
      { epicId: 'epic-10', epicTitle: 'Epic 10' },
    ]);
    vi.mocked(financialApi.getCostPerFeature).mockResolvedValue([
      {
        epicId: 'epic-9',
        epicTitle: 'Epic 9',
        totalCostUsd: '100.00',
        storyCount: 2,
        avgCostPerStory: '50.00',
        storyCosts: [],
        byProvider: [],
      },
    ]);
  });

  it('fetches epics for the project and renders them as options instead of a hardcoded list', async () => {
    renderChart('project-1');

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Epic 9' })).toBeInTheDocument();
    });
    expect(screen.getByRole('option', { name: 'Epic 10' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Epic 5' })).not.toBeInTheDocument();
    expect(financialApi.getEpics).toHaveBeenCalledWith({ projectId: 'project-1' });
  });

  it('defaults selection to the first fetched epic, not a hardcoded id', async () => {
    renderChart('project-1');

    await waitFor(() => {
      expect(financialApi.getCostPerFeature).toHaveBeenCalledWith({
        epicId: 'epic-9',
        projectId: 'project-1',
      });
    });
  });
});

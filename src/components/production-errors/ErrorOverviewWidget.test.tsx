/**
 * Error Overview Widget Tests
 * Story 9-U-5: Production Error Dashboard
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorOverviewWidget } from './ErrorOverviewWidget';

// Mock the hook
vi.mock('@/hooks/useProductionErrors', () => ({
  useProductionErrorsOverview: vi.fn(),
}));

import { useProductionErrorsOverview } from '@/hooks/useProductionErrors';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('ErrorOverviewWidget', () => {
  it('renders loading state', () => {
    (useProductionErrorsOverview as any).mockReturnValue({
      data: null,
      isLoading: true,
    });

    const { container } = renderWithQueryClient(<ErrorOverviewWidget />);
    
    // Check for skeleton elements by their appearance (4 stat cards = 4 skeletons)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders overview data correctly', () => {
    (useProductionErrorsOverview as any).mockReturnValue({
      data: {
        totalActiveErrors: 10,
        newErrors24h: 5,
        criticalErrors: 2,
        highErrors: 3,
        mediumErrors: 3,
        lowErrors: 2,
        mttrHours: 24.5,
      },
      isLoading: false,
    });

    renderWithQueryClient(<ErrorOverviewWidget />);
    
    expect(screen.getByText('Total Active Errors')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('New Errors (24h)')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
    expect(screen.getByText('24.5h')).toBeInTheDocument();
  });

  it('handles missing mttr data', () => {
    (useProductionErrorsOverview as any).mockReturnValue({
      data: {
        totalActiveErrors: 5,
        newErrors24h: 2,
        criticalErrors: 1,
        highErrors: 1,
        mediumErrors: 2,
        lowErrors: 1,
        mttrHours: undefined,
      },
      isLoading: false,
    });

    renderWithQueryClient(<ErrorOverviewWidget />);
    
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});

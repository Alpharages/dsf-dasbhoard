/**
 * Production Errors Hooks Tests
 * Story 9-U-5: Production Error Dashboard
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useProductionErrorsOverview,
  useProductionErrors,
  useProductionErrorTrends,
  useApplicationHealth,
} from '@/hooks/useProductionErrors';
import * as api from '@/api/production-errors';
import type { ErrorSeverity } from '@/api/production-errors';

// Mock the API
vi.mock('@/api/production-errors', () => ({
  getErrorOverview: vi.fn(),
  getErrorList: vi.fn(),
  getErrorTrends: vi.fn(),
  getApplicationHealth: vi.fn(),
  getApplications: vi.fn(),
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useProductionErrorsOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches overview data', async () => {
    const mockData = {
      totalActiveErrors: 10,
      newErrors24h: 5,
      criticalErrors: 2,
      highErrors: 3,
      mediumErrors: 3,
      lowErrors: 2,
    };

    (api.getErrorOverview as any).mockResolvedValue(mockData);

    const { result } = renderHook(() => useProductionErrorsOverview(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });

    expect(api.getErrorOverview).toHaveBeenCalledTimes(1);
  });
});

describe('useProductionErrors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches error list with filters', async () => {
    const mockData = {
      errors: [
        {
          id: 'error-1',
          application: 'api-service',
          error_type: 'TypeError',
          error_message: 'Test error',
          severity: 'CRITICAL',
          occurred_at: new Date().toISOString(),
          affected_users: 5,
          occurrence_count: 10,
          resolved: false,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    };

    (api.getErrorList as any).mockResolvedValue(mockData);

    const filters = { severity: ['CRITICAL'] as ErrorSeverity[], page: 1, limit: 20 };
    const { result } = renderHook(() => useProductionErrors(filters), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });

    expect(api.getErrorList).toHaveBeenCalledWith(filters);
  });
});

describe('useProductionErrorTrends', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches error trends', async () => {
    const mockData = {
      dates: ['2026-02-01', '2026-02-02'],
      trendsBySeverity: {
        CRITICAL: [1, 2],
        HIGH: [3, 4],
        MEDIUM: [5, 6],
        LOW: [7, 8],
      },
    };

    (api.getErrorTrends as any).mockResolvedValue(mockData);

    const { result } = renderHook(() => useProductionErrorTrends(7), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });

    expect(api.getErrorTrends).toHaveBeenCalledWith(7);
  });
});

describe('useApplicationHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches application health', async () => {
    const mockData = {
      applications: [
        {
          application: 'api-service',
          errorCount24h: 12,
          criticalCount: 1,
          highCount: 3,
          mediumCount: 8,
          lowCount: 0,
          healthStatus: 'RED',
        },
      ],
    };

    (api.getApplicationHealth as any).mockResolvedValue(mockData);

    const { result } = renderHook(() => useApplicationHealth(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });

    expect(api.getApplicationHealth).toHaveBeenCalledTimes(1);
  });
});

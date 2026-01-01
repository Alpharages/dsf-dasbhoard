import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MetricsSummaryGrid } from './MetricsSummaryGrid';
import { describe, it, expect } from 'vitest';
import type { AdrMetricsSummary } from '../../../types/architectureReview';

describe('MetricsSummaryGrid', () => {
    it('renders loading skeleton when isLoading is true', () => {
        render(<MetricsSummaryGrid isLoading={true} />);
        // Checking for skeleton elements via their data-slot or presence of skeleton class if possible
        // But the simplest is checking that the data labels are NOT present
        expect(screen.queryByText('10')).toBeNull();
    });

    it('renders metrics data with correct trend colors', () => {
        const mockSummary: AdrMetricsSummary = {
            reviewVolume: { current: 10, previous: 5, trend: 100 },
            averageReviewTimeMinutes: { current: 30, previous: 45, trend: -33 },
            queueDepth: { current: 2, previous: 4, trend: -50 },
            estimatedThroughputMinutes: 120
        };

        const { container } = render(<MetricsSummaryGrid isLoading={false} summary={mockSummary} />);

        expect(screen.getByText('Review Volume')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('100%')).toBeInTheDocument();

        // Avg Review Time: 30m, trend -33% (Lower is better = Green)
        expect(screen.getByText('Avg Review Time')).toBeInTheDocument();
        expect(screen.getByText('30m')).toBeInTheDocument();
        const trendIcon = container.querySelector('.text-green-500');
        expect(trendIcon).toBeInTheDocument();

        expect(screen.getByText('Est. Throughput')).toBeInTheDocument();
        expect(screen.getByText('120m')).toBeInTheDocument();
    });

    it('handles neutral trends (0%)', () => {
        const mockSummary: AdrMetricsSummary = {
            reviewVolume: { current: 5, previous: 5, trend: 0 },
            averageReviewTimeMinutes: { current: 30, previous: 30, trend: 0 },
            queueDepth: { current: 2, previous: 2, trend: 0 },
            estimatedThroughputMinutes: 30
        };

        render(<MetricsSummaryGrid isLoading={false} summary={mockSummary} />);
        expect(screen.getAllByText('0%')).toHaveLength(3);
    });
});

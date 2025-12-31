import { render, screen, fireEvent } from '@testing-library/react';
import { AdrReviewQueueTable } from './AdrReviewQueueTable';
import { vi, describe, it, expect } from 'vitest';
import type { AdrQueueItem } from '../../types/architectureReview';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Clock: () => <span data-testid="clock-icon" />,
    ExternalLink: () => <span data-testid="external-link-icon" />,
    AlertTriangle: () => <span data-testid="alert-icon" />,
    Shield: () => <span data-testid="shield-icon" />,
    CheckCircle: () => <span data-testid="check-icon" />,
    ShieldAlert: () => <span data-testid="shield-alert-icon" />,
    Info: () => <span data-testid="info-icon" />,
    Filter: () => <span data-testid="filter-icon" />,
    X: () => <span data-testid="x-icon" />,
}));

const mockItems: AdrQueueItem[] = [
    {
        id: '1',
        title: 'Use Postgres',
        status: 'PROPOSED',
        risk_level: 'LOW',
        confidence: 0.95,
        context: 'Context',
        decision: 'Decision',
        consequences: 'Consequences',
        alternatives: 'Alternatives',
        created_at: new Date().toISOString(),
        estimated_review_time_minutes: 5,
        ticket: { id: 't1', title: 'Ticket 1', clickup_task_id: 'C1' },
        execution_id: 'e1'
    },
    {
        id: '2',
        title: 'Use Mongo',
        status: 'PROPOSED',
        risk_level: 'HIGH',
        confidence: 0.4,
        context: 'Context',
        decision: 'Decision',
        consequences: 'Consequences',
        alternatives: 'Alternatives',
        created_at: new Date().toISOString(),
        estimated_review_time_minutes: 15,
        ticket: { id: 't2', title: 'Ticket 2', clickup_task_id: 'C2' },
        execution_id: 'e2'
    }
];

describe('AdrReviewQueueTable', () => {
    it('renders loading state', () => {
        render(
            <AdrReviewQueueTable
                items={[]}
                isLoading={true}
                onReview={vi.fn()}
                onSort={vi.fn()}
            />
        );
        // Can check for pulse class or number of skeleton rows
        const skeletons = document.getElementsByClassName('animate-pulse');
        expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders empty state', () => {
        render(
            <AdrReviewQueueTable
                items={[]}
                isLoading={false}
                onReview={vi.fn()}
                onSort={vi.fn()}
            />
        );
        expect(screen.getByText('Queue Empty')).toBeTruthy();
    });

    it('renders items correctly', () => {
        render(
            <AdrReviewQueueTable
                items={mockItems}
                isLoading={false}
                onReview={vi.fn()}
                onSort={vi.fn()}
            />
        );
        expect(screen.getByText('Use Postgres')).toBeTruthy();
        expect(screen.getByText('Use Mongo')).toBeTruthy();
        expect(screen.getByText('95%')).toBeTruthy();
        expect(screen.getByText('40%')).toBeTruthy();
    });

    it('calls onReview when review button clicked', () => {
        const handleReview = vi.fn();
        render(
            <AdrReviewQueueTable
                items={mockItems}
                isLoading={false}
                onReview={handleReview}
                onSort={vi.fn()}
            />
        );

        const buttons = screen.getAllByText('Review');
        fireEvent.click(buttons[0]);
        expect(handleReview).toHaveBeenCalledWith(mockItems[0]);
    });

    it('calls onSort when headers clicked', () => {
        const handleSort = vi.fn();
        render(
            <AdrReviewQueueTable
                items={mockItems}
                isLoading={false}
                onReview={vi.fn()}
                onSort={handleSort}
            />
        );

        fireEvent.click(screen.getByText(/Risk Level/));
        expect(handleSort).toHaveBeenCalledWith('risk_level');

        fireEvent.click(screen.getByText(/Confidence/));
        expect(handleSort).toHaveBeenCalledWith('confidence');
    });
});

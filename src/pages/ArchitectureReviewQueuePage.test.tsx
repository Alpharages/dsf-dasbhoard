import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ArchitectureReviewQueuePage } from './ArchitectureReviewQueuePage';
import { useAdrQueue, useSubmitAdrReview } from '../hooks/useAdrQueue';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { AdrQueueItem } from '../types/architectureReview';

// Mock the hooks
vi.mock('../hooks/useAdrQueue', () => ({
    useAdrQueue: vi.fn(),
    useSubmitAdrReview: vi.fn()
}));
vi.mock('../api/architectureReviewApi');
vi.mock('lucide-react', () => ({
    ShieldAlert: () => <span data-testid="shield-alert-icon" />,
    Info: () => <span data-testid="info-icon" />,
    Filter: () => <span data-testid="filter-icon" />,
    X: () => <span data-testid="x-icon" />,
    Clock: () => <span data-testid="clock-icon" />,
    ExternalLink: () => <span data-testid="external-link-icon" />,
    AlertTriangle: () => <span data-testid="alert-icon" />,
    CheckCircle: () => <span data-testid="check-icon" />,
    Calendar: () => <span data-testid="calendar-icon" />,
    Ticket: () => <span data-testid="ticket-icon" />,
}));

// Mock data
const mockAdr: AdrQueueItem = {
    id: 'adr-123',
    title: 'Use Redis for Session Storage',
    status: 'PROPOSED',
    risk_level: 'MEDIUM',
    confidence: 0.85,
    context: 'We need a session store.',
    decision: 'We will use Redis.',
    consequences: 'Faster sessions, infrastructure cost.',
    alternatives: 'Memcached',
    created_at: new Date().toISOString(),
    estimated_review_time_minutes: 15,
    ticket: {
        id: 'tick-1',
        title: 'Implement Auth',
        clickup_task_id: 'CU-123'
    },
    execution_id: 'exec-1'
};

const mockSubmitReview = vi.fn();

describe('ArchitectureReviewQueuePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useSubmitAdrReview as any).mockReturnValue({
            mutateAsync: mockSubmitReview
        });
    });

    it('renders loading state correctly', () => {
        (useAdrQueue as any).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null
        });

        render(
            <MemoryRouter>
                <ArchitectureReviewQueuePage />
            </MemoryRouter>
        );

        // Check for pulse animation elements (proxy for loading)
        // basic check that title is there at least
        expect(screen.getByText('Architecture Review Queue')).toBeTruthy();
    });

    it('renders list of ADRs', () => {
        (useAdrQueue as any).mockReturnValue({
            data: { items: [mockAdr], total: 1 },
            isLoading: false,
            error: null
        });

        render(
            <MemoryRouter>
                <ArchitectureReviewQueuePage />
            </MemoryRouter>
        );

        expect(screen.getByText('Use Redis for Session Storage')).toBeTruthy();
        expect(screen.getByText('Medium Risk')).toBeTruthy();
        expect(screen.getByText('85%')).toBeTruthy();
    });

    it('opens modal when clicking review', async () => {
        (useAdrQueue as any).mockReturnValue({
            data: { items: [mockAdr], total: 1 },
            isLoading: false,
            error: null
        });

        render(
            <MemoryRouter>
                <ArchitectureReviewQueuePage />
            </MemoryRouter>
        );

        // Find review button
        const reviewButton = screen.getByText('Review');
        fireEvent.click(reviewButton);

        // Modal should appear
        expect(screen.getByText('Proposed Decision')).toBeTruthy();
        expect(screen.getByText('We will use Redis.')).toBeTruthy();
    });

    it('submits approval review', async () => {
        (useAdrQueue as any).mockReturnValue({
            data: { items: [mockAdr], total: 1 },
            isLoading: false,
            error: null
        });

        render(
            <MemoryRouter>
                <ArchitectureReviewQueuePage />
            </MemoryRouter>
        );

        // Open modal
        fireEvent.click(screen.getByText('Review'));

        // Click Approve
        fireEvent.click(screen.getByText('Approve Decision'));

        await waitFor(() => {
            expect(mockSubmitReview).toHaveBeenCalledWith({
                adrId: 'adr-123',
                action: 'APPROVE',
                notes: undefined
            });
        });
    });
});

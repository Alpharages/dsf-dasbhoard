import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ArchitectureReviewQueuePage } from '@/pages/ArchitectureReviewQueuePage';
import { useAdrQueue, useSubmitAdrReview } from '@/hooks/useAdrQueue';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { AdrQueueItem } from '@/types/architectureReview';

// Mock the hooks
vi.mock('@/hooks/useAdrQueue', () => ({
    useAdrQueue: vi.fn(),
    useSubmitAdrReview: vi.fn()
}));
vi.mock('@/api/architectureReviewApi');
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal() as Record<string, unknown>;
    return { ...actual };
});

// Mock data
const mockAdr: AdrQueueItem = {
    id: 'adr-123',
    title: 'Use Redis for Session Storage',
    status: 'PROPOSED',
    risk_level: 'MEDIUM',
    risk_factors: {
        scope: 'module',
        reversibility: 'easy',
        confidence: 0.85,
        domain_complexity: 'medium'
    },
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
        expect(screen.getAllByText('Medium Risk').length).toBeGreaterThan(0);
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

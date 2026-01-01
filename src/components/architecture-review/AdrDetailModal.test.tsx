import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdrDetailModal } from './AdrDetailModal';
import { vi, describe, it, expect } from 'vitest';
import type { AdrQueueItem } from '../../types/architectureReview';

// Mock React Markdown to avoid parsing issues in tests
vi.mock('react-markdown', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    X: () => <span data-testid="x-icon" />,
    Calendar: () => <span data-testid="calendar-icon" />,
    Ticket: () => <span data-testid="ticket-icon" />,
    Clock: () => <span data-testid="clock-icon" />,
    CheckCircle: () => <span data-testid="check-icon" />,
    XCircle: () => <span data-testid="x-circle-icon" />,
    FileEdit: () => <span data-testid="file-edit-icon" />,
    Loader2: () => <span data-testid="loader-icon" />,
    Shield: () => <span data-testid="shield-icon" />,
    ShieldAlert: () => <span data-testid="shield-alert-icon" />,
    ShieldCheck: () => <span data-testid="shield-check-icon" />,
    HelpCircle: () => <span data-testid="help-circle-icon" />,
    Zap: () => <span data-testid="zap-icon" />,
    AlertOctagon: () => <span data-testid="alert-octagon-icon" />,
    FileWarning: () => <span data-testid="file-warning-icon" />,
    UserPlus: () => <span data-testid="user-plus-icon" />,
    Globe: () => <span data-testid="globe-icon" />,
    Settings: () => <span data-testid="settings-icon" />,
    Send: () => <span data-testid="send-icon" />,
    Users: () => <span data-testid="users-icon" />,
    Search: () => <span data-testid="search-icon" />,
    UserCheck: () => <span data-testid="user-check-icon" />,
    Scale: () => <span data-testid="scale-icon" />,
    FileQuestion: () => <span data-testid="file-question-icon" />,
    AlertTriangle: () => <span data-testid="alert-triangle-icon" />,
    Undo2: () => <span data-testid="undo2-icon" />,
    Brain: () => <span data-testid="brain-icon" />,
    Activity: () => <span data-testid="activity-icon" />,
    Info: () => <span data-testid="info-icon" />,
    Box: () => <span data-testid="box-icon" />,
    Boxes: () => <span data-testid="boxes-icon" />,
}));

const mockAdr: AdrQueueItem = {
    id: '1',
    title: 'Use Postgres',
    status: 'PROPOSED',
    risk_level: 'LOW',
    risk_factors: {
        scope: 'single-file',
        reversibility: 'easy',
        confidence: 0.95,
        domain_complexity: 'low'
    },
    confidence: 0.95,
    context: '# Context',
    decision: '**Decision**',
    consequences: '*Consequences*',
    alternatives: '- Alternatives',
    created_at: new Date().toISOString(),
    estimated_review_time_minutes: 5,
    ticket: { id: 't1', title: 'Ticket 1', clickup_task_id: 'C1' },
    execution_id: 'e1'
};

describe('AdrDetailModal', () => {
    it('renders nothing if adr is null', () => {
        const { container } = render(
            <AdrDetailModal
                adr={null}
                onClose={vi.fn()}
                onSubmitReview={vi.fn()}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders adr details correctly', () => {
        render(
            <AdrDetailModal
                adr={mockAdr}
                onClose={vi.fn()}
                onSubmitReview={vi.fn()}
            />
        );

        expect(screen.getByText('Use Postgres')).toBeTruthy();
        expect(screen.getByText('Context & Requirements')).toBeTruthy();
        // Since we mocked markdown, we expect raw text or simple rendered text
        expect(screen.getByText('# Context')).toBeTruthy();
        expect(screen.getByText('**Decision**')).toBeTruthy();
    });

    it('renders risk analysis card', () => {
        render(
            <AdrDetailModal
                adr={mockAdr}
                onClose={vi.fn()}
                onSubmitReview={vi.fn()}
            />
        );

        expect(screen.getByText('Risk Analysis')).toBeTruthy();
        expect(screen.getByText('Scope')).toBeTruthy();
        expect(screen.getByText('single file')).toBeTruthy(); // formatted scope
        expect(screen.getByText('Reversibility')).toBeTruthy();
        expect(screen.getByText('easy')).toBeTruthy();
    });

    it('calls onClose when close button clicked', () => {
        const handleClose = vi.fn();
        render(
            <AdrDetailModal
                adr={mockAdr}
                onClose={handleClose}
                onSubmitReview={vi.fn()}
            />
        );

        fireEvent.click(screen.getByTestId('x-icon').closest('button')!);
        expect(handleClose).toHaveBeenCalled();
    });

    it('handles approval submission', async () => {
        const handleSubmit = vi.fn().mockResolvedValue(undefined);
        const handleClose = vi.fn();

        render(
            <AdrDetailModal
                adr={mockAdr}
                onClose={handleClose}
                onSubmitReview={handleSubmit}
            />
        );

        // Click Approve
        fireEvent.click(screen.getByText('Approve Decision'));

        await waitFor(() => {
            expect(handleSubmit).toHaveBeenCalledWith('APPROVE', undefined);
            expect(handleClose).toHaveBeenCalled();
        });
    });

    it('opens rejection modal and submits with reason', async () => {
        const handleSubmit = vi.fn().mockResolvedValue(undefined);
        const handleClose = vi.fn();

        render(
            <AdrDetailModal
                adr={mockAdr}
                onClose={handleClose}
                onSubmitReview={handleSubmit}
            />
        );

        // Click Reject
        fireEvent.click(screen.getByText('Reject'));

        // Modal should open
        expect(screen.getByText('Reject Architecture Decision')).toBeTruthy();

        // Enter reason
        const input = screen.getByPlaceholderText(/Reason for rejection/);
        fireEvent.change(input, { target: { value: 'Too risky and not justified.' } });

        // Confirm
        // Note: The ReviewReasonModal creates a portal or new layer, 
        // but since we are rendering in JSDOM it should be accessible.
        // We need to target the *modal's* reject button, usually labeled 'Reject Decision' or similar.
        // Based on AdrDetailModal source, confirmLabel is 'Reject Decision'.
        // But the main view ALSO has a 'Reject Decision' button. 
        // The modal is rendered *after* the action. Wait, ReviewReasonModal component was not mocked.
        // It should render in the DOM.

        // Let's find the confirm button specifically in the modal.
        // The mock config says confirmLabel: 'Reject Decision'.
        // There might be two buttons with "Reject Decision" text now (one in footer, one in modal).
        // The footer one is "Reject Decision" (from ReviewActionButtons probably).

        // Let's use getByRole for specificity if possible, or getAllByText.
        const confirmButtons = screen.getAllByText('Reject Decision');
        // The last one should be the modal one (rendered later).
        fireEvent.click(confirmButtons[confirmButtons.length - 1]);

        await waitFor(() => {
            expect(handleSubmit).toHaveBeenCalledWith('REJECT', 'Too risky and not justified.');
            expect(handleClose).toHaveBeenCalled();
        });
    });
});

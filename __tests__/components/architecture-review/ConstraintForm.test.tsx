import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConstraintForm } from '@/components/architecture-review/ConstraintForm';

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('ConstraintForm', () => {
    const mockOnSubmit = vi.fn();
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders form when isOpen is true', () => {
        render(
            <ConstraintForm
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />,
            { wrapper }
        );

        expect(screen.getByText('Add Constraint')).toBeInTheDocument();
        expect(screen.getByText('Scope *')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
        const { container } = render(
            <ConstraintForm
                isOpen={false}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />,
            { wrapper }
        );

        expect(container.firstChild).toBeNull();
    });

    it('validates regex pattern for PATTERN type', async () => {
        render(
            <ConstraintForm
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />,
            { wrapper }
        );

        // Select PATTERN type
        const typeSelect = screen.getByDisplayValue(/Allowed Tech/i);
        fireEvent.change(typeSelect, { target: { value: 'PATTERN' } });

        // Enter invalid regex
        const patternInput = screen.getByPlaceholderText('e.g., /^[A-Z]/');
        fireEvent.change(patternInput, { target: { value: '[invalid(' } });

        await waitFor(() => {
            expect(screen.getByText(/invalid regex pattern/i)).toBeInTheDocument();
        });
    });

    it('disables submit button when form is invalid', () => {
        render(
            <ConstraintForm
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />,
            { wrapper }
        );

        const submitButton = screen.getByRole('button', { name: /Create Constraint/i });
        expect(submitButton).toBeDisabled();
    });

    it('calls onClose when cancel button is clicked', () => {
        render(
            <ConstraintForm
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />,
            { wrapper }
        );

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalled();
    });
});

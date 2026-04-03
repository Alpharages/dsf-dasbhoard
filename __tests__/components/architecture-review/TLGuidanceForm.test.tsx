import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TLGuidanceForm } from '@/components/architecture-review/TLGuidanceForm';
import { describe, it, expect, vi } from 'vitest';

// Mock react-markdown content as it can be complex to test directly
vi.mock('react-markdown', () => ({
    default: ({ children }: { children: string }) => <div data-testid="markdown-preview">{children}</div>
}));

describe('TLGuidanceForm', () => {
    it('renders correctly', () => {
        render(<TLGuidanceForm onSubmit={vi.fn()} isSubmitting={false} />);
        expect(screen.getByPlaceholderText(/Clarify requirements/i)).toBeInTheDocument();
        expect(screen.getByText('Provide Guidance to AI')).toBeInTheDocument();
    });

    it('handles tab switching', () => {
        render(<TLGuidanceForm onSubmit={vi.fn()} isSubmitting={false} />);

        // Initial state: Write tab
        const textarea = screen.getByPlaceholderText(/Clarify requirements/i);
        expect(textarea).toBeInTheDocument();

        // Switch to Preview
        fireEvent.click(screen.getByText('Preview'));
        expect(screen.queryByPlaceholderText(/Clarify requirements/i)).not.toBeInTheDocument();
        expect(screen.getByText('Nothing to preview')).toBeInTheDocument();

        // Switch back to Write
        fireEvent.click(screen.getByText('Write'));
        expect(screen.getByPlaceholderText(/Clarify requirements/i)).toBeInTheDocument();
    });

    it('shows markdown preview', () => {
        render(<TLGuidanceForm onSubmit={vi.fn()} isSubmitting={false} />);

        // Enter text
        const textarea = screen.getByPlaceholderText(/Clarify requirements/i);
        fireEvent.change(textarea, { target: { value: '# Hello' } });

        // Switch to Preview
        fireEvent.click(screen.getByText('Preview'));
        expect(screen.getByTestId('markdown-preview')).toHaveTextContent('# Hello');
    });

    it('submits guidance', () => {
        const handleSubmit = vi.fn();
        render(<TLGuidanceForm onSubmit={handleSubmit} isSubmitting={false} />);

        const textarea = screen.getByPlaceholderText(/Clarify requirements/i);
        fireEvent.change(textarea, { target: { value: 'Test guidance' } });

        fireEvent.click(screen.getByText('Send Guidance & Retry'));

        expect(handleSubmit).toHaveBeenCalledWith('Test guidance', false, false);
    });

    it('handles flags (Checkboxes)', () => {
        const handleSubmit = vi.fn();
        render(<TLGuidanceForm onSubmit={handleSubmit} isSubmitting={false} />);

        const textarea = screen.getByPlaceholderText(/Clarify requirements/i);
        fireEvent.change(textarea, { target: { value: 'Test guidance' } });

        // Use getByRole to avoid issues with nested tooltip text in label
        fireEvent.click(screen.getByRole('checkbox', { name: /Apply guidance globally/i }));
        fireEvent.click(screen.getByRole('checkbox', { name: /Adjust thresholds/i }));

        fireEvent.click(screen.getByText('Send Guidance & Retry'));

        expect(handleSubmit).toHaveBeenCalledWith('Test guidance', true, true);
    });

    it('disables submit button when empty or submitting', () => {
        const handleSubmit = vi.fn();
        const { rerender } = render(<TLGuidanceForm onSubmit={handleSubmit} isSubmitting={false} />);

        // Disabled when empty
        const button = screen.getByRole('button', { name: /Send Guidance/i });
        expect(button).toBeDisabled();

        // Enabled when text present
        fireEvent.change(screen.getByPlaceholderText(/Clarify requirements/i), { target: { value: 'Test' } });
        expect(button).not.toBeDisabled();

        // Disabled when submitting
        rerender(<TLGuidanceForm onSubmit={handleSubmit} isSubmitting={true} />);
        expect(screen.getByText('Sending...').closest('button')).toBeDisabled();
    });
});

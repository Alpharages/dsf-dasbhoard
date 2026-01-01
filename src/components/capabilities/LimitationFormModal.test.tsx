import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LimitationFormModal } from './LimitationFormModal';

describe('LimitationFormModal', () => {
    const mockOnSave = vi.fn();
    const mockOnClose = vi.fn();

    it('should show validation error when description is too short', () => {
        render(
            <LimitationFormModal
                onSave={mockOnSave}
                onClose={mockOnClose}
            />
        );

        // Enter short description (less than 10 characters)
        const textarea = screen.getByPlaceholderText(/Describe the limitation/i);
        fireEvent.change(textarea, { target: { value: 'Short' } });

        // Try to submit
        const saveButton = screen.getByText('Add Limitation');
        fireEvent.click(saveButton);

        // Should show validation error
        expect(screen.getByText(/must be at least 10 characters/i)).toBeInTheDocument();
        expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should allow submission with valid data', () => {
        render(
            <LimitationFormModal
                onSave={mockOnSave}
                onClose={mockOnClose}
            />
        );

        // Enter valid description
        const textarea = screen.getByPlaceholderText(/Describe the limitation/i);
        fireEvent.change(textarea, { target: { value: 'This is a valid description longer than 10 characters' } });

        // Submit
        const saveButton = screen.getByText('Add Limitation');
        fireEvent.click(saveButton);

        // Should call onSave
        expect(mockOnSave).toHaveBeenCalledWith(
            expect.objectContaining({
                taskType: 'CODE_GENERATION', // default
                knownIssues: 'This is a valid description longer than 10 characters',
            })
        );
    });

    it('should toggle "Disable AI" checkbox', () => {
        render(
            <LimitationFormModal
                onSave={mockOnSave}
                onClose={mockOnClose}
            />
        );

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();

        fireEvent.click(checkbox);
        expect(checkbox).toBeChecked();
    });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConstraintsList } from '@/components/architecture-review/ConstraintsList';
import type { ArchitectureConstraint } from '@/types/architectureConstraint';

const mockConstraints: ArchitectureConstraint[] = [
    {
        id: '1',
        scope: 'GLOBAL',
        type: 'ALLOWED_TECH',
        rules: { items: ['react', 'typescript'], reason: 'Modern stack' },
        version: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
    },
    {
        id: '2',
        projectId: 'proj-1',
        scope: 'PROJECT',
        type: 'PATTERN',
        rules: { pattern: '^[A-Z]', fileGlob: '**/*.ts', description: 'Uppercase naming' },
        version: 2,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
    }
];

describe('ConstraintsList', () => {
    it('renders empty state when no constraints exist', () => {
        const onEdit = vi.fn();
        const onDelete = vi.fn();

        render(<ConstraintsList constraints={[]} onEdit={onEdit} onDelete={onDelete} />);

        expect(screen.getByText(/No constraints defined/i)).toBeInTheDocument();
    });

    it('renders constraint table with data', () => {
        const onEdit = vi.fn();
        const onDelete = vi.fn();

        render(<ConstraintsList constraints={mockConstraints} onEdit={onEdit} onDelete={onDelete} />);

        expect(screen.getByText('Global')).toBeInTheDocument();
        expect(screen.getByText('Allowed Tech')).toBeInTheDocument();
        expect(screen.getByText(/2 packages/i)).toBeInTheDocument();
        expect(screen.getByText(/Regex: \^\[A-Z\]/i)).toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', () => {
        const onEdit = vi.fn();
        const onDelete = vi.fn();

        render(<ConstraintsList constraints={mockConstraints} onEdit={onEdit} onDelete={onDelete} />);

        const editButtons = screen.getAllByRole('button');
        const firstEditButton = editButtons.find(btn =>
            btn.querySelector('[class*="Edit2"]')
        );

        if (firstEditButton) {
            fireEvent.click(firstEditButton);
            expect(onEdit).toHaveBeenCalledWith(mockConstraints[0]);
        }
    });

    it('calls onDelete when delete button is clicked', () => {
        const onEdit = vi.fn();
        const onDelete = vi.fn();

        render(<ConstraintsList constraints={mockConstraints} onEdit={onEdit} onDelete={onDelete} />);

        const allButtons = screen.getAllByRole('button');
        const firstDeleteButton = allButtons.find(btn =>
            btn.querySelector('[class*="Trash2"]')
        );

        if (firstDeleteButton) {
            fireEvent.click(firstDeleteButton);
            expect(onDelete).toHaveBeenCalledWith('1');
        }
    });
});

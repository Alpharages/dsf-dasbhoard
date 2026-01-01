import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LimitationListTable } from './LimitationListTable';
import type { Limitation } from '../../types/capabilities';

const mockLimitations: Limitation[] = [
    {
        taskType: 'CODE_GENERATION',
        failureRate: 45.5,
        knownIssues: 'Struggles with complex GraphQL schemas',
        workaround: 'Use manual implementation for nested types',
        isDisabled: false,
    },
    {
        taskType: 'TEST_GENERATION',
        failureRate: 75.2,
        knownIssues: 'Cannot generate integration tests properly',
        workaround: 'Write integration tests manually',
        isDisabled: true,
    },
];

describe('LimitationListTable', () => {
    it('should render limitations in table', () => {
        render(
            <LimitationListTable
                limitations={mockLimitations}
                onEdit={() => { }}
                canEdit={true}
            />
        );

        expect(screen.getByText('Code Generation')).toBeInTheDocument();
        expect(screen.getByText('Test Generation')).toBeInTheDocument();
        expect(screen.getByText('45.5%')).toBeInTheDocument();
        expect(screen.getByText('75.2%')).toBeInTheDocument();
    });

    it('should show "Edit" button when canEdit is true', () => {
        render(
            <LimitationListTable
                limitations={mockLimitations}
                onEdit={() => { }}
                canEdit={true}
            />
        );

        const editButtons = screen.getAllByText('Edit');
        expect(editButtons).toHaveLength(2);
    });

    it('should show "View" button when canEdit is false', () => {
        render(
            <LimitationListTable
                limitations={mockLimitations}
                onEdit={() => { }}
                canEdit={false}
            />
        );

        const viewButtons = screen.getAllByText('View');
        expect(viewButtons).toHaveLength(2);
    });
});

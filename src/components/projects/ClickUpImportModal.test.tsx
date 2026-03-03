import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClickUpImportModal } from './ClickUpImportModal';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useClickUpHierarchy } from '../../hooks/useClickUpHierarchy';
import { useImportProject } from '../../hooks/useImportProject';

// Mock hooks
vi.mock('../../hooks/useClickUpHierarchy');
vi.mock('../../hooks/useImportProject');

const mockImportProject = vi.fn();
const mockOnClose = vi.fn();

describe('ClickUpImportModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useImportProject as any).mockReturnValue({
            mutate: mockImportProject,
            isPending: false
        });
        // Default mock for hierarchy
        (useClickUpHierarchy as any).mockReturnValue({
            data: null,
            isLoading: false
        });
    });

    it('renders provider selection initially', () => {
        render(<ClickUpImportModal isOpen={true} onClose={mockOnClose} />);
        expect(screen.getByText('Import Project')).toBeInTheDocument();
        expect(screen.getByText('CLICKUP')).toBeInTheDocument();
    });

    it('fetching multiple organizations shows selection list', () => {
        const orgs = [
            { id: 'org1', name: 'Org One', spaces: [] },
            { id: 'org2', name: 'Org Two', spaces: [] }
        ];
        (useClickUpHierarchy as any).mockReturnValue({
            data: { organizations: orgs },
            isLoading: false
        });

        render(<ClickUpImportModal isOpen={true} onClose={mockOnClose} />);
        fireEvent.click(screen.getByText('CLICKUP'));

        expect(screen.getByText('Select Organization')).toBeInTheDocument();
        expect(screen.getByText('Org One')).toBeInTheDocument();
        expect(screen.getByText('Org Two')).toBeInTheDocument();
    });

    it('single organization auto-skips to hierarchy', () => {
        const orgs = [
            { id: 'org1', name: 'Org One', spaces: [{ id: 'space1', name: 'Space One', lists: [] }] }
        ];
        (useClickUpHierarchy as any).mockReturnValue({
            data: { organizations: orgs },
            isLoading: false
        });

        render(<ClickUpImportModal isOpen={true} onClose={mockOnClose} />);
        fireEvent.click(screen.getByText('CLICKUP'));

        // Should skip Organization step and show Spaces
        expect(screen.getByText('Select List')).toBeInTheDocument();
        expect(screen.getByText('Space One')).toBeInTheDocument();
    });

    it('back button behavior for single org returns to provider', () => {
        const orgs = [
            { id: 'org1', name: 'Org One', spaces: [{ id: 'space1', name: 'Space One', lists: [] }] }
        ];
        (useClickUpHierarchy as any).mockReturnValue({
            data: { organizations: orgs },
            isLoading: false
        });

        render(<ClickUpImportModal isOpen={true} onClose={mockOnClose} />);
        fireEvent.click(screen.getByText('CLICKUP'));

        expect(screen.getByText('Select List')).toBeInTheDocument();

        const backButton = screen.getByText('Back');
        fireEvent.click(backButton);

        // Should go back to Provider
        expect(screen.getByText('Import Project')).toBeInTheDocument();
    });

    it('back button behavior for multiple orgs returns to organization list', () => {
        const orgs = [
            { id: 'org1', name: 'Org One', spaces: [{ id: 'space1', name: 'Space One', lists: [] }] },
            { id: 'org2', name: 'Org Two', spaces: [] }
        ];
        (useClickUpHierarchy as any).mockReturnValue({
            data: { organizations: orgs },
            isLoading: false
        });

        render(<ClickUpImportModal isOpen={true} onClose={mockOnClose} />);

        // Go to Provider -> Organization -> Hierarchy
        fireEvent.click(screen.getByText('CLICKUP'));
        fireEvent.click(screen.getByText('Org One'));

        expect(screen.getByText('Select List')).toBeInTheDocument();

        const backButton = screen.getByText('Back');
        fireEvent.click(backButton);

        // Should go back to Organization List
        expect(screen.getByText('Select Organization')).toBeInTheDocument();
    });
});

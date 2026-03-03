import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClickUpImportModal } from '@/components/projects/ClickUpImportModal';

// Mock hooks
vi.mock('@/hooks/useClickUpHierarchy', () => ({
    useClickUpHierarchy: vi.fn()
}));

vi.mock('@/hooks/useImportProject', () => ({
    useImportProject: vi.fn()
}));

// Mock toast
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

import { useClickUpHierarchy } from '@/hooks/useClickUpHierarchy';
import { useImportProject } from '@/hooks/useImportProject';

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('ClickUpImportModal', () => {
    const mockHierarchyData = {
        organizations: [
            {
                id: 'org1',
                name: 'Test Org',
                spaces: [
                    {
                        id: 'space1',
                        name: 'Test Space',
                        lists: [
                            { id: 'list1', name: 'List 1' },
                            { id: 'list2', name: 'List 2' }
                        ]
                    }
                ]
            }
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementations
        (useClickUpHierarchy as any).mockReturnValue({
            data: mockHierarchyData,
            isLoading: false
        });

        (useImportProject as any).mockReturnValue({
            mutate: vi.fn(),
            isPending: false
        });
    });

    it('renders provider selection step initially', () => {
        render(
            <ClickUpImportModal isOpen={true} onClose={vi.fn()} />,
            { wrapper: createWrapper() }
        );

        expect(screen.getByText('Import Project')).toBeInTheDocument();
        expect(screen.getByText('CLICKUP')).toBeInTheDocument();
        expect(screen.getByText('JIRA')).toBeInTheDocument();
        expect(screen.getByText('ASANA')).toBeInTheDocument();
    });

    it('shows "Coming soon" badges for Jira and Asana', () => {
        render(
            <ClickUpImportModal isOpen={true} onClose={vi.fn()} />,
            { wrapper: createWrapper() }
        );

        const soonBadges = screen.getAllByText('Soon');
        expect(soonBadges).toHaveLength(2);
    });

    it('navigates to hierarchy step when ClickUp is selected', async () => {
        render(
            <ClickUpImportModal isOpen={true} onClose={vi.fn()} />,
            { wrapper: createWrapper() }
        );

        const clickupButton = screen.getByRole('button', { name: /CLICKUP/i });
        fireEvent.click(clickupButton);

        await waitFor(() => {
            expect(screen.getByText('Select List')).toBeInTheDocument();
        });
    });

    it('displays spaces in hierarchy step', async () => {
        render(
            <ClickUpImportModal isOpen={true} onClose={vi.fn()} />,
            { wrapper: createWrapper() }
        );

        // Click ClickUp
        const clickupButton = screen.getByRole('button', { name: /CLICKUP/i });
        fireEvent.click(clickupButton);

        await waitFor(() => {
            expect(screen.getByText('Test Space')).toBeInTheDocument();
        });
    });

    it('shows loading state while fetching hierarchy', () => {
        (useClickUpHierarchy as any).mockReturnValue({
            data: null,
            isLoading: true
        });

        render(
            <ClickUpImportModal isOpen={true} onClose={vi.fn()} />,
            { wrapper: createWrapper() }
        );

        // Navigate to hierarchy step first
        const clickupButton = screen.getByRole('button', { name: /CLICKUP/i });
        fireEvent.click(clickupButton);

        expect(screen.getByText('Loading Organizations...')).toBeInTheDocument();
    });

    it('enables import button when list is selected', async () => {
        render(
            <ClickUpImportModal isOpen={true} onClose={vi.fn()} />,
            { wrapper: createWrapper() }
        );

        // Navigate to hierarchy
        const clickupButton = screen.getByRole('button', { name: /CLICKUP/i });
        fireEvent.click(clickupButton);

        await waitFor(() => {
            expect(screen.getByText('Test Space')).toBeInTheDocument();
        });

        // Select space
        fireEvent.click(screen.getByText('Test Space'));

        await waitFor(() => {
            expect(screen.getByText('List 1')).toBeInTheDocument();
        });

        // Select list
        fireEvent.click(screen.getByText('List 1'));

        await waitFor(() => {
            const importButton = screen.getByRole('button', { name: /Import Project/i });
            expect(importButton).not.toBeDisabled();
        });
    });
});

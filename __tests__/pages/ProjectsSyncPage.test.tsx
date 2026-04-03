import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectsSyncPage } from '@/pages/ProjectsSyncPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import apiClient from '@/api/client';

// Mock apiClient
vi.mock('@/api/client', () => ({
    default: {
        get: vi.fn(),
        patch: vi.fn(),
        post: vi.fn()
    }
}));

// Mock child components
vi.mock('@/components/projects/ProjectsTable', () => ({
    ProjectsTable: () => <div data-testid="projects-table">Projects Table</div>
}));

vi.mock('@/components/projects/ClickUpImportModal', () => ({
    ClickUpImportModal: () => <div data-testid="import-modal">Import Modal</div>
}));

// Mock UI Select component
vi.mock('@/components/ui/select', () => ({
    Select: ({ value, onValueChange, children }: any) => (
        <select
            data-testid="status-select"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
        >
            {children}
        </select>
    ),
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
    SelectTrigger: () => null, // Don't render trigger div inside select
    SelectValue: () => null,
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </MemoryRouter>
    );
};

describe('ProjectsSyncPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (apiClient.get as any).mockResolvedValue({ data: [] });
    });

    it('renders correctly', async () => {
        render(<ProjectsSyncPage />, { wrapper: createWrapper() });

        expect(screen.getByText('Projects & Sync')).toBeInTheDocument();
        expect(screen.getByTestId('status-select')).toBeInTheDocument();

        // Wait for loading to finish and table to appear
        await waitFor(() => {
            expect(screen.getByTestId('projects-table')).toBeInTheDocument();
        });
    });

    it('fetches projects with default filter', async () => {
        render(<ProjectsSyncPage />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(apiClient.get).toHaveBeenCalledWith('/projects', {
                params: { active: 'all' }
            });
        });
    });

    it('updates filter when changed', async () => {
        render(<ProjectsSyncPage />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(apiClient.get).toHaveBeenCalledWith('/projects', {
                params: { active: 'all' }
            });
        });

        const select = screen.getByTestId('status-select');
        fireEvent.change(select, { target: { value: 'true' } });

        await waitFor(() => {
            expect(apiClient.get).toHaveBeenCalledWith('/projects', {
                params: { active: 'true' }
            });
        });
    });

    it('refresh button triggers refetch', async () => {
        render(<ProjectsSyncPage />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(apiClient.get).toHaveBeenCalledTimes(1);
        });

        const refreshBtn = screen.getByTitle('Refresh Projects');
        fireEvent.click(refreshBtn);

        await waitFor(() => {
            expect(apiClient.get).toHaveBeenCalledTimes(2);
        });
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectsTable } from '../../components/projects/ProjectsTable';
import type { ProjectRowData } from '../../components/projects/ProjectsTable';
import apiClient from '../../api/client';
import { toast } from 'react-hot-toast';

// Mock apiClient
vi.mock('../../api/client', () => ({
    default: {
        patch: vi.fn()
    }
}));

// Mock toast
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

describe('ProjectsTable', () => {
    const mockProjects: ProjectRowData[] = [
        {
            id: '1',
            name: 'Test Project',
            provider: 'CLICKUP',
            monitor_tasks: true,
            github_repository_url: 'https://github.com/test/repo',
            status: 'active'
        },
        {
            id: '2',
            name: 'Another Project',
            provider: 'CLICKUP',
            monitor_tasks: false,
            github_repository_url: 'https://github.com/test/repo2',
            status: 'paused'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders project rows correctly', () => {
        render(<ProjectsTable projects={mockProjects} />);

        expect(screen.getByText('Test Project')).toBeInTheDocument();
        expect(screen.getByText('Another Project')).toBeInTheDocument();
    });

    it('displays provider icons correctly', () => {
        render(<ProjectsTable projects={mockProjects} />);

        const clickupLabels = screen.getAllByText('CLICKUP');
        expect(clickupLabels).toHaveLength(2);
    });

    it('toggles monitoring switch correctly', async () => {
        const mockOnUpdate = vi.fn();
        render(<ProjectsTable projects={mockProjects} onProjectUpdated={mockOnUpdate} />);

        const switches = screen.getAllByRole('switch');
        expect(switches[0]).toBeChecked();
        expect(switches[1]).not.toBeChecked();
    });

    it('expands row when chevron is clicked', async () => {
        render(<ProjectsTable projects={mockProjects} />);

        const expandButtons = screen.getAllByRole('button');
        fireEvent.click(expandButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('Project ID:')).toBeInTheDocument();
        });
    });

    it('shows empty state when no projects', () => {
        render(<ProjectsTable projects={[]} />);

        expect(screen.getByText(/No projects found/i)).toBeInTheDocument();
    });

    it('calls API and updates when monitoring is toggled', async () => {
        const mockOnUpdate = vi.fn();
        (apiClient.patch as any).mockResolvedValue({ data: {} });

        render(<ProjectsTable projects={mockProjects} onProjectUpdated={mockOnUpdate} />);

        const switches = screen.getAllByRole('switch');
        fireEvent.click(switches[1]); // Toggle the second project (currently disabled)

        await waitFor(() => {
            expect(apiClient.patch).toHaveBeenCalledWith('/projects/2', {
                monitor_tasks: true
            });
            expect(toast.success).toHaveBeenCalledWith('Monitoring enabled successfully');
            expect(mockOnUpdate).toHaveBeenCalled();
        });
    });

    it('handles API error with custom message', async () => {
        const mockOnUpdate = vi.fn();
        (apiClient.patch as any).mockRejectedValue({
            response: {
                data: {
                    message: 'Custom error from API'
                }
            }
        });

        render(<ProjectsTable projects={mockProjects} onProjectUpdated={mockOnUpdate} />);

        const switches = screen.getAllByRole('switch');
        fireEvent.click(switches[0]);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Custom error from API');
            expect(mockOnUpdate).not.toHaveBeenCalled();
        });
    });

    it('handles API error without custom message', async () => {
        (apiClient.patch as any).mockRejectedValue(new Error('Network error'));

        render(<ProjectsTable projects={mockProjects} />);

        const switches = screen.getAllByRole('switch');
        fireEvent.click(switches[0]);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to update monitoring status');
        });
    });

    it('disables switch during API call', async () => {
        let resolvePromise: any;
        const pendingPromise = new Promise((resolve) => {
            resolvePromise = resolve;
        });
        (apiClient.patch as any).mockReturnValue(pendingPromise);

        render(<ProjectsTable projects={mockProjects} />);

        const switches = screen.getAllByRole('switch');
        fireEvent.click(switches[0]);

        // Switch should be disabled while loading
        await waitFor(() => {
            expect(switches[0]).toBeDisabled();
        });

        // Resolve the promise
        resolvePromise({ data: {} });

        // Switch should be enabled again
        await waitFor(() => {
            expect(switches[0]).not.toBeDisabled();
        });
    });
});

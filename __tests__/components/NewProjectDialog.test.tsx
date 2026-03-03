import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NewProjectDialog } from '@/components/dashboard/NewProjectDialog';

// Mock hooks and api
vi.mock('@/contexts', () => ({
    useAuth: vi.fn()
}));

vi.mock('@/api/projectsApi', () => ({
    createProject: vi.fn()
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

import { useAuth } from '@/contexts';
import { createProject } from '@/api/projectsApi';
import { toast } from 'react-hot-toast';

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

describe('NewProjectDialog', () => {
    const mockOnOpenChange = vi.fn();
    const mockOnSuccess = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
            user: { id: 'pm-123' }
        });
        (createProject as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'proj-new' });
    });

    it('renders correctly when open', () => {
        render(
            <NewProjectDialog isOpen={true} onOpenChange={mockOnOpenChange} />,
            { wrapper: createWrapper() }
        );
        expect(screen.getByText('New Project')).toBeInTheDocument();
        expect(screen.getByLabelText(/Project Name \*/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Client Name \*/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/ClickUp List ID \*/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/GitHub Repository URL/i)).toBeInTheDocument();
    });

    it('shows validation errors for required fields', async () => {
        render(
            <NewProjectDialog isOpen={true} onOpenChange={mockOnOpenChange} />,
            { wrapper: createWrapper() }
        );

        const submitButton = screen.getByRole('button', { name: /Create Project/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Project Name is required')).toBeInTheDocument();
            expect(screen.getByText('Client Name is required')).toBeInTheDocument();
            expect(screen.getByText('ClickUp List ID is required')).toBeInTheDocument();
        });
    });

    it('submits successfully with valid data and no github URL', async () => {
        render(
            <NewProjectDialog isOpen={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />,
            { wrapper: createWrapper() }
        );

        fireEvent.change(screen.getByLabelText(/Project Name \*/i), { target: { value: 'Test Project' } });
        fireEvent.change(screen.getByLabelText(/Client Name \*/i), { target: { value: 'Test Client' } });
        fireEvent.change(screen.getByLabelText(/ClickUp List ID \*/i), { target: { value: '12345' } });

        const submitButton = screen.getByRole('button', { name: /Create Project/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            // Empty github_repository_url must be omitted from payload, not sent as ''
            expect(createProject).toHaveBeenCalledWith({
                name: 'Test Project',
                client_name: 'Test Client',
                clickup_list_id: '12345',
                pm_id: 'pm-123',
            });
            expect(toast.success).toHaveBeenCalledWith('Project created successfully');
            expect(mockOnOpenChange).toHaveBeenCalledWith(false);
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });

    it('submits successfully with a github URL provided', async () => {
        render(
            <NewProjectDialog isOpen={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />,
            { wrapper: createWrapper() }
        );

        fireEvent.change(screen.getByLabelText(/Project Name \*/i), { target: { value: 'Test Project' } });
        fireEvent.change(screen.getByLabelText(/Client Name \*/i), { target: { value: 'Test Client' } });
        fireEvent.change(screen.getByLabelText(/ClickUp List ID \*/i), { target: { value: '12345' } });
        fireEvent.change(screen.getByLabelText(/GitHub Repository URL/i), { target: { value: 'https://github.com/owner/repo' } });

        const submitButton = screen.getByRole('button', { name: /Create Project/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(createProject).toHaveBeenCalledWith({
                name: 'Test Project',
                client_name: 'Test Client',
                clickup_list_id: '12345',
                github_repository_url: 'https://github.com/owner/repo',
                pm_id: 'pm-123',
            });
        });
    });

    it('validates github repository url pattern', async () => {
        render(
            <NewProjectDialog isOpen={true} onOpenChange={mockOnOpenChange} />,
            { wrapper: createWrapper() }
        );

        fireEvent.change(screen.getByLabelText(/GitHub Repository URL/i), { target: { value: 'invalid-url' } });
        
        const submitButton = screen.getByRole('button', { name: /Create Project/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Must be a valid GitHub repository URL (e.g., https://github.com/owner/repo)')).toBeInTheDocument();
        });
    });
});

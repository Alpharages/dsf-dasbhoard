import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConstraintsPage } from '../../../pages/architecture-review/constraints/ConstraintsPage';
import * as hooks from '../../../hooks/api/useArchitectureConstraints';

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('ConstraintsPage', () => {
    it('renders page title and add button', () => {
        vi.spyOn(hooks, 'useArchitectureConstraints').mockReturnValue({
            data: [{ id: 'test', type: 'PATTERN', scope: 'GLOBAL', version: 1, title: 'Test', description: 'Test', tags: [], rules: { pattern: '.*' } }],
            isLoading: false,
            refetch: vi.fn(),
            error: null
        } as any);

        render(<ConstraintsPage />, { wrapper });

        expect(screen.getByText('Architecture Constraints')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add Constraint/i })).toBeInTheDocument();
    });

    it('displays empty state when no constraints exist', () => {
        vi.spyOn(hooks, 'useArchitectureConstraints').mockReturnValue({
            data: [],
            isLoading: false,
            refetch: vi.fn(),
            error: null
        } as any);

        render(<ConstraintsPage />, { wrapper });

        expect(screen.getByText('No constraints defined')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Create Constraint/i })).toBeInTheDocument();
        expect(screen.queryByText(/Failed to load constraints/i)).not.toBeInTheDocument();
    });

    it('displays loading state', () => {
        vi.spyOn(hooks, 'useArchitectureConstraints').mockReturnValue({
            data: [],
            isLoading: true,
            refetch: vi.fn(),
            error: null
        } as any);

        render(<ConstraintsPage />, { wrapper });

        expect(screen.getByText('Loading constraints...')).toBeInTheDocument();
    });

    it('displays error message on fetch failure', () => {
        vi.spyOn(hooks, 'useArchitectureConstraints').mockReturnValue({
            data: [],
            isLoading: false,
            refetch: vi.fn(),
            error: new Error('Network error')
        } as any);

        render(<ConstraintsPage />, { wrapper });

        expect(screen.getByText(/Failed to load constraints/i)).toBeInTheDocument();
    });

    it('opens form modal when Add Constraint button is clicked', async () => {
        vi.spyOn(hooks, 'useArchitectureConstraints').mockReturnValue({
            data: [{ id: 'test', type: 'PATTERN', scope: 'GLOBAL', version: 1, title: 'Test', description: 'Test', tags: [], rules: { pattern: '.*' } }],
            isLoading: false,
            refetch: vi.fn(),
            error: null
        } as any);

        render(<ConstraintsPage />, { wrapper });

        const addButton = screen.getByRole('button', { name: /Add Constraint/i });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /Add Constraint/i })).toBeInTheDocument();
        });
    });
});

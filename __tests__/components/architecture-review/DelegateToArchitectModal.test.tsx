import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DelegateToArchitectModal } from '@/components/architecture-review/DelegateToArchitectModal';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userApi } from '@/api/userApi';

// Mock userApi
vi.mock('@/api/userApi', () => ({
    userApi: {
        getUsers: vi.fn()
    }
}));

describe('DelegateToArchitectModal', () => {
    const mockUsers = [
        { id: '1', name: 'Alice Architect', role: 'ADMIN', email: 'alice@example.com' },
        { id: '2', name: 'Bob Builder', role: 'USER', email: 'bob@example.com' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (userApi.getUsers as any).mockResolvedValue(mockUsers);
    });

    it('does not render when closed', () => {
        render(<DelegateToArchitectModal isOpen={false} onClose={vi.fn()} onDelegate={vi.fn()} />);
        expect(screen.queryByText('Delegate Review')).not.toBeInTheDocument();
    });

    it('fetches and displays users when opened', async () => {
        render(<DelegateToArchitectModal isOpen={true} onClose={vi.fn()} onDelegate={vi.fn()} />);

        expect(screen.getByText('Loading architects...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Alice Architect')).toBeInTheDocument();
            expect(screen.getByText('Bob Builder')).toBeInTheDocument();
        });

        expect(userApi.getUsers).toHaveBeenCalled();
    });

    it('filters users by search query', async () => {
        render(<DelegateToArchitectModal isOpen={true} onClose={vi.fn()} onDelegate={vi.fn()} />);

        await waitFor(() => expect(screen.getByText('Alice Architect')).toBeInTheDocument());

        const searchInput = screen.getByPlaceholderText('Search architects...');
        fireEvent.change(searchInput, { target: { value: 'Alice' } });

        expect(screen.getByText('Alice Architect')).toBeInTheDocument();
        expect(screen.queryByText('Bob Builder')).not.toBeInTheDocument();
    });

    it('handles delegation submission', async () => {
        const handleDelegate = vi.fn().mockResolvedValue(undefined);
        const handleClose = vi.fn();

        render(<DelegateToArchitectModal isOpen={true} onClose={handleClose} onDelegate={handleDelegate} />);

        await waitFor(() => expect(screen.getByText('Alice Architect')).toBeInTheDocument());

        // Select user
        fireEvent.click(screen.getByText('Alice Architect'));

        // Add note
        fireEvent.change(screen.getByLabelText(/Delegation Note/i), { target: { value: 'Please review' } });

        // Submit
        fireEvent.click(screen.getByText('Confirm Delegation'));

        expect(handleDelegate).toHaveBeenCalledWith('1', 'Please review');
        await waitFor(() => expect(handleClose).toHaveBeenCalled());
    });
});

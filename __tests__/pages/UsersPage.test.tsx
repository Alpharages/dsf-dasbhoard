import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UsersPage from '@/pages/UsersPage';
import { usersApi } from '@/api/usersApi';

vi.mock('@/api/usersApi');

const mockUser = {
    id: 'u1',
    email: 'alice@example.com',
    fullName: 'Alice',
    role: 'ADMIN' as const,
    isActive: true,
    lastLoginAt: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
};

describe('UsersPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the page heading without crashing', async () => {
        (usersApi.getUsers as any).mockResolvedValue({
            users: [],
            pagination: { total: 0, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrevious: false },
        });
        render(<UsersPage />);
        expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    it('does not crash when API response has no pagination (fallback guard)', async () => {
        // Simulates the pre-fix state: meta was undefined, crashing on meta.totalPages
        (usersApi.getUsers as any).mockResolvedValue({
            users: [],
            pagination: undefined,
        });
        expect(() => render(<UsersPage />)).not.toThrow();
    });

    it('populates the users table when API returns users', async () => {
        (usersApi.getUsers as any).mockResolvedValue({
            users: [mockUser],
            pagination: { total: 1, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrevious: false },
        });
        render(<UsersPage />);
        // Component renders email in both desktop and mobile views
        await waitFor(() => {
            const emailElements = screen.getAllByText('alice@example.com');
            expect(emailElements.length).toBeGreaterThanOrEqual(1);
        });
    });
});

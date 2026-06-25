import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InvitationsPage } from '@/pages/InvitationsPage';
import { fetchInvitations } from '@/api/invitationsApi';

vi.mock('@/api/invitationsApi');

describe('InvitationsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(fetchInvitations).mockResolvedValue([]);
    });

    it('opens the create invitation dialog', async () => {
        render(<InvitationsPage />);

        await waitFor(() => {
            expect(screen.getAllByText('No invitations found.').length).toBeGreaterThanOrEqual(1);
        });

        await userEvent.click(screen.getByRole('button', { name: /create invite/i }));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /send invitation/i })).toBeInTheDocument();
    });
});

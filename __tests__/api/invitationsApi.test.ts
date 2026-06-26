import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/api/client';
import { createInvitation, fetchInvitations } from '@/api/invitationsApi';

vi.mock('@/api/client', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    },
}));

const invitation = {
    id: 'inv-1',
    email: 'user@example.com',
    role: 'VIEWER' as const,
    invitedById: 'admin-1',
    inviteToken: 'token-1',
    status: 'PENDING' as const,
    expiresAt: '2026-07-02T00:00:00.000Z',
    acceptedAt: null,
    createdAt: '2026-06-25T00:00:00.000Z',
    invitedBy: {
        fullName: 'System Administrator',
        email: 'admin@darksoftwarefactory.com',
    },
};

describe('invitationsApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('reads backend list response from items', async () => {
        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { items: [invitation] } });

        const result = await fetchInvitations();

        expect(apiClient.get).toHaveBeenCalledWith('/auth/invitations');
        expect(result).toEqual([{ ...invitation, invitedByName: 'System Administrator' }]);
    });

    it('wraps bare create response for the page', async () => {
        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: invitation });

        const result = await createInvitation({
            email: 'user@example.com',
            role: 'VIEWER',
            expiresInDays: 7,
        });

        expect(result).toEqual({
            invitation: { ...invitation, invitedByName: 'System Administrator' },
        });
    });
});

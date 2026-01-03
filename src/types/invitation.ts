export const InvitationStatus = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    EXPIRED: 'EXPIRED',
    REVOKED: 'REVOKED'
} as const;

export type InvitationStatus = typeof InvitationStatus[keyof typeof InvitationStatus];

export type Role = 'ADMIN' | 'MANAGER' | 'TL' | 'PM' | 'QA' | 'VIEWER';

export interface Invitation {
    id: string;
    email: string;
    role: Role;
    invitedById: string;
    invitedByName?: string; // Corresponds to backend join/enrichment
    inviteToken: string;
    status: InvitationStatus;
    expiresAt: string;
    acceptedAt: string | null;
    createdAt: string;
}

export interface CreateInvitationRequest {
    email: string;
    role: Role;
    expiresInDays?: number;
}

export interface CreateInvitationResponse {
    invitation: Invitation;
}

import apiClient from './client';
import type { CreateInvitationRequest, CreateInvitationResponse, Invitation } from '../types/invitation';

type InvitationApiResponse = Invitation & {
    invitedBy?: {
        fullName?: string;
        email?: string;
    };
};

const normalizeInvitation = (invitation: InvitationApiResponse): Invitation => ({
    ...invitation,
    invitedByName: invitation.invitedByName ?? invitation.invitedBy?.fullName ?? invitation.invitedBy?.email,
});

export const fetchInvitations = async (): Promise<Invitation[]> => {
    const response = await apiClient.get<{ items?: InvitationApiResponse[]; invitations?: InvitationApiResponse[] }>('/auth/invitations');
    return (response.data.items ?? response.data.invitations ?? []).map(normalizeInvitation);
};

export const createInvitation = async (data: CreateInvitationRequest): Promise<CreateInvitationResponse> => {
    const response = await apiClient.post<CreateInvitationResponse | InvitationApiResponse>('/auth/invitations', data);
    const invitation = 'invitation' in response.data ? response.data.invitation : response.data;
    return { invitation: normalizeInvitation(invitation) };
};

export const revokeInvitation = async (id: string): Promise<void> => {
    await apiClient.delete(`/auth/invitations/${id}`);
};

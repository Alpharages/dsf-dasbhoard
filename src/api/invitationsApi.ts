import apiClient from './client';
import type { CreateInvitationRequest, CreateInvitationResponse, Invitation } from '../types/invitation';

export const fetchInvitations = async (): Promise<Invitation[]> => {
    try {
        // Backend returns { invitations: Invitation[], total: number, ... }
        // We only return the array for now.
        const response = await apiClient.get<{ invitations: Invitation[] }>('/auth/invitations');
        return response.data.invitations;
    } catch (error) {
        throw error;
    }
};

export const createInvitation = async (data: CreateInvitationRequest): Promise<CreateInvitationResponse> => {
    try {
        const response = await apiClient.post<CreateInvitationResponse>('/auth/invitations', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const revokeInvitation = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/auth/invitations/${id}`);
    } catch (error) {
        throw error;
    }
};

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvitationsTable } from '@/components/invitations/InvitationsTable';
import { CreateInviteModal } from '@/components/invitations/CreateInviteModal';
import { RevokeConfirmDialog } from '@/components/invitations/RevokeConfirmDialog';
import { fetchInvitations, createInvitation, revokeInvitation } from '@/api/invitationsApi';
import { generateInviteLink, copyToClipboard } from '@/utils/invitationHelpers';
import type { Invitation, CreateInvitationRequest } from '@/types/invitation';

export const InvitationsPage: React.FC = () => {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [revokeTarget, setRevokeTarget] = useState<Invitation | null>(null);

    const loadInvitations = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchInvitations();
            setInvitations(data || []);
        } catch (error) {
            console.error('Failed to load invitations:', error);
            toast.error('Failed to load invitations');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInvitations();
    }, [loadInvitations]);

    const handleCreateInvite = async (data: CreateInvitationRequest) => {
        try {
            const response = await createInvitation(data);
            const link = generateInviteLink(response.invitation.inviteToken);

            // Try to copy to clipboard automatically
            try {
                await copyToClipboard(link);
                toast.success('Invitation sent & link copied to clipboard!');
            } catch (err) {
                toast.success('Invitation sent! (Could not auto-copy link)');
            }

            await loadInvitations();
        } catch (error: any) {
            console.error('Create invite error:', error);
            if (error.response?.status === 409) {
                toast.error('Invitation already exists for this email');
            } else if (error.response?.status === 403) {
                toast.error('You do not have permission to invite users');
            } else {
                toast.error(error.response?.data?.message || 'Failed to send invitation');
            }
            throw error; // Re-throw to let modal know it failed
        }
    };

    const handleRevokeInvite = async (invitation: Invitation) => {
        try {
            await revokeInvitation(invitation.id);
            toast.success('Invitation revoked successfully');
            setRevokeTarget(null);
            await loadInvitations();
        } catch (error: any) {
            console.error('Revoke error:', error);
            toast.error(error.response?.data?.message || 'Failed to revoke invitation');
        }
    };

    const handleCopyLink = async (invitation: Invitation) => {
        const link = generateInviteLink(invitation.inviteToken);
        try {
            await copyToClipboard(link);
            toast.success('Invite link copied!');
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-800 rounded-lg">
                            <Mail className="h-6 w-6 text-indigo-400" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Manage Invitations</h1>
                    </div>
                    <p className="text-slate-400">
                        Create and manage user invitations for the DSF Dashboard access.
                    </p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Invite
                </Button>
            </div>

            <InvitationsTable
                invitations={invitations ?? []}
                isLoading={isLoading}
                onCopyLink={handleCopyLink}
                onRevoke={setRevokeTarget}
            />

            <CreateInviteModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateInvite}
            />

            <RevokeConfirmDialog
                isOpen={!!revokeTarget}
                invitation={revokeTarget}
                onClose={() => setRevokeTarget(null)}
                onConfirm={handleRevokeInvite}
            />
        </div>
    );
};

export default InvitationsPage;

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { Invitation } from '@/types/invitation';

interface RevokeConfirmDialogProps {
    isOpen: boolean;
    invitation: Invitation | null;
    onClose: () => void;
    onConfirm: (invitation: Invitation) => Promise<void>;
}

export function RevokeConfirmDialog({
    isOpen,
    invitation,
    onClose,
    onConfirm
}: RevokeConfirmDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen || !invitation) return null;

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm(invitation);
            onClose();
        } catch (error) {
            console.error('Failed to revoke invitation:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="revoke-invite-title"
                className="relative grid w-full max-w-[425px] gap-4 rounded-lg border border-border bg-card p-6 text-foreground shadow-lg"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                    <div className="flex items-center gap-2 text-red-500 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <h2 id="revoke-invite-title" className="text-lg font-semibold leading-none tracking-tight">
                            Revoke Invitation?
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to revoke the invitation for <span className="font-semibold text-foreground">{invitation.email}</span>?
                        <br />
                        This action cannot be undone. The invite link will become invalid immediately.
                    </p>
                </div>
                <div className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Revoke Invitation
                    </Button>
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
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

    if (!invitation) return null;

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
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-red-500 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <DialogTitle>Revoke Invitation?</DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-400">
                        Are you sure you want to revoke the invitation for <span className="font-semibold text-slate-200">{invitation.email}</span>?
                        <br />
                        This action cannot be undone. The invite link will become invalid immediately.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
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
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

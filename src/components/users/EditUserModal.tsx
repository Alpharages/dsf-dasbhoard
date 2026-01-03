import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RoleBadge } from '@/components/common/RoleBadge';
import type { User, UpdateUserRequest } from '@/types/user';
import type { Role } from '@/types/invitation';
import { AlertTriangle } from 'lucide-react';

interface EditUserModalProps {
    user: User | null;
    open: boolean;
    onClose: () => void;
    onSave: (id: string, data: UpdateUserRequest) => Promise<void>;
}

export function EditUserModal({ user, open, onClose, onSave }: EditUserModalProps) {
    const [role, setRole] = useState<Role>('VIEWER');
    const [isActive, setIsActive] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeactivateWarning, setShowDeactivateWarning] = useState(false);

    useEffect(() => {
        if (user) {
            setRole(user.role);
            setIsActive(user.isActive);
            setShowDeactivateWarning(false);
        }
    }, [user, open]);

    const handleSave = async () => {
        if (!user) return;

        // AC#5: Deactivation Safety
        if (user.isActive && !isActive && !showDeactivateWarning) {
            setShowDeactivateWarning(true);
            return;
        }

        setIsSaving(true);
        try {
            await onSave(user.id, {
                role,
                isActive,
            });
            onClose();
        } catch (error) {
            // Error handling is done by parent with toast, but we stop loading here
            console.error(error);
        } finally {
            setIsSaving(false);
            setShowDeactivateWarning(false);
        }
    };

    if (!user) return null;

    if (showDeactivateWarning) {
        return (
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="h-5 w-5" />
                            Confirm Deactivation
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to deactivate <strong>{user.email}</strong>?
                            <br />
                            They will lose access immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowDeactivateWarning(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Deactivating...' : 'Yes, Deactivate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={() => !isSaving && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Update user details and access level.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            value={user.email}
                            disabled
                            className="col-span-3 bg-slate-100 dark:bg-slate-900"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={user.fullName}
                            disabled
                            className="col-span-3 bg-slate-100 dark:bg-slate-900"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Role
                        </Label>
                        <div className="col-span-3">
                            <Select
                                value={role}
                                onValueChange={(val) => setRole(val as Role)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">
                                        <div className="flex items-center gap-2"><RoleBadge role="ADMIN" /></div>
                                    </SelectItem>
                                    <SelectItem value="MANAGER">
                                        <div className="flex items-center gap-2"><RoleBadge role="MANAGER" /></div>
                                    </SelectItem>
                                    <SelectItem value="TL">
                                        <div className="flex items-center gap-2"><RoleBadge role="TL" /></div>
                                    </SelectItem>
                                    <SelectItem value="PM">
                                        <div className="flex items-center gap-2"><RoleBadge role="PM" /></div>
                                    </SelectItem>
                                    <SelectItem value="QA">
                                        <div className="flex items-center gap-2"><RoleBadge role="QA" /></div>
                                    </SelectItem>
                                    <SelectItem value="VIEWER">
                                        <div className="flex items-center gap-2"><RoleBadge role="VIEWER" /></div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Status
                        </Label>
                        <div className="col-span-3 flex items-center gap-2">
                            <Switch
                                id="status"
                                checked={isActive}
                                onCheckedChange={setIsActive}
                            />
                            <Label htmlFor="status" className={isActive ? 'text-green-500' : 'text-slate-500'}>
                                {isActive ? 'Active' : 'Inactive'}
                            </Label>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

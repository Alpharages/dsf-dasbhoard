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

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RoleBadge } from '@/components/common/RoleBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { User, UpdateUserRequest } from '@/types/user';
import type { Role } from '@/types/invitation';
import { AlertTriangle, Mail, User as UserIcon, Shield, Save, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface EditUserModalProps {
    user: User | null;
    open: boolean;
    onClose: () => void;
    onSave: (id: string, data: UpdateUserRequest) => Promise<void>;
}

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

const getAvatarColor = (name: string) => {
    const colors = [
        'bg-blue-500/20 text-blue-600 border-blue-500/30',
        'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
        'bg-violet-500/20 text-violet-600 border-violet-500/30',
        'bg-amber-500/20 text-amber-600 border-amber-500/30',
        'bg-rose-500/20 text-rose-600 border-rose-500/30',
        'bg-cyan-500/20 text-cyan-600 border-cyan-500/30',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

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
            console.error(error);
        } finally {
            setIsSaving(false);
            setShowDeactivateWarning(false);
        }
    };

    if (!user) return null;

    const avatarColor = getAvatarColor(user.fullName);

    if (showDeactivateWarning) {
        return (
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[400px] border-destructive/20">
                    <DialogHeader className="space-y-3">
                        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-destructive" />
                        </div>
                        <DialogTitle className="text-center text-destructive">
                            Confirm Deactivation
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Are you sure you want to deactivate{' '}
                            <strong className="text-foreground">{user.fullName}</strong>?
                            <br />
                            <span className="text-sm text-muted-foreground">
                                They will lose access to the system immediately.
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center gap-2 mt-4">
                        <Button 
                            variant="outline" 
                            onClick={() => setShowDeactivateWarning(false)}
                            disabled={isSaving}
                            className="min-w-[100px]"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="min-w-[140px]"
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
            <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
                {/* Header with Avatar */}
                <div className="bg-gradient-to-br from-muted/50 to-muted/20 p-6 pb-4">
                    <DialogHeader className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar className={`h-16 w-16 border-2 ${avatarColor}`}>
                                <AvatarFallback className={`text-xl font-bold ${avatarColor}`}>
                                    {getInitials(user.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <DialogTitle className="text-xl font-bold truncate">
                                    {user.fullName}
                                </DialogTitle>
                                <DialogDescription className="flex items-center gap-1.5 mt-1">
                                    <Mail className="h-3.5 w-3.5" />
                                    {user.email}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <Separator />

                {/* Form Content */}
                <div className="p-6 space-y-6">
                    {/* Role Selection */}
                    <div className="space-y-3">
                        <Label htmlFor="role" className="text-sm font-semibold flex items-center gap-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            Role
                        </Label>
                        <Select
                            value={role}
                            onValueChange={(val) => setRole(val as Role)}
                        >
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ADMIN">
                                    <div className="flex items-center gap-2 py-1">
                                        <RoleBadge role="ADMIN" />
                                    </div>
                                </SelectItem>
                                <SelectItem value="MANAGER">
                                    <div className="flex items-center gap-2 py-1">
                                        <RoleBadge role="MANAGER" />
                                    </div>
                                </SelectItem>
                                <SelectItem value="TL">
                                    <div className="flex items-center gap-2 py-1">
                                        <RoleBadge role="TL" />
                                    </div>
                                </SelectItem>
                                <SelectItem value="PM">
                                    <div className="flex items-center gap-2 py-1">
                                        <RoleBadge role="PM" />
                                    </div>
                                </SelectItem>
                                <SelectItem value="QA">
                                    <div className="flex items-center gap-2 py-1">
                                        <RoleBadge role="QA" />
                                    </div>
                                </SelectItem>
                                <SelectItem value="VIEWER">
                                    <div className="flex items-center gap-2 py-1">
                                        <RoleBadge role="VIEWER" />
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Determines the user&apos;s permissions and access level within the system.
                        </p>
                    </div>

                    {/* Status Toggle */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            Account Status
                        </Label>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                            <div className="flex flex-col gap-1">
                                <span className="font-medium text-sm">
                                    {isActive ? 'Active Account' : 'Inactive Account'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {isActive 
                                        ? 'User can access the system normally' 
                                        : 'User cannot log in or access the system'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge status={isActive ? 'Active' : 'Inactive'} />
                                <Switch
                                    id="status"
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Footer */}
                <DialogFooter className="p-6 pt-4 gap-2">
                    <Button 
                        variant="outline" 
                        onClick={onClose} 
                        disabled={isSaving}
                        className="gap-2"
                    >
                        <X className="h-4 w-4" />
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="gap-2 min-w-[120px]"
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

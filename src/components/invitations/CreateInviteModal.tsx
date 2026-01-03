import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { type CreateInvitationRequest, type Role } from '@/types/invitation';

interface CreateInviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: CreateInvitationRequest) => Promise<void>;
}

const ROLES: Role[] = ['ADMIN', 'MANAGER', 'TL', 'PM', 'QA', 'VIEWER'];
const EXPIRATION_OPTIONS = [
    { label: '3 days', value: 3 },
    { label: '7 days', value: 7 },
    { label: '14 days', value: 14 },
    { label: '30 days', value: 30 },
];

export function CreateInviteModal({ isOpen, onClose, onCreate }: CreateInviteModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Role>('VIEWER');
    const [expiresInDays, setExpiresInDays] = useState(7);
    const [errors, setErrors] = useState<{ email?: string }>({});

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!email) {
            setErrors(prev => ({ ...prev, email: 'Email is required' }));
            return;
        }

        if (!validateEmail(email)) {
            setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
            return;
        }

        setIsLoading(true);
        try {
            await onCreate({ email, role, expiresInDays });
            // Reset form on success (onCreate handles toast and close check usually, but we reset here just in case)
            setEmail('');
            setRole('VIEWER');
            setExpiresInDays(7);
            onClose();
        } catch (error) {
            // Error handling is managed by parent (toast), but we catch here to stop loading state
            console.error('Failed to create invitation:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
                <DialogHeader>
                    <DialogTitle>Send Invitation</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="colleague@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-3 bg-slate-800 border-slate-700"
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <p className="text-sm text-rose-500">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-right">
                            Role
                        </Label>
                        <Select
                            value={role}
                            onValueChange={(val) => setRole(val as Role)}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="w-full bg-slate-800 border-slate-700">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                {ROLES.map((r) => (
                                    <SelectItem key={r} value={r} className="text-slate-200">
                                        {r}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expiration" className="text-right">
                            Expires In
                        </Label>
                        <Select
                            value={expiresInDays.toString()}
                            onValueChange={(val) => setExpiresInDays(Number(val))}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="w-full bg-slate-800 border-slate-700">
                                <SelectValue placeholder="Select expiration" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                {EXPIRATION_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value.toString()} className="text-slate-200">
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Invitation
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

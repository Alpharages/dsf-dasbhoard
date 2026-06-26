import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-invite-title"
                className="relative grid w-full max-w-[425px] gap-4 rounded-lg border border-border bg-card p-6 text-foreground shadow-lg"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                    <h2 id="create-invite-title" className="text-lg font-semibold leading-none tracking-tight">
                        Send Invitation
                    </h2>
                </div>
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
                            className="col-span-3 bg-muted border-border"
                            disabled={isLoading}
                            autoFocus
                        />
                        {errors.email && (
                            <p className="text-sm text-rose-500">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-right">
                            Role
                        </Label>
                        <select
                            id="role"
                            value={role}
                            onChange={(event) => setRole(event.target.value as Role)}
                            disabled={isLoading}
                            className="h-9 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {ROLES.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expiration" className="text-right">
                            Expires In
                        </Label>
                        <select
                            id="expiration"
                            value={expiresInDays.toString()}
                            onChange={(event) => setExpiresInDays(Number(event.target.value))}
                            disabled={isLoading}
                            className="h-9 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {EXPIRATION_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value.toString()}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Invitation
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

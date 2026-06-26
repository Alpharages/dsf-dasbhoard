import React from 'react';
import { X, Search, Check, AlertCircle } from 'lucide-react';

import { userApi, type User } from '../../api/userApi';

interface ReassignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    projectName: string;
    currentPmName: string;
    onReassign: (projectId: string, newPmId: string, reason: string) => Promise<void>;
}

export const ReassignmentModal: React.FC<ReassignmentModalProps> = ({
    isOpen,
    onClose,
    projectId,
    projectName,
    currentPmName,
    onReassign
}) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [reason, setReason] = React.useState('');
    const [selectedPmId, setSelectedPmId] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // State for users
    const [users, setUsers] = React.useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = React.useState(false);

    // Fetch users (PMs) on mount
    React.useEffect(() => {
        if (isOpen) {
            const fetchUsers = async () => {
                setIsLoadingUsers(true);
                try {
                    // Try to fetch users with PM role, fallback to all users if role filter not supported yet
                    const data = await userApi.getUsers('MANAGER');
                    setUsers(data);
                } catch (error) {
                    console.error('Failed to fetch users:', error);
                    // Fallback mock data if API fails during dev/demo
                    setUsers([
                        { id: 'usr-1', name: 'Alice Smith', role: 'MANAGER', email: 'alice@example.com' },
                        { id: 'usr-2', name: 'Bob Johnson', role: 'MANAGER', email: 'bob@example.com' },
                        { id: 'usr-3', name: 'Charlie Davis', role: 'MANAGER', email: 'charlie@example.com' },
                    ]);
                } finally {
                    setIsLoadingUsers(false);
                }
            };
            fetchUsers();
        }
    }, [isOpen]);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        u.name !== currentPmName
    );

    const handleSubmit = async () => {
        if (!selectedPmId || !reason) {
            setError('Please select a PM and provide a reason');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await onReassign(projectId, selectedPmId, reason);
            onClose();
        } catch (err) {
            setError('Failed to reassign project. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-md bg-card border border-border rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Reassign Project</h2>
                        <p className="text-xs text-muted-foreground mt-1">{projectName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-md text-muted-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Search PM */}
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Target PM</label>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search project managers..."
                                className="w-full bg-muted border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            {isLoadingUsers ? (
                                <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                                    <div className="w-4 h-4 border-2 border-[var(--border-hover)] border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs font-medium">Loading PMs...</span>
                                </div>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => setSelectedPmId(user.id)}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all ${selectedPmId === user.id
                                            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-[10px] text-muted-foreground">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            {user.name}
                                        </div>
                                        {selectedPmId === user.id && <Check className="w-4 h-4" />}
                                    </button>
                                ))
                            ) : (
                                <p className="text-center py-4 text-sm text-muted-foreground italic">No PMs found matching "{searchTerm}"</p>
                            )}
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Reason for Reassignment</label>
                        <textarea
                            rows={3}
                            placeholder="Explain why this project is being reassigned..."
                            className="w-full bg-muted border border-border rounded-lg p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                            <p className="text-xs text-rose-400 leading-relaxed font-medium">{error}</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-muted/30 border-t border-border flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-muted hover:bg-muted text-foreground font-bold rounded-lg transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedPmId}
                        className="flex-2 py-3 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-muted disabled:text-muted-foreground text-white font-bold rounded-lg transition-all hover:translate-y-[-2px] active:translate-y-0"
                    >
                        {isSubmitting ? 'Processing...' : 'Confirm Reassignment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

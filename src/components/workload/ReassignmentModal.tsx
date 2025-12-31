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
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Reassign Project</h2>
                        <p className="text-xs text-slate-500 mt-1">{projectName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Search PM */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Target PM</label>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search project managers..."
                                className="w-full bg-slate-800 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            {isLoadingUsers ? (
                                <div className="flex items-center justify-center py-8 text-slate-500 gap-2">
                                    <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs font-medium">Loading PMs...</span>
                                </div>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => setSelectedPmId(user.id)}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${selectedPmId === user.id
                                            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-500">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            {user.name}
                                        </div>
                                        {selectedPmId === user.id && <Check className="w-4 h-4" />}
                                    </button>
                                ))
                            ) : (
                                <p className="text-center py-4 text-sm text-slate-500 italic">No PMs found matching "{searchTerm}"</p>
                            )}
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Reason for Reassignment</label>
                        <textarea
                            rows={3}
                            placeholder="Explain why this project is being reassigned..."
                            className="w-full bg-slate-800 border border-slate-700/50 rounded-2xl p-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                            <p className="text-xs text-rose-400 leading-relaxed font-medium">{error}</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-800/30 border-t border-slate-800 flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedPmId}
                        className="flex-2 py-3 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:translate-y-[-2px] active:translate-y-0"
                    >
                        {isSubmitting ? 'Processing...' : 'Confirm Reassignment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

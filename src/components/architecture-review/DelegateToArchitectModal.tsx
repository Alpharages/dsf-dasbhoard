import React, { useState } from 'react';
import { Users, Search, UserCheck, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

import { userApi } from '../../api/userApi';

interface Architect {
    id: string;
    name: string;
    role: string;
    avatar: string;
    activeReviews: number;
}

interface DelegateToArchitectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelegate: (architectId: string, notes?: string) => Promise<void>;
}

export const DelegateToArchitectModal: React.FC<DelegateToArchitectModalProps> = ({ isOpen, onClose, onDelegate }) => {
    const [selectedArchitect, setSelectedArchitect] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [architects, setArchitects] = useState<Architect[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    React.useEffect(() => {
        if (isOpen && architects.length === 0) {
            setLoadingUsers(true);
            userApi.getUsers()
                .then(users => {
                    // Filter for architects/seniors in real app, here we mimic it
                    // Also adding mock data for missing fields
                    const mapped = users.map(u => ({
                        id: u.id,
                        name: u.name,
                        role: u.role === 'ADMIN' ? 'Principal Architect' : 'Senior Developer',
                        avatar: u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
                        activeReviews: Math.floor(Math.random() * 8) // Mock workload
                    }));
                    setArchitects(mapped);
                })
                .catch(err => console.error("Failed to load users", err))
                .finally(() => setLoadingUsers(false));
        }
    }, [isOpen, architects.length]);

    if (!isOpen) return null;

    const filteredArchitects = architects.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async () => {
        if (!selectedArchitect) return;
        setIsSubmitting(true);
        try {
            await onDelegate(selectedArchitect, notes);
            onClose();
        } catch (error) {
            console.error('Delegation failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-lg w-full max-w-lg flex flex-col scale-100 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-card/50 rounded-t-lg">
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <Users className="w-5 h-5 text-violet-400" />
                        Delegate Review
                    </h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search architects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        />
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {loadingUsers ? (
                            <div className="flex justify-center p-4 text-muted-foreground">Loading architects...</div>
                        ) : filteredArchitects.length === 0 ? (
                            <div className="flex justify-center p-4 text-muted-foreground">No architects found</div>
                        ) : (
                            filteredArchitects.map(architect => (
                                <div
                                    key={architect.id}
                                    onClick={() => setSelectedArchitect(architect.id)}
                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${selectedArchitect === architect.id
                                        ? 'bg-violet-500/10 border-violet-500/50'
                                        : 'bg-card/50 border-border hover:border-[var(--border-hover)] hover:bg-muted/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground border border-border">
                                            {architect.avatar}
                                        </div>
                                        <div>
                                            <h4 className={`font-semibold ${selectedArchitect === architect.id ? 'text-violet-400' : 'text-foreground'}`}>
                                                {architect.name}
                                            </h4>
                                            <p className="text-xs text-muted-foreground">{architect.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Workload indicator */}
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <div className={`px-2 py-1 rounded text-xs font-medium ${architect.activeReviews > 5 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                                                        }`}>
                                                        {architect.activeReviews} active
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Current Review Workload</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        {selectedArchitect === architect.id && (
                                            <UserCheck className="w-5 h-5 text-violet-400 animate-in zoom-in" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div>
                        <label htmlFor="delegation-note" className="block text-sm font-medium text-muted-foreground mb-2">
                            Delegation Note (Optional)
                        </label>
                        <textarea
                            id="delegation-note"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Why are you delegating this? Any specific context?"
                            className="w-full bg-background border border-border rounded-lg p-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 min-h-[80px] text-sm resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-card/90 border-t border-border backdrop-blur rounded-b-lg flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-muted-foreground font-semibold hover:text-foreground transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedArchitect || isSubmitting}
                        className="px-6 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-muted disabled:text-muted-foreground text-white font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        {isSubmitting ? 'Delegating...' : 'Confirm Delegation'}
                    </button>
                </div>
            </div>
        </div>
    );
};

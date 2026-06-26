import { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2, Check, ListChecks } from 'lucide-react';
import { createTicketsFromActionItems } from '../../api/conversations';
import apiClient from '../../api/client';

interface CreateTicketsModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversationId: string;
    selectedActionItemIds: string[];
    onSuccess: () => void;
}

interface ClickUpList {
    id: string;
    name: string;
}

export const CreateTicketsModal: React.FC<CreateTicketsModalProps> = ({
    isOpen,
    onClose,
    conversationId,
    selectedActionItemIds,
    onSuccess
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [lists, setLists] = useState<ClickUpList[]>([]);
    const [selectedListId, setSelectedListId] = useState('');
    const [loadingLists, setLoadingLists] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchLists = async () => {
                setLoadingLists(true);
                try {
                    // In a real app, we'd fetch lists for the specific project
                    // For now, using mock lists as Story 5.5.1 deferred the full metrics/integration
                    const response = await apiClient.get('/aether-flow/lists');
                    setLists(response.data || [
                        { id: 'list-1', name: 'Engineering Backlog' },
                        { id: 'list-2', name: 'Q1 Roadmap' },
                        { id: 'list-3', name: 'Bug Triage' }
                    ]);
                    if (response.data?.length > 0) {
                        setSelectedListId(response.data[0].id);
                    } else {
                        setSelectedListId('list-1');
                    }
                } catch (err) {
                    console.error('Error fetching ClickUp lists:', err);
                    // Fallback to defaults if API fails
                    setLists([
                        { id: 'backlog', name: 'Project Backlog' },
                        { id: 'urgent', name: 'Urgent Fixes' }
                    ]);
                    setSelectedListId('backlog');
                } finally {
                    setLoadingLists(false);
                }
            };
            fetchLists();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (!selectedListId) {
            setError('Please select a ClickUp list');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            await createTicketsFromActionItems(
                conversationId,
                selectedActionItemIds,
                selectedListId
            );
            setSuccess(true);

            // Show success message briefly before closing
            setTimeout(() => {
                onSuccess();
                onClose();
                setSuccess(false);
            }, 1500);
        } catch (err: any) {
            console.error('Error creating tickets:', err);
            setError(err.response?.data?.message || 'Failed to create tickets');
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        if (!isCreating) {
            onClose();
            setError(null);
            setSuccess(false);
            setSelectedListId('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-lg shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Create ClickUp Tickets</h2>
                    <button
                        onClick={handleClose}
                        disabled={isCreating}
                        className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {success ? (
                    <div className="py-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
                            <Check className="w-8 h-8 text-emerald-500" />
                        </div>
                        <p className="text-emerald-400 font-bold text-lg">
                            ✅ {selectedActionItemIds.length} ticket{selectedActionItemIds.length > 1 ? 's' : ''} created successfully!
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-foreground mb-2">
                                Select ClickUp List <span className="text-rose-500">*</span>
                            </label>
                            {loadingLists ? (
                                <div className="flex items-center gap-2 text-muted-foreground py-3">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Loading available lists...</span>
                                </div>
                            ) : (
                                <div className="relative">
                                    <ListChecks className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <select
                                        value={selectedListId}
                                        onChange={(e) => setSelectedListId(e.target.value)}
                                        disabled={isCreating}
                                        className="w-full bg-background border border-border text-foreground rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 appearance-none"
                                    >
                                        <option value="" disabled>Select a list</option>
                                        {lists.map((list) => (
                                            <option key={list.id} value={list.id}>
                                                {list.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <p className="text-muted-foreground mb-6 text-sm">
                            Create <span className="text-blue-400 font-bold">{selectedActionItemIds.length}</span> ticket{selectedActionItemIds.length > 1 ? 's' : ''} from the selected action items.
                        </p>

                        {error && (
                            <div className="mb-6 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                                <p className="text-rose-400 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                disabled={isCreating}
                                className="flex-1 bg-muted hover:bg-muted text-foreground font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isCreating || !selectedListId}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Confirm'
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};


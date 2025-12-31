import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

interface CapacitySettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentMaxTickets: number;
    onSave: (maxTickets: number) => Promise<void>;
}

export const CapacitySettingsModal: React.FC<CapacitySettingsModalProps> = ({
    isOpen,
    onClose,
    currentMaxTickets,
    onSave
}) => {
    const [maxTickets, setMaxTickets] = useState(currentMaxTickets);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setMaxTickets(currentMaxTickets);
            setError(null);
        }
    }, [isOpen, currentMaxTickets]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (maxTickets < 1) {
            setError('Max tickets must be at least 1');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await onSave(maxTickets);
            onClose();
        } catch (err) {
            setError('Failed to update capacity settings. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Capacity Settings</h2>
                        <p className="text-xs text-slate-500 mt-1">Configure workload limits</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                            Max Active Tickets
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min="1"
                                className="w-full bg-slate-800 border border-slate-700/50 rounded-xl py-3 px-4 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-center"
                                value={maxTickets}
                                onChange={(e) => setMaxTickets(parseInt(e.target.value) || 0)}
                            />
                            <p className="text-xs text-slate-500 mt-2 text-center">
                                Triggers burnout alert if exceeded
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                            <p className="text-xs text-rose-400 leading-relaxed font-medium">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:translate-y-[-2px] active:translate-y-0 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            'Saving...'
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

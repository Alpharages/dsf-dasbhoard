import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ReviewReasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    title: string;
    description: string;
    placeholder?: string;
    confirmLabel: string;
    confirmVariant?: 'danger' | 'warning' | 'neutral';
}

export const ReviewReasonModal: React.FC<ReviewReasonModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    placeholder = 'Enter details...',
    confirmLabel,
    confirmVariant = 'neutral'
}) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (reason.trim().length < 10) {
            setError('Please provide at least 10 characters of explanation.');
            return;
        }
        onConfirm(reason);
        setReason('');
        setError('');
    };

    const getButtonStyles = () => {
        switch (confirmVariant) {
            case 'danger': return 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20';
            case 'warning': return 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20';
            default: return 'bg-muted hover:bg-muted text-white';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-lg w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-muted-foreground mb-4 text-sm">{description}</p>

                    <textarea
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            if (error) setError('');
                        }}
                        placeholder={placeholder}
                        className="w-full h-32 bg-background border border-border rounded-xl p-3 text-foreground text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        autoFocus
                    />

                    {error && <p className="text-rose-400 text-xs mt-2 font-medium">{error}</p>}
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-card/50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-muted-foreground hover:text-white font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className={`px-4 py-2 font-bold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 ${getButtonStyles()}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

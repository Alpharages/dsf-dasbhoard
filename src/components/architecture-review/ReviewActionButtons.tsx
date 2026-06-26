import React from 'react';
import { CheckCircle, XCircle, FileEdit, Clock, Loader2 } from 'lucide-react';

interface ReviewActionButtonsProps {
    onApprove: () => void;
    onReject: () => void;
    onModify: () => void;
    onDefer: () => void;
    isSubmitting: boolean;
}

export const ReviewActionButtons: React.FC<ReviewActionButtonsProps> = ({
    onApprove,
    onReject,
    onModify,
    onDefer,
    isSubmitting
}) => {
    if (isSubmitting) {
        return (
            <div className="flex items-center justify-center py-2">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                <span className="ml-2 text-muted-foreground font-medium">Processing review...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <button
                onClick={onDefer}
                className="flex items-center gap-2 px-4 py-2.5 bg-muted hover:bg-muted text-foreground font-semibold rounded-xl transition-colors"
            >
                <Clock className="w-4 h-4" />
                Defer
            </button>

            <button
                onClick={onModify}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 font-semibold rounded-xl transition-all"
            >
                <FileEdit className="w-4 h-4" />
                Request Changes
            </button>

            <button
                onClick={onReject}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-semibold rounded-xl transition-all"
            >
                <XCircle className="w-4 h-4" />
                Reject
            </button>

            <button
                onClick={onApprove}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
                <CheckCircle className="w-4 h-4" />
                Approve Decision
            </button>
        </div>
    );
};

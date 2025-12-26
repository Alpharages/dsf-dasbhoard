import React from 'react';
import { RotateCcw, ShieldAlert, AlertCircle } from 'lucide-react';

interface ExecutionActionOverlayProps {
    onRetry: () => void;
    onEscalate: () => void;
    isVisible: boolean;
}

export const ExecutionActionOverlay: React.FC<ExecutionActionOverlayProps> = ({
    onRetry,
    onEscalate,
    isVisible,
}) => {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 rounded-xl animate-in fade-in duration-300 z-10">
            <div className="bg-red-50 p-3 rounded-full mb-4 border border-red-100">
                <AlertCircle className="text-red-500" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Execution Failed</h3>
            <p className="text-sm text-gray-500 text-center mb-6 max-w-[240px]">
                The AI encountered a technical error during implementation.
            </p>

            <div className="flex flex-col w-full gap-2">
                <button
                    onClick={onRetry}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all shadow-lg active:scale-95"
                >
                    <RotateCcw size={18} />
                    Retry Execution
                </button>
                <button
                    onClick={onEscalate}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-bold transition-all active:scale-95"
                >
                    <ShieldAlert size={18} />
                    Escalate to TL
                </button>
            </div>
        </div>
    );
};

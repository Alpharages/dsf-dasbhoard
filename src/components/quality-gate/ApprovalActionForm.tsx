import React, { useState } from 'react';

interface ApprovalActionFormProps {
    onApprove: (reasoning: string) => void;
    onReject: (reasoning: string) => void;
    onRework: (feedback: string) => void;
    onEscalate: (reason: string) => void;
    isSubmitting: boolean;
}

export const ApprovalActionForm: React.FC<ApprovalActionFormProps> = ({
    onApprove,
    onReject,
    onRework,
    onEscalate,
    isSubmitting
}) => {
    const [reasoning, setReasoning] = useState('');

    return (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Approval Decision</h3>

            <div className="mb-6">
                <label htmlFor="reasoning" className="block text-sm font-medium text-slate-400 mb-2">
                    Reasoning / Feedback (Required for Reject/Rework/Escalate)
                </label>
                <textarea
                    id="reasoning"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none min-h-[120px]"
                    placeholder="Enter your feedback here..."
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                    onClick={() => onApprove(reasoning)}
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
                >
                    Approve
                </button>
                <button
                    onClick={() => onRework(reasoning)}
                    disabled={isSubmitting || !reasoning.trim()}
                    className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-amber-900/20"
                >
                    Rework
                </button>
                <button
                    onClick={() => onReject(reasoning)}
                    disabled={isSubmitting || !reasoning.trim()}
                    className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-rose-900/20"
                >
                    Reject
                </button>
                <button
                    onClick={() => onEscalate(reasoning)}
                    disabled={isSubmitting || !reasoning.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-indigo-900/20"
                >
                    Escalate
                </button>
            </div>
        </div>
    );
};

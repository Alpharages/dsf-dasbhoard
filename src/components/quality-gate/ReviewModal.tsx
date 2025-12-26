import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { QualityGateSummary } from './QualityGateSummary';
import { DiffViewer } from './DiffViewer';
import { ApprovalActionForm } from './ApprovalActionForm';
import axios from 'axios';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    executionId: string;
    projectName: string;
    ticketTitle: string;
    ticketRequirements: string; // AC#6: Added ticket context
    confidenceScore: number;    // AC#3: Added confidence score
    qaSummary: any;
    diffs: Array<{ fileName: string; oldCode: string; newCode: string }>;
    onActionComplete: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
    isOpen,
    onClose,
    executionId,
    projectName,
    ticketTitle,
    ticketRequirements,
    confidenceScore,
    qaSummary,
    diffs,
    onActionComplete
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleAction = async (decision: string, reasoning: string) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            await axios.post(
                `${apiUrl}/api/v1/executions/${executionId}/approve`,
                { decision, reasoning },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onActionComplete();
            onClose();
        } catch (err: any) {
            console.error('Approval action failed:', err);
            setError(err.response?.data?.message || 'Failed to submit approval decision');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{projectName}</span>
                            <span className="text-slate-600">/</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{executionId.substring(0, 8)}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">{ticketTitle}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10">
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-500 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* QA Summary & Confidence */}
                    <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3">
                            <QualityGateSummary summary={qaSummary} />
                        </div>
                        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 flex flex-col items-center justify-center backdrop-blur-sm">
                            <span className="text-sm font-medium text-slate-400 mb-2">Overall Confidence</span>
                            <div className="text-4xl font-black text-blue-400">
                                {Math.round(confidenceScore * 100)}%
                            </div>
                            <div className="mt-2 text-xs text-slate-500 uppercase tracking-widest">AI Reliability Score</div>
                        </div>
                    </section>

                    {/* Ticket Context */}
                    <section className="bg-slate-800/20 border border-slate-700/30 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Ticket Requirements</h3>
                        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {ticketRequirements}
                        </div>
                    </section>

                    {/* Code Changes */}
                    <section className="space-y-6">
                        <h3 className="text-lg font-semibold text-slate-100 px-1">Code Changes</h3>
                        <div className="space-y-8">
                            {diffs.map((diff, idx) => (
                                <DiffViewer key={idx} {...diff} />
                            ))}
                        </div>
                    </section>

                    {/* Approval Form */}
                    <section className="pb-4">
                        <ApprovalActionForm
                            isSubmitting={isSubmitting}
                            onApprove={(r) => handleAction('APPROVE', r)}
                            onReject={(r) => handleAction('REJECT', r)}
                            onRework={(r) => handleAction('REWORK', r)}
                            onEscalate={(r) => handleAction('ESCALATE', r)}
                        />
                    </section>
                </div>
            </div>
        </div>
    );
};

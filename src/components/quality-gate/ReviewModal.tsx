import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { QualityGateSummary, type QaSummary } from './QualityGateSummary';
import { DiffViewer } from './DiffViewer';
import { ApprovalActionForm } from './ApprovalActionForm';
import apiClient from '../../api/client';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    executionId: string;
    projectName: string;
    ticketTitle: string;
    ticketRequirements: string; // AC#6: Added ticket context
    confidenceScore: number;    // AC#3: Added confidence score
    qaSummary: QaSummary;
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
            await apiClient.post(
                `/executions/${executionId}/gate-decision`,
                { decision, reasoning }
            );
            onActionComplete();
            onClose();
        } catch (err: unknown) {
            console.error('Approval action failed:', err);
            const e = err as { response?: { data?: { message?: string } } };
            setError(e.response?.data?.message || 'Failed to submit approval decision');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <div className="bg-card border border-border rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-muted/20">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{projectName}</span>
                            <span className="text-muted-foreground">/</span>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{executionId.substring(0, 8)}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">{ticketTitle}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 text-rose-500 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* QA Summary & Confidence */}
                    <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-3">
                            <QualityGateSummary summary={qaSummary} />
                        </div>
                        <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center">
                            <span className="text-sm font-medium text-muted-foreground mb-2">Overall Confidence</span>
                            <div className="text-4xl font-semibold text-blue-400 data-figure tabular-nums">
                                {Math.round(confidenceScore * 100)}%
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground uppercase tracking-widest">AI Reliability Score</div>
                        </div>
                    </section>

                    {/* Ticket Context */}
                    <section className="bg-muted/20 border border-border rounded-lg p-6">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Ticket Requirements</h3>
                        <div className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                            {ticketRequirements}
                        </div>
                    </section>

                    {/* Code Changes */}
                    <section className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground px-1">Code Changes</h3>
                        <div className="space-y-6">
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

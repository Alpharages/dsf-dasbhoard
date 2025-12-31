import React, { useState } from 'react';
import type { AdrQueueItem } from '../../types/architectureReview';
import { X, Calendar, Ticket } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import { ReviewActionButtons } from './ReviewActionButtons';
import { ReviewReasonModal } from './ReviewReasonModal';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface AdrDetailModalProps {
    adr: AdrQueueItem | null;
    onClose: () => void;
    onSubmitReview: (action: 'APPROVE' | 'REJECT' | 'MODIFY' | 'DEFER', notes?: string) => Promise<void>;
}

export const AdrDetailModal: React.FC<AdrDetailModalProps> = ({ adr, onClose, onSubmitReview }) => {
    const [activeAction, setActiveAction] = useState<'REJECT' | 'MODIFY' | 'DEFER' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!adr) return null;

    const handleAction = async (action: 'APPROVE' | 'REJECT' | 'MODIFY' | 'DEFER', notes?: string) => {
        try {
            setIsSubmitting(true);
            await onSubmitReview(action, notes);
            onClose();
        } catch (error) {
            console.error('Review submission failed:', error);
        } finally {
            setIsSubmitting(false);
            setActiveAction(null);
        }
    };

    const getReasonModalConfig = () => {
        switch (activeAction) {
            case 'REJECT':
                return {
                    title: 'Reject Architecture Decision',
                    description: 'Please explain why this decision is being rejected. This feedback will be used to improve future AI decisions.',
                    confirmLabel: 'Reject Decision',
                    variant: 'danger' as const,
                    placeholder: 'Reason for rejection (e.g., specific requirements not met, better alternative exists...)'
                };
            case 'MODIFY':
                return {
                    title: 'Request Modifications',
                    description: 'What specific changes are needed before this decision can be approved?',
                    confirmLabel: 'Request Changes',
                    variant: 'warning' as const,
                    placeholder: 'Required changes (e.g., use PostgreSQL instead of Redis due to durability requirements...)'
                };
            case 'DEFER':
                return {
                    title: 'Defer Decision',
                    description: 'Why are you deferring this decision? (Optional)',
                    confirmLabel: 'Defer',
                    variant: 'neutral' as const,
                    placeholder: 'Reason for deferral (e.g., waiting for stakeholder input...)'
                };
            default:
                return null;
        }
    };

    const modalConfig = getReasonModalConfig();

    return (
        <>
            <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col scale-100 animate-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="flex items-start justify-between p-6 border-b border-slate-800 bg-slate-900/50 rounded-t-2xl">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <RiskBadge level={adr.risk_level} />
                                <span className="text-slate-400 text-sm font-medium">
                                    Confidence: {Math.round(adr.confidence * 100)}%
                                </span>
                                <span className="bg-yellow-500/10 text-yellow-500 text-xs px-2 py-0.5 rounded border border-yellow-500/20 font-bold uppercase">
                                    {adr.status}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">{adr.title}</h2>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                <div className="flex items-center gap-1.5">
                                    <Ticket className="w-4 h-4" />
                                    <span>{adr.ticket.title} ({adr.ticket.clickup_task_id})</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    <span>Created {format(new Date(adr.created_at), 'MMM d, yyyy')}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        <section>
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                Context & Requirements
                            </h3>
                            <div className="prose prose-invert prose-slate max-w-none text-slate-300">
                                <ReactMarkdown>{adr.context}</ReactMarkdown>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-blue-400 mb-3">Proposed Decision</h3>
                                <div className="prose prose-invert prose-slate max-w-none text-slate-200">
                                    <ReactMarkdown>{adr.decision}</ReactMarkdown>
                                </div>
                            </section>

                            <section className="bg-slate-800/30 border border-slate-800 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-slate-200 mb-3">Consequences</h3>
                                <div className="prose prose-invert prose-slate max-w-none text-slate-400">
                                    <ReactMarkdown>{adr.consequences}</ReactMarkdown>
                                </div>
                            </section>
                        </div>

                        <section>
                            <h3 className="text-lg font-bold text-white mb-3">Alternatives Considered</h3>
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-slate-400 prose prose-invert max-w-none">
                                <ReactMarkdown>{adr.alternatives}</ReactMarkdown>
                            </div>
                        </section>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 bg-slate-900/90 border-t border-slate-800 backdrop-blur rounded-b-2xl">
                        <ReviewActionButtons
                            onApprove={() => handleAction('APPROVE')}
                            onReject={() => setActiveAction('REJECT')}
                            onModify={() => setActiveAction('MODIFY')}
                            onDefer={() => setActiveAction('DEFER')}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </div>
            </div>

            {activeAction && modalConfig && (
                <ReviewReasonModal
                    isOpen={true}
                    onClose={() => setActiveAction(null)}
                    onConfirm={(reason) => handleAction(activeAction, reason)}
                    title={modalConfig.title}
                    description={modalConfig.description}
                    confirmLabel={modalConfig.confirmLabel}
                    confirmVariant={modalConfig.variant}
                    placeholder={modalConfig.placeholder}
                />
            )}
        </>
    );
};

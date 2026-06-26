import React, { useState } from 'react';
import type { AdrQueueItem } from '../../types/architectureReview';
import { X, Calendar, Ticket, UserPlus } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import { ReviewActionButtons } from './ReviewActionButtons';
import { ReviewReasonModal } from './ReviewReasonModal';
import { RiskAnalysisCard } from './RiskAnalysisCard';
import { EscalationContextCard } from './EscalationContextCard';
import { TLGuidanceForm } from './TLGuidanceForm';
import { DelegateToArchitectModal } from './DelegateToArchitectModal';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { TooltipProvider } from '../ui/tooltip';

interface AdrDetailModalProps {
    adr: AdrQueueItem | null;
    onClose: () => void;
    onSubmitReview: (action: 'APPROVE' | 'REJECT' | 'MODIFY' | 'DEFER', notes?: string) => Promise<void>;
}

export const AdrDetailModal: React.FC<AdrDetailModalProps> = ({ adr, onClose, onSubmitReview }) => {
    const [activeAction, setActiveAction] = useState<'REJECT' | 'MODIFY' | 'DEFER' | null>(null);
    const [isDelegateOpen, setIsDelegateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!adr) return null;

    const isEscalated = !!adr.escalation_reason;

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

    const handleGuidanceSubmit = async (guidance: string, applyGlobally: boolean, updateThresholds: boolean) => {
        try {
            setIsSubmitting(true);
            console.log('Guidance submitted:', { guidance, applyGlobally, updateThresholds });
            // Temporary: Close after 1s
            await new Promise(r => setTimeout(r, 1000));
            onClose();
        } catch (error) {
            console.error('Guidance submission failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelegate = async (architectId: string, notes?: string) => {
        try {
            setIsSubmitting(true);
            console.log('Delegating:', { architectId, notes });
            await new Promise(r => setTimeout(r, 1000));
            onClose();
        } catch (error) {
            console.error('Delegation failed:', error);
        } finally {
            setIsSubmitting(false);
            setIsDelegateOpen(false);
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
        <TooltipProvider>
            <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col scale-100 animate-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="flex items-start justify-between p-6 border-b border-border bg-card/50 rounded-t-lg">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <RiskBadge level={adr.risk_level} riskFactors={adr.risk_factors} />
                                <span className={`text-sm font-medium ${isEscalated ? 'text-red-400 font-bold' : 'text-muted-foreground'}`}>
                                    Confidence: {Math.round(adr.confidence * 100)}%
                                </span>
                                <span className="bg-yellow-500/10 text-yellow-500 text-xs px-2 py-0.5 rounded border border-yellow-500/20 font-bold uppercase">
                                    {adr.status}
                                </span>
                            </div>
                            <h2 className="text-2xl font-semibold text-foreground mb-2">{adr.title}</h2>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsDelegateOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground hover:text-foreground rounded-lg transition-colors text-sm font-medium"
                            >
                                <UserPlus className="w-4 h-4" />
                                Delegate
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6">
                        {isEscalated && adr.escalation_reason && (
                            <EscalationContextCard
                                reasonCode={adr.escalation_reason}
                                context={adr.escalation_context}
                            />
                        )}

                        <RiskAnalysisCard riskFactors={adr.risk_factors} />

                        <section>
                            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                Context & Requirements
                            </h3>
                            <div className="prose prose-invert prose-slate max-w-none text-foreground">
                                <ReactMarkdown>{adr.context}</ReactMarkdown>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <section className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-blue-400 mb-3">Proposed Decision</h3>
                                <div className="prose prose-invert prose-slate max-w-none text-foreground">
                                    <ReactMarkdown>{adr.decision}</ReactMarkdown>
                                </div>
                            </section>

                            <section className="bg-muted/30 border border-border rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-foreground mb-3">Consequences</h3>
                                <div className="prose prose-invert prose-slate max-w-none text-muted-foreground">
                                    <ReactMarkdown>{adr.consequences}</ReactMarkdown>
                                </div>
                            </section>
                        </div>

                        <section>
                            <h3 className="text-lg font-semibold text-foreground mb-3">Alternatives Considered</h3>
                            <div className="bg-background border border-border rounded-lg p-6 text-muted-foreground prose prose-invert max-w-none">
                                <ReactMarkdown>{adr.alternatives}</ReactMarkdown>
                            </div>
                        </section>

                        {/* Guidance Form for Escalated Items */}
                        {isEscalated && (
                            <TLGuidanceForm
                                onSubmit={handleGuidanceSubmit}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 bg-card/90 border-t border-border backdrop-blur rounded-b-lg">
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

            <DelegateToArchitectModal
                isOpen={isDelegateOpen}
                onClose={() => setIsDelegateOpen(false)}
                onDelegate={handleDelegate}
            />
        </TooltipProvider>
    );
};

import React from 'react';
import { Scale, AlertTriangle, FileQuestion } from 'lucide-react';
import { EscalationBadge } from './EscalationBadge';

interface EscalationContext {
    questions?: string[];
    trade_offs?: string[];
    uncertain_constraints?: string[];
}

interface EscalationContextCardProps {
    reasonCode: string;
    context?: EscalationContext;
}

export const EscalationContextCard: React.FC<EscalationContextCardProps> = ({ reasonCode, context }) => {
    if (!context) return null;

    const { questions, trade_offs, uncertain_constraints } = context;
    const hasContent = (questions?.length || 0) + (trade_offs?.length || 0) + (uncertain_constraints?.length || 0) > 0;

    if (!hasContent) {
        return (
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <EscalationBadge reasonCode={reasonCode} />
                    <span className="text-red-400 text-sm font-medium">Escalated for Review</span>
                </div>
                <p className="text-muted-foreground text-sm">
                    This decision was escalated due to {reasonCode.toLowerCase().replace(/_/g, ' ')}. Please review carefully.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg overflow-hidden mb-6">
            <div className="p-4 bg-red-500/10 border-b border-red-500/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <EscalationBadge reasonCode={reasonCode} />
                    <h3 className="text-white font-semibold">Escalation Context</h3>
                </div>
            </div>

            <div className="p-6 grid gap-4 md:grid-cols-2">
                {questions && questions.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-sky-400">
                            <FileQuestion className="w-4 h-4" />
                            AI Questions
                        </h4>
                        <ul className="space-y-2">
                            {questions.map((q, i) => (
                                <li key={i} className="text-sm text-foreground flex items-start gap-2 bg-card/50 p-3 rounded-lg border border-border">
                                    <span className="text-sky-500 font-bold mt-0.5">?</span>
                                    {q}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {trade_offs && trade_offs.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-400">
                            <Scale className="w-4 h-4" />
                            Uncertain Trade-offs
                        </h4>
                        <ul className="space-y-2">
                            {trade_offs.map((t, i) => (
                                <li key={i} className="text-sm text-foreground flex items-start gap-2 bg-card/50 p-3 rounded-lg border border-border">
                                    <span className="text-amber-500 font-bold mt-0.5">⇄</span>
                                    {t}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {uncertain_constraints && uncertain_constraints.length > 0 && (
                    <div className="space-y-3 md:col-span-2">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-rose-400">
                            <AlertTriangle className="w-4 h-4" />
                            Constraint Conflicts / Uncertainties
                        </h4>
                        <ul className="space-y-2">
                            {uncertain_constraints.map((c, i) => (
                                <li key={i} className="text-sm text-foreground flex items-start gap-2 bg-card/50 p-3 rounded-lg border border-border">
                                    <span className="text-rose-500 font-bold mt-0.5">!</span>
                                    {c}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

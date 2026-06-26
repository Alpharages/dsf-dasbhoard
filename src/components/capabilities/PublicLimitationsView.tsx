import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, CheckCircle, Download, BookOpen, AlertCircle, Lightbulb, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Limitation } from '../../types/capabilities';
import { TASK_TYPE_LABELS } from '../../types/capabilities';
import { useKnowledgeBase } from '../../hooks/useCapabilities';

interface PublicLimitationsViewProps {
    limitations: Limitation[];
}

export const PublicLimitationsView: React.FC<PublicLimitationsViewProps> = ({ limitations }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const { data: knowledgeBaseMd } = useKnowledgeBase();

    const handleCopyWorkaround = (workaround: string, index: number) => {
        navigator.clipboard.writeText(workaround);
        setCopiedIndex(index);
        toast.success('Workaround copied to clipboard');
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleDownloadPdf = () => {
        // For now, download as markdown file
        if (knowledgeBaseMd) {
            const blob = new Blob([knowledgeBaseMd], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-limitations-${new Date().toISOString().split('T')[0]}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Knowledge base downloaded');
        }
    };

    const getFailureRateBadge = (rate: number) => {
        if (rate >= 50) return { color: 'rose', label: 'Critical' };
        if (rate >= 30) return { color: 'amber', label: 'Warning' };
        return { color: 'emerald', label: 'Low' };
    };

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="card-theme rounded-lg p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20">
                        <BookOpen className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">
                            AI Limitations Knowledge Base
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                            Review known AI limitations and recommended workarounds before assigning tasks.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                            <Lightbulb className="w-4 h-4" />
                            <span>Contact your Technical Lead to update limitations or request changes.</span>
                        </div>
                    </div>
                    {knowledgeBaseMd && (
                        <button
                            onClick={handleDownloadPdf}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium 
                                bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 
                                transition-all hover:shadow-lg hover:shadow-blue-500/10"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </button>
                    )}
                </div>
            </div>

            {/* Limitations List */}
            {limitations.length === 0 ? (
                <div className="card-theme rounded-xl p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center">
                        <FileText className="w-8 h-8 text-[var(--color-text-muted)]" />
                    </div>
                    <p className="text-[var(--color-text-secondary)] font-medium">No documented limitations yet</p>
                    <p className="text-sm text-[var(--color-text-tertiary)] mt-1">Check back later for updates</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {limitations.map((lim, index) => {
                        const severity = getFailureRateBadge(lim.failureRate);
                        
                        return (
                            <div
                                key={lim.taskType}
                                className={`
                                    card-theme rounded-lg p-6 transition-all duration-300 hover:shadow-lg
                                    ${lim.isDisabled ? 'border-l-4 border-l-rose-500' : ''}
                                `}
                            >
                                {/* Header Row */}
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            {TASK_TYPE_LABELS[lim.taskType]}
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-${severity.color}-500/10 text-${severity.color}-400 border border-${severity.color}-500/20`}>
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            {lim.failureRate.toFixed(1)}% failure rate
                                        </span>
                                        {lim.isDisabled && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                                                AI Disabled
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Known Issues */}
                                {lim.knownIssues && (
                                    <div className="mb-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertCircle className="w-4 h-4 text-amber-400" />
                                            <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">Known Issues</h4>
                                        </div>
                                        <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4 border border-[var(--color-border)] prose prose-sm max-w-none">
                                            <div className="text-[var(--color-text-secondary)]">
                                                <ReactMarkdown>{lim.knownIssues}</ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Workaround */}
                                {lim.workaround && (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Lightbulb className="w-4 h-4 text-emerald-400" />
                                                <h4 className="text-sm font-semibold text-emerald-400">Recommended Workaround</h4>
                                            </div>
                                            <button
                                                onClick={() => handleCopyWorkaround(lim.workaround!, index)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium 
                                                    bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 
                                                    transition-all hover:shadow-lg hover:shadow-emerald-500/10"
                                            >
                                                {copiedIndex === index ? (
                                                    <>
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5" />
                                                        Copy
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 prose prose-sm max-w-none">
                                            <div className="text-[var(--color-text-secondary)]">
                                                <ReactMarkdown>{lim.workaround}</ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

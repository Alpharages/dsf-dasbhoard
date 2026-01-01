import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, CheckCircle, Download, BookOpen } from 'lucide-react';
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
                <div className="flex items-start gap-3">
                    <BookOpen className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                            AI Limitations Knowledge Base
                        </h3>
                        <p className="text-sm text-slate-300 mb-3">
                            Review known AI limitations and recommended workarounds before assigning tasks.
                        </p>
                        <p className="text-xs text-slate-400">
                            💡 Contact your Technical Lead to update limitations or request changes.
                        </p>
                    </div>
                    {knowledgeBaseMd && (
                        <button
                            onClick={handleDownloadPdf}
                            className="px-3 py-2 rounded-lg text-sm font-medium bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/20 transition-colors flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </button>
                    )}
                </div>
            </div>

            {/* Limitations List */}
            {limitations.length === 0 ? (
                <div className="bg-slate-800/30 rounded-xl p-12 text-center border border-slate-700/50">
                    <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">No documented limitations yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {limitations.map((lim, index) => (
                        <div
                            key={lim.taskType}
                            className={`bg-slate-800/30 rounded-xl p-6 border ${lim.isDisabled ? 'border-red-500/30' : 'border-slate-700/50'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                        {TASK_TYPE_LABELS[lim.taskType]}
                                    </span>
                                    {lim.isDisabled && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-300 border border-red-500/20">
                                            🚫 AI Disabled
                                        </span>
                                    )}
                                </div>
                                <span className="text-sm text-slate-400">
                                    {lim.failureRate.toFixed(1)}% failure rate
                                </span>
                            </div>

                            {lim.knownIssues && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Known Issues</h4>
                                    <div className="bg-slate-900/50 rounded-lg p-4 prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown>{lim.knownIssues}</ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {lim.workaround && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-semibold text-green-400">Recommended Workaround</h4>
                                        <button
                                            onClick={() => handleCopyWorkaround(lim.workaround!, index)}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-green-500/10 text-green-300 hover:bg-green-500/20 border border-green-500/20 transition-colors"
                                        >
                                            {copiedIndex === index ? (
                                                <>
                                                    <CheckCircle className="w-3 h-3" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3 h-3" />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown>{lim.workaround}</ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

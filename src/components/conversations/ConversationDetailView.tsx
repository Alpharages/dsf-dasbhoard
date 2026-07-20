import { useState, useEffect } from 'react';
import { Copy, Volume2, Smile, Meh, Frown, Loader2, AlertCircle } from 'lucide-react';
import { getConversation } from '../../api/conversations';
import type { ConversationResponseDto } from '../../types/conversation';
import { ActionItemsTable } from './ActionItemsTable';

interface ConversationDetailViewProps {
    conversationId: string;
}

const sentimentConfig = {
    positive: { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: Smile, label: 'Positive' },
    neutral: { color: 'text-muted-foreground bg-muted/10 border-[var(--border-hover)]/20', icon: Meh, label: 'Neutral' },
    negative: { color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', icon: Frown, label: 'Negative' }
};

const statusConfig = {
    uploaded: { color: 'bg-muted/10 text-muted-foreground border-[var(--border-hover)]/20', label: 'Uploaded' },
    transcribing: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse', label: 'Transcribing' },
    analyzing: { color: 'bg-purple-500/10 text-purple-500 border-purple-500/20 animate-pulse', label: 'Analyzing' },
    completed: { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Completed' },
    failed: { color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', label: 'Failed' }
};

export const ConversationDetailView: React.FC<ConversationDetailViewProps> = ({ conversationId }) => {
    const [conversation, setConversation] = useState<ConversationResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [transcriptExpanded, setTranscriptExpanded] = useState(false);

    useEffect(() => {
        const fetchConversation = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getConversation(conversationId);
                setConversation(data);
            } catch (err: any) {
                console.error('Error fetching conversation:', err);
                setError(err.response?.data?.message || 'Failed to load conversation');
            } finally {
                setLoading(false);
            }
        };

        fetchConversation();
    }, [conversationId]);

    const handleCopyTranscript = () => {
        if (conversation?.transcript) {
            navigator.clipboard.writeText(conversation.transcript);
        }
    };



    const parseSummary = (summary: string | undefined) => {
        if (!summary) return null;

        const sections = {
            keyPoints: [] as string[],
            decisions: [] as string[],
            nextSteps: [] as string[]
        };

        // More robust section matching using regex
        const lines = summary.split('\n');
        let currentSection: keyof typeof sections | null = null;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            const lower = trimmed.toLowerCase();
            if (lower.includes('key points')) {
                currentSection = 'keyPoints';
            } else if (lower.includes('decisions')) {
                currentSection = 'decisions';
            } else if (lower.includes('next steps')) {
                currentSection = 'nextSteps';
            } else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.match(/^\d+\./) || trimmed.startsWith('*')) {
                if (currentSection) {
                    sections[currentSection].push(trimmed.replace(/^[•\-\d.*]+\s*/, ''));
                }
            } else if (currentSection && trimmed.length > 5) {
                // If we're in a section but the line doesn't start with a bullet, still add it if it looks like content
                sections[currentSection].push(trimmed);
            }
        });

        // If no sections found but we have content, just return as key points
        if (sections.keyPoints.length === 0 && sections.decisions.length === 0 && sections.nextSteps.length === 0) {
            return { keyPoints: lines.filter(l => l.trim().length > 0).slice(0, 5), decisions: [], nextSteps: [] };
        }

        return sections;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="text-muted-foreground">Loading conversation...</p>
                </div>
            </div>
        );
    }

    if (error || !conversation) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-8 max-w-md text-center">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <p className="text-rose-400 font-bold text-lg mb-2">Error Loading Conversation</p>
                    <p className="text-muted-foreground text-sm">{error}</p>
                </div>
            </div>
        );
    }

    const sentiment = conversation.sentiment || 'neutral';
    const SentimentIcon = sentimentConfig[sentiment].icon;
    const summary = parseSummary(conversation.summary);

    return (
        <div className="max-w-5xl mx-auto p-8">
            {/* Header */}
            <div className="bg-card border border-border rounded-lg p-8 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-foreground mb-2">{conversation.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                                {new Date(conversation.conversation_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                            <span>•</span>
                            <span>Project: <span className="text-foreground font-medium">{conversation.project.name}</span></span>
                            <span>•</span>
                            <span>PM: <span className="text-foreground font-medium">{conversation.pm.name}</span></span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${sentimentConfig[sentiment].color}`}>
                            <SentimentIcon className="w-4 h-4" />
                            {sentimentConfig[sentiment].label}
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase border ${statusConfig[conversation.status].color}`}>
                            {statusConfig[conversation.status].label}
                        </div>
                    </div>
                </div>
            </div>

            {/* Audio Player */}
            {conversation.audio_file_url && (
                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Volume2 className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-bold text-foreground">Audio Recording</h3>
                    </div>
                    <audio controls className="w-full">
                        <source src={conversation.audio_file_url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}

            {/* Transcript */}
            {conversation.transcript && (
                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-foreground">Transcript</h3>
                        <button
                            onClick={handleCopyTranscript}
                            className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2"
                        >
                            <Copy className="w-4 h-4" />
                            Copy
                        </button>
                    </div>
                    <div className={`text-muted-foreground text-sm ${transcriptExpanded ? '' : 'line-clamp-3'}`}>
                        {conversation.transcript}
                    </div>
                    {conversation.transcript.length > 200 && (
                        <button
                            onClick={() => setTranscriptExpanded(!transcriptExpanded)}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium mt-2"
                        >
                            {transcriptExpanded ? 'Show Less ▲' : 'Show More ▼'}
                        </button>
                    )}
                </div>
            )}

            {/* AI Summary */}
            {conversation.summary && summary && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-foreground font-bold">AI</span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground">AI Summary</h3>
                    </div>

                    {summary.keyPoints.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-bold text-blue-400 uppercase mb-2">Key Points</h4>
                            <ul className="space-y-1">
                                {summary.keyPoints.map((point, idx) => (
                                    <li key={idx} className="text-foreground text-sm flex items-start gap-2">
                                        <span className="text-blue-500">•</span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {summary.decisions.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-bold text-purple-400 uppercase mb-2">Decisions Made</h4>
                            <ul className="space-y-1">
                                {summary.decisions.map((decision, idx) => (
                                    <li key={idx} className="text-foreground text-sm flex items-start gap-2">
                                        <span className="text-purple-500">•</span>
                                        <span>{decision}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {summary.nextSteps.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-emerald-400 uppercase mb-2">Next Steps</h4>
                            <ul className="space-y-1">
                                {summary.nextSteps.map((step, idx) => (
                                    <li key={idx} className="text-foreground text-sm flex items-start gap-2">
                                        <span className="text-emerald-500">•</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}


            {/* Action Items */}
            {conversation.action_items && conversation.action_items.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                    <ActionItemsTable actionItems={conversation.action_items} />
                </div>
            )}

            {/* Processing Cost */}
            {conversation.processing_cost !== undefined && (
                <div className="text-center text-sm text-muted-foreground">
                    Processing Cost: <span className="text-foreground font-medium">${conversation.processing_cost.toFixed(2)}</span>
                </div>
            )}

        </div>
    );
};

import { useState, useEffect } from 'react';
import { MessageSquare, Loader2, ChevronRight, Smile, Meh, Frown } from 'lucide-react';
import { searchConversations } from '../../api/conversations';
import type { ConversationResponseDto } from '../../types/conversation';

interface ConversationListWidgetProps {
    onConversationClick: (conversationId: string) => void;
    onViewAll: () => void;
}

const sentimentIcons = {
    positive: { icon: Smile, color: 'text-emerald-500' },
    neutral: { icon: Meh, color: 'text-muted-foreground' },
    negative: { icon: Frown, color: 'text-rose-500' }
};

export const ConversationListWidget: React.FC<ConversationListWidgetProps> = ({
    onConversationClick,
    onViewAll
}) => {
    const [conversations, setConversations] = useState<ConversationResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentConversations = async () => {
            setLoading(true);
            try {
                const result = await searchConversations({ limit: 5, offset: 0 });
                setConversations(result.conversations);
            } catch (err) {
                console.error('Error fetching recent conversations:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentConversations();
    }, []);

    return (
        <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Recent Conversations</h2>
                </div>
                <button
                    onClick={onViewAll}
                    className="text-sm text-primary hover:text-primary/80 font-bold flex items-center gap-1"
                >
                    View All
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : conversations.length > 0 ? (
                <div className="space-y-2">
                    {conversations.map((conversation) => {
                        const sentiment = conversation.sentiment || 'neutral';
                        const SentimentIcon = sentimentIcons[sentiment].icon;

                        return (
                            <div
                                key={conversation.id}
                                onClick={() => onConversationClick(conversation.id)}
                                className="bg-muted/50 border border-border hover:border-primary/30 rounded-xl p-4 cursor-pointer transition-all group"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 ${sentimentIcons[sentiment].color}`}>
                                        <SentimentIcon className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                            {conversation.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <span className="truncate">{conversation.project.name}</span>
                                            <span>•</span>
                                            <span className="flex-shrink-0">
                                                {new Date(conversation.conversation_date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-muted/30 border border-dashed border-border rounded-xl">
                    <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No conversations yet</p>
                </div>
            )}
        </div>
    );
};

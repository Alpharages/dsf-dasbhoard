import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Loader2, ChevronRight, Smile, Meh, Frown, AlertCircle } from 'lucide-react';
import { searchConversations } from '../../api/conversations';
import { motion } from 'framer-motion';

interface ConversationListWidgetProps {
    onConversationClick: (conversationId: string) => void;
    onViewAll: () => void;
}

const sentimentIcons = {
    positive: { icon: Smile, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    neutral: { icon: Meh, color: 'text-muted-foreground', bg: 'bg-muted/50', border: 'border-border' },
    negative: { icon: Frown, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' }
};

export const ConversationListWidget: React.FC<ConversationListWidgetProps> = ({
    onConversationClick,
    onViewAll
}) => {
    const { data: conversations = [], isLoading: loading, isError } = useQuery({
        queryKey: ['recent-conversations', 5, 0],
        queryFn: () => searchConversations({ limit: 5, offset: 0 }).then((result) => result.conversations),
        staleTime: 60_000,
    });

    return (
        <div className="h-full min-h-[400px] bg-[var(--surface-2)] border border-[var(--card-border)] rounded-lg p-5 backdrop-blur-sm flex flex-col">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-violet-500 flex items-center justify-center ">
                        <MessageSquare className="h-4 h-4 text-white" />
                    </div>
                    <h2 className="text-base font-bold text-foreground">Recent Conversations</h2>
                </div>
                <button
                    onClick={onViewAll}
                    className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary/5 transition-colors"
                >
                    View All
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : isError ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 bg-[var(--surface-1)] border border-dashed border-rose-500/30 rounded-xl">
                    <AlertCircle className="w-8 h-8 text-rose-400/70 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">Couldn't load conversations</p>
                </div>
            ) : conversations.length > 0 ? (
                <div className="flex-1 overflow-y-auto space-y-2">
                    {conversations.map((conversation, index) => {
                        const sentiment = conversation.sentiment || 'neutral';
                        const SentimentIcon = sentimentIcons[sentiment].icon;

                        return (
                            <motion.div
                                key={conversation.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => onConversationClick(conversation.id)}
                                className="bg-[var(--surface-1)] border border-[var(--card-border)] hover:border-[var(--border-hover)] rounded-xl p-3 cursor-pointer transition-all group hover:shadow-md"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-0.5 p-1.5 rounded-lg ${sentimentIcons[sentiment].bg} border ${sentimentIcons[sentiment].border}`}>
                                        <SentimentIcon className={`w-4 h-4 ${sentimentIcons[sentiment].color}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                            {conversation.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
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

                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-10 bg-[var(--surface-1)] border border-dashed border-[var(--card-border)] rounded-xl">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">No conversations yet</p>
                </div>
            )}
        </div>
    );
};

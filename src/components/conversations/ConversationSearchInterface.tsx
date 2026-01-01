import { useState, useEffect } from 'react';
import { Search, X, Calendar, Loader2 } from 'lucide-react';
import { searchConversations } from '../../api/conversations';
import type { ConversationResponseDto, Sentiment } from '../../types/conversation';
import type { Project } from '../../types';
import apiClient from '../../api/client';
import { Smile, Meh, Frown } from 'lucide-react';



interface ConversationSearchInterfaceProps {
    onConversationClick: (conversationId: string) => void;
}

const sentimentIcons = {
    positive: { icon: Smile, color: 'text-emerald-500' },
    neutral: { icon: Meh, color: 'text-slate-500' },
    negative: { icon: Frown, color: 'text-rose-500' }
};

export const ConversationSearchInterface: React.FC<ConversationSearchInterfaceProps> = ({ onConversationClick }) => {
    const [query, setQuery] = useState('');
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
    const [selectedSentiment, setSelectedSentiment] = useState<Sentiment | 'all'>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [conversations, setConversations] = useState<ConversationResponseDto[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const limit = 12;

    // Fetch projects
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await apiClient.get('/pm-dashboard/projects');
                setProjects(response.data.data);
            } catch (err) {
                console.error('Error fetching projects:', err);
            }
        };
        fetchProjects();
    }, []);

    const performSearch = async (isLoadMore: boolean = false) => {
        setLoading(true);
        try {
            const filters: any = {
                limit,
                offset: isLoadMore ? offset : 0
            };

            if (query.trim()) filters.query = query.trim();
            if (selectedProjectIds.length > 0) filters.project_ids = selectedProjectIds;
            if (selectedSentiment !== 'all') filters.sentiment = selectedSentiment;
            if (dateFrom) filters.date_from = dateFrom;
            if (dateTo) filters.date_to = dateTo;

            const result = await searchConversations(filters);

            if (isLoadMore) {
                setConversations(prev => [...prev, ...result.data]);
                setOffset(prev => prev + limit);
            } else {
                setConversations(result.data);
                setOffset(limit);
            }

            setHasMore(result.hasMore);
        } catch (err) {
            console.error('Error searching conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        performSearch(false);
    };

    const handleClearFilters = () => {
        setQuery('');
        setSelectedProjectIds([]);
        setSelectedSentiment('all');
        setDateFrom('');
        setDateTo('');
        setConversations([]);
        setOffset(0);
    };

    const handleProjectToggle = (projectId: string) => {
        setSelectedProjectIds(prev =>
            prev.includes(projectId)
                ? prev.filter(id => id !== projectId)
                : [...prev, projectId]
        );
    };

    const handleLoadMore = () => {
        performSearch(true);
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query || selectedProjectIds.length > 0 || selectedSentiment !== 'all' || dateFrom || dateTo) {
                performSearch(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="max-w-7xl mx-auto p-8">
            <h1 className="text-4xl font-extrabold text-white mb-8">Search Conversations</h1>

            {/* Search Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search conversations by keyword..."
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Project Filter */}
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Projects</label>
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-32 overflow-y-auto">
                            {projects.map((project) => (
                                <label key={project.id} className="flex items-center gap-2 py-1 cursor-pointer hover:text-blue-400 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selectedProjectIds.includes(project.id)}
                                        onChange={() => handleProjectToggle(project.id)}
                                        className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-300">{project.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Sentiment Filter */}
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Sentiment</label>
                        <select
                            value={selectedSentiment}
                            onChange={(e) => setSelectedSentiment(e.target.value as Sentiment | 'all')}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                        >
                            <option value="all">All</option>
                            <option value="positive">Positive</option>
                            <option value="neutral">Neutral</option>
                            <option value="negative">Negative</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Date Range</label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleSearch}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                        <Search className="w-5 h-5" />
                        Search
                    </button>
                    <button
                        onClick={handleClearFilters}
                        className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-all flex items-center gap-2"
                    >
                        <X className="w-5 h-5" />
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Results */}
            {loading && conversations.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                </div>
            ) : conversations.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {conversations.map((conversation) => {
                            const sentiment = conversation.sentiment || 'neutral';
                            const SentimentIcon = sentimentIcons[sentiment].icon;
                            const snippet = conversation.summary?.substring(0, 100) || 'No summary available';

                            return (
                                <div
                                    key={conversation.id}
                                    onClick={() => onConversationClick(conversation.id)}
                                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-500/5 hover:border-blue-500/30 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-bold text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-1">
                                            {conversation.title}
                                        </h3>
                                        <SentimentIcon className={`w-5 h-5 ${sentimentIcons[sentiment].color} flex-shrink-0`} />
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{new Date(conversation.conversation_date).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span className="text-slate-400">{conversation.project.name}</span>
                                    </div>

                                    <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                                        {snippet}...
                                    </p>

                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">
                                            {conversation.action_items?.length || 0} action item{conversation.action_items?.length !== 1 ? 's' : ''}
                                        </span>
                                        <span className="text-blue-400 font-medium group-hover:underline">View →</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Load More */}
                    {hasMore && (
                        <div className="text-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={loading}
                                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    'Load More'
                                )}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
                    <p className="text-slate-500 text-xl font-medium">No conversations found. Try different filters.</p>
                </div>
            )}
        </div>
    );
};

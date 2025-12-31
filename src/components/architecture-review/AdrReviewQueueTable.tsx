import React from 'react';
import type { AdrQueueItem } from '../../types/architectureReview';
import { RiskBadge } from './RiskBadge';
import { Clock, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AdrReviewQueueTableProps {
    items: AdrQueueItem[];
    isLoading: boolean;
    onReview: (item: AdrQueueItem) => void;
    onSort: (column: 'risk_level' | 'created_at' | 'confidence') => void;
    sortBy?: 'risk_level' | 'created_at' | 'confidence';
    sortOrder?: 'asc' | 'desc';
}

export const AdrReviewQueueTable: React.FC<AdrReviewQueueTableProps> = ({
    items,
    isLoading,
    onReview,
    onSort,
    sortBy,
    sortOrder
}) => {
    if (isLoading) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-slate-800/50 rounded-xl"></div>
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎉</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Queue Empty</h3>
                <p className="text-slate-400">No architecture decisions pending review.</p>
            </div>
        );
    }

    const SortIcon = ({ column }: { column: string }) => {
        if (sortBy !== column) return null;
        return <span className="ml-1 text-slate-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/50">
                            <th className="text-left py-4 px-6 text-slate-400 font-semibold w-1/3">Decision Title</th>
                            <th
                                className="text-left py-4 px-6 text-slate-400 font-semibold cursor-pointer hover:text-white"
                                onClick={() => onSort('risk_level')}
                            >
                                Risk Level <SortIcon column="risk_level" />
                            </th>
                            <th
                                className="text-left py-4 px-6 text-slate-400 font-semibold cursor-pointer hover:text-white"
                                onClick={() => onSort('confidence')}
                            >
                                Confidence <SortIcon column="confidence" />
                            </th>
                            <th
                                className="text-left py-4 px-6 text-slate-400 font-semibold cursor-pointer hover:text-white"
                                onClick={() => onSort('created_at')}
                            >
                                Age <SortIcon column="created_at" />
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-semibold">Est. Time</th>
                            <th className="text-right py-4 px-6 text-slate-400 font-semibold">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                                <td className="py-4 px-6">
                                    <div>
                                        <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors mb-1">
                                            {item.title}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                                                {item.ticket.clickup_task_id}
                                            </span>
                                            <span>{item.ticket.title}</span>
                                            <a href={`https://app.clickup.com/t/${item.ticket.clickup_task_id}`} target="_blank" rel="noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ExternalLink className="w-3 h-3 text-slate-500 hover:text-blue-400" />
                                            </a>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <RiskBadge level={item.risk_level} />
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${item.confidence > 0.8 ? 'bg-emerald-500' :
                                                    item.confidence > 0.6 ? 'bg-amber-500' : 'bg-rose-500'
                                                    }`}
                                                style={{ width: `${item.confidence * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-medium text-slate-300">
                                            {Math.round(item.confidence * 100)}%
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-slate-400">
                                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{item.estimated_review_time_minutes} min</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <button
                                        onClick={() => onReview(item)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                                    >
                                        Review
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

/**
 * Story Drill-Down Modal
 * Detailed breakdown modal for individual story costs
 */

import { X, DollarSign, Clock, Code } from 'lucide-react';

interface Story {
    id: string;
    title: string;
    epicId: string;
    cost: number;
}

interface StoryDrillDownModalProps {
    isOpen: boolean;
    onClose: () => void;
    story: Story;
}

export function StoryDrillDownModal({ isOpen, onClose, story }: StoryDrillDownModalProps) {
    if (!isOpen) return null;

    // Mock detailed breakdown data
    const breakdown = {
        cursor: { executions: 45, cost: 620 },
        claude: { executions: 28, cost: 630 },
        totalExecutions: 73,
        avgExecutionTime: 12.5,
        successRate: 94,
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/70 z-50" onClick={onClose} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{story.title}</h2>
                            <p className="text-slate-400 text-sm mt-1">
                                Story {story.id}
                                {story.epicId != null && story.epicId !== '' && ` · Epic ${story.epicId}`}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Cost Summary */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs text-slate-500 uppercase font-semibold">Total Cost</span>
                                </div>
                                <div className="text-2xl font-bold text-white">${story.cost}</div>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Code className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs text-slate-500 uppercase font-semibold">Executions</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{breakdown.totalExecutions}</div>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-amber-500" />
                                    <span className="text-xs text-slate-500 uppercase font-semibold">Avg Time</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{breakdown.avgExecutionTime}s</div>
                            </div>
                        </div>

                        {/* Provider Breakdown */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">Cost by Provider</h3>
                            <div className="space-y-3">
                                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-semibold text-white">CURSOR</div>
                                        <div className="text-xs text-slate-500">{breakdown.cursor.executions} executions</div>
                                    </div>
                                    <div className="text-xl font-bold text-blue-400">${breakdown.cursor.cost}</div>
                                </div>
                                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-semibold text-white">CLAUDE</div>
                                        <div className="text-xs text-slate-500">{breakdown.claude.executions} executions</div>
                                    </div>
                                    <div className="text-xl font-bold text-emerald-400">${breakdown.claude.cost}</div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">Performance</h3>
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-400">Success Rate</span>
                                    <span className="text-sm font-bold text-emerald-400">{breakdown.successRate}%</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2">
                                    <div
                                        className="bg-emerald-500 h-2 rounded-full"
                                        style={{ width: `${breakdown.successRate}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

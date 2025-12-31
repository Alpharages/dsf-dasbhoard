/**
 * Efficiency Leaderboard
 * Ranked table of AI models by efficiency score
 */

import { Award } from 'lucide-react';

interface Model {
    modelName: string;
    provider: string;
    successRate: number;
    costPerExecution: string;
    avgExecutionTimeSec: number;
}

interface EfficiencyLeaderboardProps {
    models: Model[];
}

export function EfficiencyLeaderboard({ models }: EfficiencyLeaderboardProps) {
    // Calculate efficiency score: weighted formula (cost 40%, success 40%, speed 20%)
    const modelsWithScore = models.map(model => ({
        ...model,
        efficiencyScore: (
            (100 - parseFloat(model.costPerExecution)) * 0.4 +
            model.successRate * 0.4 +
            (100 - Math.min(model.avgExecutionTimeSec, 100)) * 0.2
        ).toFixed(1),
    })).sort((a, b) => parseFloat(b.efficiencyScore) - parseFloat(a.efficiencyScore));

    return (
        <div className="space-y-3">
            {modelsWithScore.slice(0, 5).map((model, index) => (
                <div
                    key={model.modelName}
                    className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-600/50 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${index === 0 ? 'bg-amber-500/10 border border-amber-500/20' :
                                index === 1 ? 'bg-slate-400/10 border border-slate-400/20' :
                                    index === 2 ? 'bg-orange-600/10 border border-orange-600/20' :
                                        'bg-slate-800'
                            }`}>
                            {index < 3 ? (
                                <Award className={`w-5 h-5 ${index === 0 ? 'text-amber-500' :
                                        index === 1 ? 'text-slate-400' :
                                            'text-orange-600'
                                    }`} />
                            ) : (
                                <span className="text-sm font-bold text-slate-500">#{index + 1}</span>
                            )}
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-white">{model.modelName}</div>
                            <div className="text-xs text-slate-500">{model.provider}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-xs text-slate-500">Success</div>
                            <div className="text-sm font-semibold text-emerald-400">{model.successRate}%</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-500">Cost/Exec</div>
                            <div className="text-sm font-semibold text-blue-400">${model.costPerExecution}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-500">Score</div>
                            <div className="text-lg font-bold text-white">{model.efficiencyScore}</div>
                        </div>
                    </div>
                </div>
            ))}</div>
    );
}

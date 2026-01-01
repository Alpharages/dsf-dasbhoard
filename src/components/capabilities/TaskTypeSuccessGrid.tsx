import React from 'react';
import { TrendingUp, TrendingDown, Minus, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import type { CapabilityMetric, TrendIndicator } from '../../types/capabilities';
import { TASK_TYPE_LABELS } from '../../types/capabilities';

interface TaskTypeSuccessGridProps {
    capabilities: CapabilityMetric[];
}

const getStatusIcon = (successRate: number) => {
    if (successRate >= 70) return <CheckCircle2 className="w-6 h-6 text-green-400" />;
    if (successRate >= 50) return <AlertCircle className="w-6 h-6 text-yellow-400" />;
    return <XCircle className="w-6 h-6 text-red-400" />;
};

const getTrendIcon = (trend: TrendIndicator) => {
    const iconClass = 'w-5 h-5';
    if (trend === 'UP') return <TrendingUp className={iconClass + ' text-green-400'} />;
    if (trend === 'DOWN') return <TrendingDown className={iconClass + ' text-red-400'} />;
    return <Minus className={iconClass + ' text-slate-400'} />;
};

const getGradientClass = (successRate: number): string => {
    if (successRate >= 70) return 'from-green-500/10 to-green-600/5 border-green-500/20';
    if (successRate >= 50) return 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/20';
    return 'from-red-500/10 to-red-600/5 border-red-500/20';
};

export const TaskTypeSuccessGrid: React.FC<TaskTypeSuccessGridProps> = ({ capabilities }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((cap) => {
                const gradientClass = getGradientClass(cap.successRate);

                return (
                    <div
                        key={cap.taskType}
                        className={`bg-gradient-to-br ${gradientClass} rounded-xl p-5 border transition-all hover:scale-105 hover:shadow-lg`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(cap.successRate)}
                                <h4 className="font-semibold text-white text-sm">
                                    {TASK_TYPE_LABELS[cap.taskType]}
                                </h4>
                            </div>
                            {getTrendIcon(cap.trend)}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white">
                                    {cap.successRate.toFixed(0)}%
                                </span>
                                <span className="text-sm text-slate-400">success</span>
                            </div>

                            <div className="w-full bg-slate-700/50 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${cap.successRate >= 70
                                            ? 'bg-green-500'
                                            : cap.successRate >= 50
                                                ? 'bg-yellow-500'
                                                : 'bg-red-500'
                                        }`}
                                    style={{ width: `${cap.successRate}%` }}
                                />
                            </div>

                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                <span>Trend:</span>
                                <span className={
                                    cap.trend === 'UP' ? 'text-green-400 font-medium' :
                                        cap.trend === 'DOWN' ? 'text-red-400 font-medium' :
                                            'text-slate-400'
                                }>
                                    {cap.trend === 'UP' ? 'Improving' : cap.trend === 'DOWN' ? 'Declining' : 'Stable'}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

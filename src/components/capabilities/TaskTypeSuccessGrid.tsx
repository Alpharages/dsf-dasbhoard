import React from 'react';
import { TrendingUp, TrendingDown, Minus, CheckCircle2, AlertCircle, XCircle, Sparkles } from 'lucide-react';
import type { CapabilityMetric, TrendIndicator } from '../../types/capabilities';
import { TASK_TYPE_LABELS } from '../../types/capabilities';

interface TaskTypeSuccessGridProps {
    capabilities: CapabilityMetric[];
}

const getStatusConfig = (successRate: number) => {
    if (successRate >= 70) {
        return {
            icon: CheckCircle2,
            iconColor: 'text-emerald-400',
            bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
            borderColor: 'border-emerald-500/20',
            glowColor: 'shadow-emerald-500/10',
            barColor: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
            trendColor: 'text-emerald-400'
        };
    }
    if (successRate >= 50) {
        return {
            icon: AlertCircle,
            iconColor: 'text-amber-400',
            bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
            borderColor: 'border-amber-500/20',
            glowColor: 'shadow-amber-500/10',
            barColor: 'bg-gradient-to-r from-amber-400 to-amber-500',
            trendColor: 'text-amber-400'
        };
    }
    return {
        icon: XCircle,
        iconColor: 'text-rose-400',
        bgGradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
        borderColor: 'border-rose-500/20',
        glowColor: 'shadow-rose-500/10',
        barColor: 'bg-gradient-to-r from-rose-400 to-rose-500',
        trendColor: 'text-rose-400'
    };
};

const getTrendIcon = (trend: TrendIndicator) => {
    const iconClass = 'w-4 h-4';
    if (trend === 'UP') return <TrendingUp className={iconClass + ' text-emerald-400'} />;
    if (trend === 'DOWN') return <TrendingDown className={iconClass + ' text-rose-400'} />;
    return <Minus className={iconClass + ' text-slate-400'} />;
};

const getTrendLabel = (trend: TrendIndicator) => {
    if (trend === 'UP') return { text: 'Improving', color: 'text-emerald-400' };
    if (trend === 'DOWN') return { text: 'Declining', color: 'text-rose-400' };
    return { text: 'Stable', color: 'text-slate-400' };
};

export const TaskTypeSuccessGrid: React.FC<TaskTypeSuccessGridProps> = ({ capabilities }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((cap, index) => {
                const config = getStatusConfig(cap.successRate);
                const StatusIcon = config.icon;
                const trendInfo = getTrendLabel(cap.trend);

                return (
                    <div
                        key={cap.taskType}
                        className={`
                            group relative overflow-hidden rounded-2xl p-5 
                            border ${config.borderColor} bg-gradient-to-br ${config.bgGradient}
                            transition-all duration-300 ease-out
                            hover:scale-[1.02] hover:shadow-lg ${config.glowColor}
                        `}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {/* Background glow effect */}
                        <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${config.bgGradient} group-hover:opacity-30 transition-opacity`} />

                        {/* Header */}
                        <div className="relative flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`
                                    p-2.5 rounded-xl 
                                    bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
                                    ${config.iconColor}
                                `}>
                                    <StatusIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-[var(--color-text-primary)] text-sm leading-tight">
                                        {TASK_TYPE_LABELS[cap.taskType]}
                                    </h4>
                                    <span className="text-xs text-[var(--color-text-tertiary)]">Task Type</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                                {getTrendIcon(cap.trend)}
                            </div>
                        </div>

                        {/* Success Rate */}
                        <div className="relative space-y-3">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-[var(--color-text-primary)] tracking-tight">
                                    {cap.successRate.toFixed(0)}
                                    <span className="text-2xl text-[var(--color-text-secondary)]">%</span>
                                </span>
                                <span className="text-sm text-[var(--color-text-secondary)]">success rate</span>
                            </div>

                            {/* Progress bar */}
                            <div className="relative">
                                <div className="w-full h-2.5 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${config.barColor} transition-all duration-700 ease-out`}
                                        style={{ 
                                            width: `${cap.successRate}%`,
                                            transitionDelay: `${index * 100}ms`
                                        }}
                                    />
                                </div>
                                {/* Percentage markers */}
                                <div className="flex justify-between mt-1.5 text-[10px] text-[var(--color-text-muted)] font-medium">
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                            </div>

                            {/* Trend indicator */}
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-[var(--color-text-tertiary)]">Trend:</span>
                                <span className={`font-medium ${trendInfo.color} flex items-center gap-1`}>
                                    {trendInfo.text}
                                    {cap.trend === 'UP' && <Sparkles className="w-3 h-3" />}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

import React from 'react';
import { Activity, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Minus, Zap, Clock } from 'lucide-react';
import type { CapabilityMetric } from '../../types/capabilities';
import type { Limitation } from '../../types/capabilities';

interface CapabilitySummaryCardsProps {
    capabilities: CapabilityMetric[];
    limitations: Limitation[];
}

interface SummaryMetric {
    label: string;
    value: string;
    subtext: string;
    trend: 'up' | 'down' | 'stable';
    trendValue: string;
    icon: React.ElementType;
    color: 'emerald' | 'blue' | 'amber' | 'rose';
}

export const CapabilitySummaryCards: React.FC<CapabilitySummaryCardsProps> = ({
    capabilities,
    limitations
}) => {
    // Calculate metrics
    const overallSuccessRate = capabilities.length > 0
        ? capabilities.reduce((sum, cap) => sum + cap.successRate, 0) / capabilities.length
        : 0;

    const improvingCount = capabilities.filter(cap => cap.trend === 'UP').length;
    const decliningCount = capabilities.filter(cap => cap.trend === 'DOWN').length;
    const overallTrend = improvingCount > decliningCount ? 'up' : decliningCount > improvingCount ? 'down' : 'stable';

    const activeLimitations = limitations.filter(lim => !lim.isDisabled).length;
    const disabledTasks = limitations.filter(lim => lim.isDisabled).length;

    const highRiskCount = capabilities.filter(cap => cap.successRate < 50).length;

    const metrics: SummaryMetric[] = [
        {
            label: 'Overall Success Rate',
            value: `${overallSuccessRate.toFixed(1)}%`,
            subtext: 'Across all task types',
            trend: overallTrend,
            trendValue: improvingCount > decliningCount ? `+${improvingCount}` : decliningCount > 0 ? `-${decliningCount}` : '0',
            icon: Activity,
            color: overallSuccessRate >= 70 ? 'emerald' : overallSuccessRate >= 50 ? 'amber' : 'rose'
        },
        {
            label: 'System Health',
            value: highRiskCount === 0 ? 'Excellent' : highRiskCount <= 2 ? 'Good' : 'Needs Attention',
            subtext: `${highRiskCount} high-risk task types`,
            trend: highRiskCount === 0 ? 'up' : 'down',
            trendValue: highRiskCount === 0 ? 'Optimal' : 'Review',
            icon: highRiskCount === 0 ? CheckCircle2 : Zap,
            color: highRiskCount === 0 ? 'emerald' : highRiskCount <= 2 ? 'amber' : 'rose'
        },
        {
            label: 'Active Limitations',
            value: String(activeLimitations),
            subtext: `${disabledTasks} tasks disabled`,
            trend: 'stable',
            trendValue: 'Documented',
            icon: AlertTriangle,
            color: activeLimitations === 0 ? 'emerald' : activeLimitations <= 3 ? 'amber' : 'rose'
        },
        {
            label: 'Task Types',
            value: String(capabilities.length),
            subtext: `${improvingCount} improving`,
            trend: improvingCount > decliningCount ? 'up' : decliningCount > improvingCount ? 'down' : 'stable',
            trendValue: `${improvingCount}↑ ${decliningCount}↓`,
            icon: Clock,
            color: 'blue'
        }
    ];

    const getColorClasses = (color: string) => {
        const classes = {
            emerald: {
                bg: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
                border: 'border-emerald-500/20',
                iconBg: 'bg-emerald-500/15',
                iconColor: 'text-emerald-400',
                trendColor: 'text-emerald-400'
            },
            blue: {
                bg: 'from-blue-500/15 via-blue-500/5 to-transparent',
                border: 'border-blue-500/20',
                iconBg: 'bg-blue-500/15',
                iconColor: 'text-blue-400',
                trendColor: 'text-blue-400'
            },
            amber: {
                bg: 'from-amber-500/15 via-amber-500/5 to-transparent',
                border: 'border-amber-500/20',
                iconBg: 'bg-amber-500/15',
                iconColor: 'text-amber-400',
                trendColor: 'text-amber-400'
            },
            rose: {
                bg: 'from-rose-500/15 via-rose-500/5 to-transparent',
                border: 'border-rose-500/20',
                iconBg: 'bg-rose-500/15',
                iconColor: 'text-rose-400',
                trendColor: 'text-rose-400'
            }
        };
        return classes[color as keyof typeof classes] || classes.blue;
    };

    const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
        if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5" />;
        if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5" />;
        return <Minus className="w-3.5 h-3.5" />;
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => {
                const colors = getColorClasses(metric.color);
                const Icon = metric.icon;

                return (
                    <div
                        key={metric.label}
                        className={`
                            group relative overflow-hidden rounded-lg p-5 
                            border ${colors.border} bg-gradient-to-br ${colors.bg}
                            transition-all duration-300 ease-out
                            hover:scale-[1.02] hover:shadow-lg
                        `}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Background glow */}
                        <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full blur-3xl opacity-20 
                            bg-gradient-to-br ${colors.bg} group-hover:opacity-30 transition-opacity`} 
                        />

                        <div className="relative">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className={`p-2.5 rounded-xl ${colors.iconBg} ${colors.iconColor}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className={`
                                    flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
                                    ${colors.iconBg} ${colors.trendColor}
                                `}>
                                    <TrendIcon trend={metric.trend} />
                                    {metric.trendValue}
                                </div>
                            </div>

                            {/* Value */}
                            <div className="space-y-1">
                                <p className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
                                    {metric.value}
                                </p>
                                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                                    {metric.label}
                                </p>
                                <p className="text-xs text-[var(--color-text-tertiary)]">
                                    {metric.subtext}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CapabilitySummaryCards;

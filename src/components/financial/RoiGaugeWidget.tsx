import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { financialApi } from '../../api/financialApi';
import { TrendingUp, TrendingDown, Minus, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RoiGaugeWidgetProps {
    projectId: string;
    period?: 'day' | 'week' | 'month';
}

export const RoiGaugeWidget: React.FC<RoiGaugeWidgetProps> = ({ projectId, period = 'month' }) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['roi', projectId, period],
        queryFn: () => financialApi.getRoi({ projectId, period }),
        enabled: !!projectId,
    });

    if (isLoading) {
        return (
            <Card className="h-[520px]">
                <CardContent className="h-full flex items-center justify-center">
                    <div className="h-48 w-full bg-muted animate-pulse rounded-xl" />
                </CardContent>
            </Card>
        );
    }

    if (error || !data) {
        return (
            <Card className="h-[520px]">
                <CardContent className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground text-center">Failed to load ROI data</p>
                </CardContent>
            </Card>
        );
    }

    const roi = data.metrics.roiPercentage;
    const getTrendIcon = () => {
        if (data.trend.direction === 'improving') return <TrendingUp className="w-5 h-5 text-emerald-500" />;
        if (data.trend.direction === 'declining') return <TrendingDown className="w-5 h-5 text-rose-500" />;
        return <Minus className="w-5 h-5 text-muted-foreground" />;
    };

    const getColor = () => {
        if (roi > 100) return 'text-emerald-500';
        if (roi > 50) return 'text-yellow-500';
        return 'text-rose-500';
    };

    const getStrokeColor = () => {
        if (roi > 100) return '#10b981';
        if (roi > 50) return '#eab308';
        return '#ef4444';
    };

    // Calculate gauge fill (capped at 300% for display)
    const displayRoi = Math.min(roi, 300);
    const fillPercentage = (displayRoi / 300) * 100;

    return (
        <Card className="h-[520px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                        <DollarSign className="h-4 h-4" />
                    </div>
                    <CardTitle className="text-sm font-medium">ROI Analysis</CardTitle>
                </div>
                <div className="text-xs text-muted-foreground bg-[var(--surface-1)] px-2 py-1 rounded border border-[var(--card-border)]">
                    {period.toUpperCase()}
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
                {/* Circular Gauge */}
                <div className="relative w-40 h-40 mx-auto my-4">
                    <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
                        {/* Background circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r="80"
                            fill="none"
                            stroke="var(--muted)"
                            strokeWidth="16"
                        />
                        {/* Foreground arc */}
                        <circle
                            cx="100"
                            cy="100"
                            r="80"
                            fill="none"
                            stroke={getStrokeColor()}
                            strokeWidth="16"
                            strokeDasharray={`${(fillPercentage / 100) * 502.65} 502.65`}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                        />
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-semibold data-figure tabular-nums ${getColor()}`}>
                            {roi.toFixed(0)}%
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">ROI</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="space-y-3 mt-auto">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--card-border)]">
                        <span className="text-sm text-muted-foreground">Trend</span>
                        <div className="flex items-center gap-2">
                            {getTrendIcon()}
                            <span className={`text-sm font-semibold ${data.trend.direction === 'improving' ? 'text-emerald-500' :
                                data.trend.direction === 'declining' ? 'text-rose-500' : 'text-muted-foreground'
                                }`}>
                                {data.trend.change}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--card-border)]">
                        <span className="text-sm text-muted-foreground">Cost/Story Point</span>
                        <span className="text-sm font-semibold text-foreground">
                            ${data.metrics.costPerStoryPoint}
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--card-border)]">
                        <span className="text-sm text-muted-foreground">Break-even</span>
                        <span className="text-sm font-semibold text-foreground">
                            {data.metrics.breakEvenPoint}
                        </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                        <span className="text-xs text-muted-foreground">Total Value</span>
                        <span className="text-xs font-semibold text-emerald-500">
                            ${parseFloat(data.metrics.totalValueUsd).toLocaleString()}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Total Cost</span>
                        <span className="text-xs font-semibold text-foreground">
                            ${parseFloat(data.metrics.totalCostUsd).toLocaleString()}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

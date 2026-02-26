import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { financialApi } from '../../api/financialApi';
import { TrendingUp, TrendingDown, Minus, DollarSign } from 'lucide-react';

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
            <div className="bg-muted/50 border border-border rounded-2xl p-6 animate-pulse">
                <div className="h-48"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-muted/50 border border-border rounded-2xl p-6">
                <p className="text-muted-foreground text-center">Failed to load ROI data</p>
            </div>
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

    // Calculate gauge fill (capped at 300% for display)
    const displayRoi = Math.min(roi, 300);
    const fillPercentage = (displayRoi / 300) * 100;

    return (
        <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-500" />
                    ROI Analysis
                </h3>
                <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {period.toUpperCase()}
                </div>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-48 h-48 mx-auto mb-4">
                {/* Background circle */}
                <svg className="transform -rotate-90" viewBox="0 0 200 200">
                    <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="20"
                    />
                    {/* Foreground arc */}
                    <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke={roi > 100 ? '#10b981' : roi > 50 ? '#eab308' : '#ef4444'}
                        strokeWidth="20"
                        strokeDasharray={`${(fillPercentage / 100) * 502.65} 502.65`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${getColor()}`}>
                        {roi.toFixed(0)}%
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">ROI</span>
                </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
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

                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cost/Story Point</span>
                    <span className="text-sm font-semibold text-foreground">
                        ${data.metrics.costPerStoryPoint}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Break-even</span>
                    <span className="text-sm font-semibold text-foreground">
                        {data.metrics.breakEvenPoint}
                    </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
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
        </div>
    );
};

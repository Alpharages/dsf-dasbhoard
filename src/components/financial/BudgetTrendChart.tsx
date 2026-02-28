import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financialApi } from '../../api/financialApi';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { Download, TrendingUp, AlertTriangle, ChevronDown } from 'lucide-react';

interface BudgetTrendChartProps {
    projectId: string;
}

export const BudgetTrendChart: React.FC<BudgetTrendChartProps> = ({ projectId }) => {
    const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

    const { data, isLoading, error } = useQuery({
        queryKey: ['budgetTrends', projectId, period],
        queryFn: () => financialApi.getBudgetTrends({ projectId, period }),
        enabled: !!projectId,
    });

    const handleDownloadCsv = async () => {
        try {
            const blob = await financialApi.downloadBudgetTrendsCsv({ projectId, period });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `budget-trends-${projectId}-${period}-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Failed to download CSV:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-muted/50 border border-border rounded-2xl p-6 animate-pulse">
                <div className="h-96"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-muted/50 border border-border rounded-2xl p-6">
                <p className="text-muted-foreground text-center">Failed to load budget trends</p>
            </div>
        );
    }

    const chartData = data.timeSeries.map((point) => ({
        date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        cumulative: parseFloat(point.cumulativeCost),
        daily: parseFloat(point.dailyCost),
    }));

    const budgetLimit = parseFloat(data.budget.totalBudgetUsd);
    const statusColor = data.trends.status === 'healthy' ? 'emerald' : data.trends.status === 'warning' ? 'yellow' : 'rose';

    return (
        <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Budget Utilization Trends
                    </h3>

                    {/* Period selector */}
                    <div className="relative">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value as typeof period)}
                            className="appearance-none bg-muted border border-border text-sm text-foreground rounded-lg px-3 py-1.5 pr-8 cursor-pointer hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="week">Week</option>
                            <option value="month">Month</option>
                            <option value="quarter">Quarter</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                <button
                    onClick={handleDownloadCsv}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-sm rounded-lg border border-border transition-colors"
                >
                    <Download className="w-4 h-4" />
                    CSV
                </button>
            </div>

            {/* Budget summary */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
                    <p className="text-xl font-bold text-foreground">
                        ${parseFloat(data.budget.totalBudgetUsd).toLocaleString()}
                    </p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Spent</p>
                    <p className="text-xl font-bold text-rose-500">
                        ${parseFloat(data.budget.spentUsd).toLocaleString()}
                    </p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                    <p className="text-xl font-bold text-emerald-500">
                        ${parseFloat(data.budget.remainingUsd).toLocaleString()}
                    </p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Utilization</p>
                    <div className="flex items-center gap-2">
                        <p className={`text-xl font-bold text-${statusColor}-500`}>
                            {data.budget.utilizationPercentage.toFixed(0)}%
                        </p>
                        <span className={`text-[10px] bg-${statusColor}-500/20 text-${statusColor}-500 px-2 py-0.5 rounded-full font-bold uppercase`}>
                            {data.trends.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Area chart */}
            <div className="h-72 mb-6 min-w-0">
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="date"
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                            tickFormatter={(value: number) => `$${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                padding: '12px',
                            }}
                            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: '8px' }}
                            formatter={(value?: number) => {
                                if (value === undefined) return ['', undefined];
                                return [`$${value.toFixed(2)}`, undefined];
                            }}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="line"
                        />
                        <ReferenceLine
                            y={budgetLimit}
                            stroke="#ef4444"
                            strokeDasharray="5 5"
                            label={{ value: 'Budget Limit', fill: '#ef4444', fontSize: 11 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="cumulative"
                            stroke="#6366f1"
                            fill="url(#cumulativeGradient)"
                            strokeWidth={2}
                            name="Cumulative Cost"
                        />
                        <Line
                            type="monotone"
                            dataKey="daily"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            dot={{ fill: '#8b5cf6', r: 3 }}
                            name="Daily Cost"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Forecast summary */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                <p className="text-sm font-semibold text-foreground mb-2">Forecast Analysis</p>
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                    <div>
                        <span className="text-muted-foreground">Burn Rate:</span>{' '}
                        <span className="font-semibold text-foreground">${parseFloat(data.trends.burnRatePerDay).toFixed(2)}/day</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Days Remaining:</span>{' '}
                        <span className="font-semibold text-foreground">{data.trends.forecastDaysRemaining} days</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Est. Exhaustion:</span>{' '}
                        <span className="font-semibold text-foreground">
                            {new Date(data.trends.forecastExhaustionDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Anomalies */}
            {data.anomalies.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Spending Anomalies
                    </p>
                    <div className="space-y-2">
                        {data.anomalies.slice(0, 3).map((anomaly, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-amber-500/5 border border-amber-500/20 rounded-lg p-2">
                                <span className="text-muted-foreground">{anomaly.date}</span>
                                <span className="text-amber-500 font-semibold">{anomaly.spike} spike</span>
                                <span className="text-muted-foreground">${parseFloat(anomaly.cost).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

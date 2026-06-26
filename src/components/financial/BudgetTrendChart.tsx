import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financialApi } from '../../api/financialApi';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { Download, TrendingUp, AlertTriangle, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
            <Card className="h-[520px]">
                <CardContent className="h-full flex items-center justify-center">
                    <div className="h-64 w-full bg-muted animate-pulse rounded-xl" />
                </CardContent>
            </Card>
        );
    }

    if (error || !data) {
        return (
            <Card className="h-[520px]">
                <CardContent className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground text-center">Failed to load budget trends</p>
                </CardContent>
            </Card>
        );
    }

    const chartData = data.timeSeries.map((point) => ({
        date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        cumulative: parseFloat(point.cumulativeCost),
        daily: parseFloat(point.dailyCost),
    }));

    const budgetLimit = parseFloat(data.budget.totalBudgetUsd);
    const statusColor = data.trends.status === 'healthy' ? 'emerald' : data.trends.status === 'warning' ? 'yellow' : 'rose';

    const statusConfig = {
        emerald: { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        yellow: { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        rose: { text: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    };

    const status = statusConfig[statusColor];

    return (
        <Card className="h-[520px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                        <TrendingUp className="h-4 h-4" />
                    </div>
                    <CardTitle className="text-sm font-medium">Budget Utilization Trends</CardTitle>

                    {/* Period selector */}
                    <div className="relative">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value as typeof period)}
                            className="appearance-none bg-[var(--surface-1)] border border-[var(--card-border)] text-sm text-foreground rounded-lg px-3 py-1.5 pr-8 cursor-pointer hover:bg-[var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="flex items-center gap-2 px-3 py-1.5 bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-foreground text-sm rounded-lg border border-[var(--card-border)] transition-colors"
                >
                    <Download className="w-4 h-4" />
                    CSV
                </button>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col min-h-0">
                {/* Budget summary */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="bg-[var(--surface-1)] rounded-xl p-3 border border-[var(--card-border)]">
                        <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
                        <p className="text-lg font-bold text-foreground">
                            ${parseFloat(data.budget.totalBudgetUsd).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-[var(--surface-1)] rounded-xl p-3 border border-[var(--card-border)]">
                        <p className="text-xs text-muted-foreground mb-1">Spent</p>
                        <p className="text-lg font-bold text-rose-500">
                            ${parseFloat(data.budget.spentUsd).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-[var(--surface-1)] rounded-xl p-3 border border-[var(--card-border)]">
                        <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                        <p className="text-lg font-bold text-emerald-500">
                            ${parseFloat(data.budget.remainingUsd).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-[var(--surface-1)] rounded-xl p-3 border border-[var(--card-border)]">
                        <p className="text-xs text-muted-foreground mb-1">Utilization</p>
                        <div className="flex items-center gap-2">
                            <p className={`text-lg font-bold ${status.text}`}>
                                {data.budget.utilizationPercentage.toFixed(0)}%
                            </p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${status.bg} ${status.text} ${status.border}`}>
                                {data.trends.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Area chart */}
                <div className="flex-1 min-h-0 w-full">
                    <ResponsiveContainer width="100%" height="100%" debounce={100}>
                        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis
                                dataKey="date"
                                stroke="var(--muted-foreground)"
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                            />
                            <YAxis
                                stroke="var(--muted-foreground)"
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                                tickFormatter={(value: number) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--popover)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                }}
                                labelStyle={{ color: 'var(--foreground)', fontWeight: 600, marginBottom: '8px' }}
                                formatter={(value?: number) => {
                                    if (value === undefined) return ['', undefined];
                                    return [`$${value.toFixed(2)}`, undefined];
                                }}
                            />
                            <Legend
                                wrapperStyle={{ paddingTop: '10px' }}
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
                <div className="mt-3 bg-[var(--surface-1)] rounded-xl p-3 border border-[var(--card-border)]">
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
                    <div className="mt-3 pt-3 border-t border-[var(--border)]">
                        <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
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
            </CardContent>
        </Card>
    );
};

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
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 animate-pulse">
                <div className="h-96"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <p className="text-slate-500 text-center">Failed to load budget trends</p>
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
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        Budget Utilization Trends
                    </h3>

                    {/* Period selector */}
                    <div className="relative">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value as typeof period)}
                            className="appearance-none bg-slate-800 border border-slate-700 text-sm text-slate-300 rounded-lg px-3 py-1.5 pr-8 cursor-pointer hover:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="week">Week</option>
                            <option value="month">Month</option>
                            <option value="quarter">Quarter</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                <button
                    onClick={handleDownloadCsv}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg border border-slate-700 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    CSV
                </button>
            </div>

            {/* Budget summary */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Total Budget</p>
                    <p className="text-xl font-bold text-white">
                        ${parseFloat(data.budget.totalBudgetUsd).toLocaleString()}
                    </p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Spent</p>
                    <p className="text-xl font-bold text-rose-400">
                        ${parseFloat(data.budget.spentUsd).toLocaleString()}
                    </p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Remaining</p>
                    <p className="text-xl font-bold text-emerald-400">
                        ${parseFloat(data.budget.remainingUsd).toLocaleString()}
                    </p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Utilization</p>
                    <div className="flex items-center gap-2">
                        <p className={`text-xl font-bold text-${statusColor}-400`}>
                            {data.budget.utilizationPercentage.toFixed(0)}%
                        </p>
                        <span className={`text-[10px] bg-${statusColor}-500/20 text-${statusColor}-400 px-2 py-0.5 rounded-full font-bold uppercase`}>
                            {data.trends.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Area chart */}
            <div className="h-72 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                            dataKey="date"
                            stroke="#64748b"
                            tick={{ fill: '#64748b', fontSize: 11 }}
                        />
                        <YAxis
                            stroke="#64748b"
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            tickFormatter={(value: number) => `$${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid #1e293b',
                                borderRadius: '8px',
                                padding: '12px',
                            }}
                            labelStyle={{ color: '#cbd5e1', fontWeight: 600, marginBottom: '8px' }}
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
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <p className="text-sm font-semibold text-slate-300 mb-2">Forecast Analysis</p>
                <div className="flex items-center gap-6 text-xs text-slate-400">
                    <div>
                        <span className="text-slate-500">Burn Rate:</span>{' '}
                        <span className="font-semibold text-white">${parseFloat(data.trends.burnRatePerDay).toFixed(2)}/day</span>
                    </div>
                    <div>
                        <span className="text-slate-500">Days Remaining:</span>{' '}
                        <span className="font-semibold text-white">{data.trends.forecastDaysRemaining} days</span>
                    </div>
                    <div>
                        <span className="text-slate-500">Est. Exhaustion:</span>{' '}
                        <span className="font-semibold text-white">
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
                <div className="mt-4 pt-4 border-t border-slate-800">
                    <p className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        Spending Anomalies
                    </p>
                    <div className="space-y-2">
                        {data.anomalies.slice(0, 3).map((anomaly, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-2">
                                <span className="text-slate-400">{anomaly.date}</span>
                                <span className="text-yellow-400 font-semibold">{anomaly.spike} spike</span>
                                <span className="text-slate-500">${parseFloat(anomaly.cost).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

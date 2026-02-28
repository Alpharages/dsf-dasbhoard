import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { CapabilityMetric, TrendIndicator } from '../../types/capabilities';
import { TASK_TYPE_LABELS } from '../../types/capabilities';

interface CapabilityTrendChartProps {
    capabilities: CapabilityMetric[];
}

const getBarColor = (successRate: number): string => {
    if (successRate >= 70) return '#10b981'; // Green
    if (successRate >= 50) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
};

const TrendIcon = ({ trend }: { trend: TrendIndicator }) => {
    const iconClass = 'w-4 h-4';
    if (trend === 'UP') return <TrendingUp className={iconClass + ' text-green-400'} />;
    if (trend === 'DOWN') return <TrendingDown className={iconClass + ' text-red-400'} />;
    return <Minus className={iconClass + ' text-gray-400'} />;
};

export const CapabilityTrendChart: React.FC<CapabilityTrendChartProps> = ({ capabilities }) => {
    const chartData = capabilities.map(cap => ({
        name: TASK_TYPE_LABELS[cap.taskType],
        successRate: cap.successRate,
        trend: cap.trend,
        taskType: cap.taskType
    }));

    return (
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 min-w-0">
            <div className="mb-4">
                <h3 className="text-xl font-bold text-white">Success Rate by Task Type</h3>
                <p className="text-sm text-slate-400">AI performance across different task categories</p>
            </div>

            <ResponsiveContainer width="100%" height={300} debounce={100}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tick={{ fill: '#94a3b8' }}
                        label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px'
                        }}
                        labelStyle={{ color: '#f1f5f9' }}
                        itemStyle={{ color: '#cbd5e1' }}
                        formatter={(value: number | undefined) => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const trend = (chartData.find(d => d.successRate === value) as any)?.trend;
                            return [
                                <div key="tooltip" className="flex items-center gap-2">
                                    <span>{(value ?? 0).toFixed(1)}%</span>
                                    {trend && <TrendIcon trend={trend} />}
                                </div>,
                                'Success Rate'
                            ];
                        }}
                    />
                    <Bar dataKey="successRate" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.successRate)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>≥70% Reliable</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>50-70% Moderate</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>&lt;50% Problematic</span>
                </div>
            </div>
        </div>
    );
};

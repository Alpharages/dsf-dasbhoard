import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { WorkloadTrendItem } from '../../api/workloadApi';

interface WorkloadTrendsChartProps {
    data: WorkloadTrendItem[];
}

export const WorkloadTrendsChart: React.FC<WorkloadTrendsChartProps> = ({ data }) => {
    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    Utilization History (30 Days)
                </h3>
            </div>

            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#64748b"
                            fontSize={10}
                            tickFormatter={(str) => {
                                const date = new Date(str);
                                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                            }}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={10}
                            domain={[0, 100]}
                            tickFormatter={(val) => `${val}%`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid #1e293b',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                            }}
                            labelStyle={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}
                            itemStyle={{ color: '#3b82f6', fontSize: '12px', fontWeight: '700' }}
                        />
                        <ReferenceLine
                            y={80}
                            stroke="#ef4444"
                            strokeDasharray="3 3"
                            label={{
                                value: 'Burnout Threshold',
                                position: 'right',
                                fill: '#ef4444',
                                fontSize: 10,
                                fontWeight: 'bold'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="utilization"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorUtil)"
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

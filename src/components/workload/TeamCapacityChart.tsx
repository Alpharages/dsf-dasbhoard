import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Users2, ArrowUpDown } from 'lucide-react';
import type { TeamWorkloadItem } from '../../api/workloadApi';

interface TeamCapacityChartProps {
    data: TeamWorkloadItem[];
    onPmClick?: (pmId: string) => void;
    onReassignClick?: (pmId: string) => void;
}

export const TeamCapacityChart: React.FC<TeamCapacityChartProps> = ({
    data,
    onPmClick
}) => {
    const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

    const sortedData = [...data].sort((a, b) => {
        return sortOrder === 'desc'
            ? b.utilization - a.utilization
            : a.utilization - b.utilization;
    });

    const getColor = (percent: number) => {
        if (percent <= 60) return '#10b981'; // Green
        if (percent <= 80) return '#eab308'; // Yellow
        return '#ef4444'; // Red
    };

    return (
        <div className="bg-card border border-border rounded-lg p-6 h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Users2 className="w-5 h-5 text-blue-400" />
                    Team Capacity Overview
                </h3>
                <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted text-foreground rounded-lg text-xs font-bold transition-all border border-border"
                >
                    <ArrowUpDown className="w-3 h-3" />
                    Sort: {sortOrder === 'desc' ? 'High Load' : 'Low Load'}
                </button>
            </div>

            <div className="flex-1 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                    <BarChart
                        data={sortedData}
                        layout="vertical"
                        margin={{ left: 40, right: 40 }}
                        onClick={(data: any) => {
                            if (data && data.activePayload && data.activePayload.length > 0) {
                                const payload = data.activePayload[0].payload as TeamWorkloadItem;
                                onPmClick?.(payload.pmId);
                            }
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                        <XAxis
                            type="number"
                            domain={[0, 100]}
                            stroke="#64748b"
                            fontSize={10}
                            tickFormatter={(val) => `${val}%`}
                        />
                        <YAxis
                            dataKey="pmName"
                            type="category"
                            stroke="#64748b"
                            fontSize={12}
                            width={100}
                        />
                        <Tooltip
                            cursor={{ fill: '#1e293b', opacity: 0.4 }}
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid #1e293b',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                            }}
                            labelStyle={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}
                            itemStyle={{ fontSize: '12px', fontWeight: '700' }}
                            formatter={(value: any) => [`${value}% Utilization`, 'Status']}
                        />
                        <Bar
                            dataKey="utilization"
                            radius={[0, 4, 4, 0]}
                            barSize={32}
                            className="cursor-pointer"
                        >
                            {sortedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getColor(entry.utilization)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Healthy</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Critical</span>
                </div>
            </div>
        </div>
    );
};

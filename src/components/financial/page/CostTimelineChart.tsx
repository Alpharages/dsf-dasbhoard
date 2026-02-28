/**
 * Cost Timeline Chart
 * Horizontal timeline showing cost accumulation over time
 */

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Line } from 'recharts';

interface CostTimelineChartProps {
    projectId: string | null;
}

export function CostTimelineChart(_props: CostTimelineChartProps) {
    // Mock timeline data - in production, fetch from API
    const timelineData = [
        { date: '2024-01', cost: 450, cumulative: 450 },
        { date: '2024-02', cost: 520, cumulative: 970 },
        { date: '2024-03', cost: 680, cumulative: 1650 },
        { date: '2024-04', cost: 590, cumulative: 2240 },
        { date: '2024-05', cost: 720, cumulative: 2960 },
        { date: '2024-06', cost: 800, cumulative: 3760 },
    ];

    return (
        <ResponsiveContainer width="100%" height={300} debounce={100}>
            <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="cumulative"
                    name="Cumulative Cost (USD)"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                />
                <Line
                    type="monotone"
                    dataKey="cost"
                    name="Monthly Cost"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

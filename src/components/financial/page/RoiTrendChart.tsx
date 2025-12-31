/**
 * ROI Trend Chart
 * Line chart showing ROI percentage over time with break-even analysis
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface RoiTrendChartProps {
    period: 'day' | 'week' | 'month';
}

export function RoiTrendChart(_props: RoiTrendChartProps) {
    // Mock trend data - in production, fetch from historical ROI API
    const trendData = [
        { period: 'Jan', roi: -15, value: 850, cost: 1000 },
        { period: 'Feb', roi: 8, value: 1350, cost: 1250 },
        { period: 'Mar', roi: 25, value: 1625, cost: 1300 },
        { period: 'Apr', roi: 42, value: 1988, cost: 1400 },
        { period: 'May', roi: 58, value: 2370, cost: 1500 },
        { period: 'Jun', roi: 72, value: 2752, cost: 1600 },
    ];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} unit="%" />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                    }}
                />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" label="Break-even" />
                <Line
                    type="monotone"
                    dataKey="roi"
                    name="ROI %"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#10b981' }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

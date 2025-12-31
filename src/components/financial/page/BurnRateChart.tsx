/**
 * Burn Rate Chart
 * Line chart with 7-day and 30-day moving averages
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BurnRateChartProps {
    projectId: string | null;
}

export function BurnRateChart(_props: BurnRateChartProps) {
    // Mock burn rate data - in production, fetch from budget API
    const burnRateData = Array.from({ length: 14 }, (_, i) => {
        const baseCost = 50 + Math.random() * 20;
        return {
            date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            daily: baseCost,
            sevenDay: baseCost * (0.95 + Math.random() * 0.1),
            thirtyDay: baseCost * (0.9 + Math.random() * 0.2),
        };
    });

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={burnRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} unit="$" />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                    }}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="daily"
                    name="Daily Burn Rate"
                    stroke="#3b82f6"
                    strokeWidth={1}
                    dot={{ r: 2 }}
                />
                <Line
                    type="monotone"
                    dataKey="sevenDay"
                    name="7-day Average"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                />
                <Line
                    type="monotone"
                    dataKey="thirtyDay"
                    name="30-day Average"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

/**
 * Cost vs Value Chart
 * Stacked area chart comparing value delivered vs cost invested
 */

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CostValueChartProps {
    period: 'day' | 'week' | 'month';
}

export function CostValueChart(_props: CostValueChartProps) {
    // Mock data - in production, fetch from historical API
    const costValueData = [
        { period: 'Jan', value: 850, cost: 1000 },
        { period: 'Feb', value: 1350, cost: 1250 },
        { period: 'Mar', value: 1625, cost: 1300 },
        { period: 'Apr', value: 1988, cost: 1400 },
        { period: 'May', value: 2370, cost: 1500 },
        { period: 'Jun', value: 2752, cost: 1600 },
    ];

    return (
        <ResponsiveContainer width="100%" height={300} debounce={100}>
            <AreaChart data={costValueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                    }}
                />
                <Legend />
                <Area
                    type="monotone"
                    dataKey="value"
                    stackId="1"
                    name="Value Delivered (USD)"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                />
                <Area
                    type="monotone"
                    dataKey="cost"
                    stackId="2"
                    name="Cost Invested (USD)"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

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
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="period" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--foreground)',
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

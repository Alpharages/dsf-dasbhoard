/**
 * Provider Donut Chart
 * Donut chart showing cost breakdown by AI provider
 */

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface ProviderDonutChartProps {
    providerData: Array<{ provider: string; percentage: number; costUsd: string }>;
}

export function ProviderDonutChart({ providerData }: ProviderDonutChartProps) {
    const chartData = providerData.map(item => ({
        name: item.provider,
        value: parseFloat(item.costUsd),
        percentage: item.percentage,
    }));

    const totalCost = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="relative min-w-0">
            <ResponsiveContainer width="100%" height={250} debounce={100}>
                <PieChart>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        labelLine={false}
                    >
                        {chartData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#e2e8f0',
                        }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-2xl font-bold text-foreground">${totalCost.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Total Cost</div>
            </div>
        </div>
    );
}

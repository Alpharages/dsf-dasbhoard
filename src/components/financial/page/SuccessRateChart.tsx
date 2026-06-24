/**
 * Success Rate Chart
 * Grouped bar chart comparing success rates by model
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SuccessRateChartProps {
    models: Array<{
        modelName: string;
        successRate: number;
    }>;
}

export function SuccessRateChart({ models }: SuccessRateChartProps) {
    const chartData = models.map(model => ({
        model: model.modelName,
        success: model.successRate,
        failure: 100 - model.successRate,
    }));

    return (
        <div className="min-w-0 w-full">
        <ResponsiveContainer width="100%" height={300} debounce={100}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="model" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} unit="%" />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                    }}
                />
                <Legend />
                <Bar dataKey="success" name="Success %" fill="#10b981" />
                <Bar dataKey="failure" name="Failure %" fill="#ef4444" />
            </BarChart>
        </ResponsiveContainer>
        </div>
    );
}

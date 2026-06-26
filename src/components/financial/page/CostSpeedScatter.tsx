/**
 * Cost-Speed Scatter Plot
 * Scatter chart showing cost vs execution time with bubble size for volume
 */

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';

interface CostSpeedScatterProps {
    models: Array<{
        modelName: string;
        costPerExecution: string;
        avgExecutionTimeSec: number;
        executionCount: number;
    }>;
}

export function CostSpeedScatter({ models }: CostSpeedScatterProps) {
    const scatterData = models.map(model => ({
        name: model.modelName,
        cost: parseFloat(model.costPerExecution),
        time: model.avgExecutionTimeSec,
        executions: model.executionCount,
    }));

    return (
        <div className="min-w-0 w-full">
            <ResponsiveContainer width="100%" height={300} debounce={100}>
                <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                        type="number"
                        dataKey="time"
                        name="Execution Time"
                        unit="s"
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        label={{ value: 'Avg Execution Time (seconds)', position: 'insideBottom', offset: -5, fill: 'var(--muted-foreground)' }}
                    />
                    <YAxis
                        type="number"
                        dataKey="cost"
                        name="Cost"
                        unit="$"
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        label={{ value: 'Cost per Execution (USD)', angle: -90, position: 'insideLeft', fill: 'var(--muted-foreground)' }}
                    />
                    <ZAxis type="number" dataKey="executions" range={[100, 1000]} name="Executions" />
                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{
                            backgroundColor: 'var(--popover)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            color: 'var(--foreground)',
                        }}
                    />
                    <Scatter name="Models" data={scatterData} fill="#3b82f6" />
                </ScatterChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500 rounded" />
                    <span className="text-muted-foreground">Fast & Cheap (Optimal)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500/20 border border-red-500 rounded" />
                    <span className="text-muted-foreground">Slow & Expensive (Review)</span>
                </div>
            </div>
        </div>
    );
}

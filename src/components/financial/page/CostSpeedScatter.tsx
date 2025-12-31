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
        <div>
            <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                        type="number"
                        dataKey="time"
                        name="Execution Time"
                        unit="s"
                        stroke="#94a3b8"
                        fontSize={12}
                        label={{ value: 'Avg Execution Time (seconds)', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                    />
                    <YAxis
                        type="number"
                        dataKey="cost"
                        name="Cost"
                        unit="$"
                        stroke="#94a3b8"
                        fontSize={12}
                        label={{ value: 'Cost per Execution (USD)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                    />
                    <ZAxis type="number" dataKey="executions" range={[100, 1000]} name="Executions" />
                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#e2e8f0',
                        }}
                    />
                    <Scatter name="Models" data={scatterData} fill="#3b82f6" />
                </ScatterChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500 rounded" />
                    <span className="text-slate-400">Fast & Cheap (Optimal)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500/20 border border-red-500 rounded" />
                    <span className="text-slate-400">Slow & Expensive (Review)</span>
                </div>
            </div>
        </div>
    );
}

/**
 * Epic Comparison Chart
 * Side-by-side bar chart comparing costs across multiple epics
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { financialApi } from '../../../api/financialApi';

interface EpicComparisonChartProps {
    projectId: string | null;
    selectedEpics?: string[];
}

export function EpicComparisonChart({ projectId, selectedEpics }: EpicComparisonChartProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['epic-comparison', projectId, selectedEpics],
        queryFn: async () => {
            if (!projectId) return null;
            return financialApi.getCostPerFeature({
                epicId: 'all',
                projectId,
                startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date().toISOString(),
            });
        },
        enabled: !!projectId,
    });

    if (isLoading) {
        return <div className="h-64 bg-slate-950 animate-pulse rounded-xl" />;
    }

    const epics = data || [];
    const filteredEpics = selectedEpics?.length
        ? epics.filter(e => selectedEpics.includes(e.epicId))
        : epics.slice(0, 5);

    return (
        <div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredEpics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="epicTitle" stroke="#94a3b8" fontSize={12} />
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
                    <Bar dataKey="totalCostUsd" name="Total Cost (USD)" fill="#3b82f6" />
                    <Bar dataKey="storyCount" name="Story Count" fill="#10b981" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

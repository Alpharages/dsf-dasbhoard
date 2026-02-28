import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financialApi } from '../../api/financialApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, DollarSign, ChevronDown } from 'lucide-react';

interface CostPerFeatureChartProps {
    projectId?: string;
    defaultEpicId?: string;
}

export const CostPerFeatureChart: React.FC<CostPerFeatureChartProps> = ({
    projectId,
    defaultEpicId = 'epic-5'
}) => {
    const [selectedEpic, setSelectedEpic] = useState(defaultEpicId);

    const { data, isLoading, error } = useQuery({
        queryKey: ['costPerFeature', selectedEpic, projectId],
        queryFn: () => financialApi.getCostPerFeature({ epicId: selectedEpic, projectId }),
    });

    const handleDownloadCsv = async () => {
        try {
            const blob = await financialApi.downloadCostPerFeatureCsv({ epicId: selectedEpic, projectId });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cost-per-feature-${selectedEpic}-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Failed to download CSV:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-muted/50 border border-border rounded-2xl p-6 animate-pulse">
                <div className="h-96"></div>
            </div>
        );
    }

    if (error || !data || data.length === 0) {
        return (
            <div className="bg-muted/50 border border-border rounded-2xl p-6">
                <p className="text-muted-foreground text-center">Failed to load cost data</p>
            </div>
        );
    }

    const epicData = data[0];
    const chartData = epicData.storyCosts.map((story) => ({
        name: story.storyId,
        cost: parseFloat(story.costUsd),
        title: story.storyTitle,
        tokens: story.tokensTotal,
    }));

    return (
        <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-purple-500" />
                        Cost per Feature
                    </h3>

                    {/* Epic selector dropdown */}
                    <div className="relative">
                        <select
                            value={selectedEpic}
                            onChange={(e) => setSelectedEpic(e.target.value)}
                            className="appearance-none bg-muted border border-border text-sm text-foreground rounded-lg px-3 py-1.5 pr-8 cursor-pointer hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="epic-5">Epic 5</option>
                            <option value="epic-6">Epic 6</option>
                            <option value="epic-13">Epic 13</option>
                            <option value="epic-14">Epic 14</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                <button
                    onClick={handleDownloadCsv}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-sm rounded-lg border border-border transition-colors"
                >
                    <Download className="w-4 h-4" />
                    CSV
                </button>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
                    <p className="text-2xl font-bold text-foreground">
                        ${parseFloat(epicData.totalCostUsd).toLocaleString()}
                    </p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Stories</p>
                    <p className="text-2xl font-bold text-foreground">{epicData.storyCount}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Avg/Story</p>
                    <p className="text-2xl font-bold text-foreground">
                        ${parseFloat(epicData.avgCostPerStory).toFixed(0)}
                    </p>
                </div>
            </div>

            {/* Bar chart */}
            <div className="h-64 min-w-0">
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                    <BarChart data={chartData}>
                        <defs>
                            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="name"
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            tickFormatter={(value: number) => `$${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                padding: '12px',
                            }}
                            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: '8px' }}
                            formatter={(value?: number, _name?: string, props?: any) => {
                                if (value === undefined) return ['', ''];
                                return [`$${value.toFixed(2)}`, props?.payload?.title || ''];
                            }}
                        />
                        <Bar dataKey="cost" fill="url(#costGradient)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Provider breakdown */}
            {epicData.byProvider.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm font-semibold text-muted-foreground mb-3">Provider Breakdown</p>
                    <div className="flex gap-4">
                        {epicData.byProvider.map((provider) => (
                            <div key={provider.provider} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${provider.provider === 'CURSOR_HEADLESS' ? 'bg-purple-500' : 'bg-blue-500'
                                    }`}></div>
                                <span className="text-xs text-muted-foreground">{provider.provider}:</span>
                                <span className="text-xs font-semibold text-foreground">
                                    ${parseFloat(provider.costUsd).toFixed(0)} ({provider.percentage.toFixed(1)}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

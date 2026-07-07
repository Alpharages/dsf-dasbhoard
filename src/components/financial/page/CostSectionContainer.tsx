/**
 * Cost Section Container
 * Epic comparison, provider breakdown, and timeline visualizations
 */

import { DollarSign, TrendingUp, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { financialApi } from '../../../api/financialApi';
import { CostPerFeatureChart } from '../CostPerFeatureChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer } from '@/components/dashboard/charts/ChartContainer';

interface CostSectionContainerProps {
    projectId: string | null;
    startDate: string;
    endDate: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function CostSectionContainer({ projectId, startDate, endDate }: CostSectionContainerProps) {

    const { data: costData, isLoading } = useQuery({
        queryKey: ['cost-per-feature', projectId, startDate, endDate],
        queryFn: async () => {
            if (!projectId) return null;
            return financialApi.getCostPerFeature({
                epicId: 'all',
                projectId,
                startDate,
                endDate,
            });
        },
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    if (!projectId) {
        return (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">Select a project to view cost analysis</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="bg-card border border-border rounded-lg p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-1/3"></div>
                    <div className="h-64 bg-muted rounded"></div>
                </div>
            </div>
        );
    }

    const epics = costData || [];
    const providerBreakdown = epics.length > 0 ? epics[0].byProvider : [];

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-md flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                        </div>
                        Cost Analysis
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">Epic comparison and provider breakdown</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 rounded-xl font-medium transition-all text-sm">
                    <Download className="w-4 h-4" />
                    Export
                </button>
            </div>

            {/* Reuse existing CostPerFeatureChart */}
            <div className="bg-card border border-border rounded-lg p-6 min-w-0">
                <h3 className="text-lg font-semibold text-foreground mb-4">Cost Per Feature</h3>
                <CostPerFeatureChart projectId={projectId} />
            </div>

            {/* Epic Comparison Chart */}
            <div className="bg-card border border-border rounded-lg p-6 min-w-0">
                <h3 className="text-lg font-semibold text-foreground mb-4">Epic Comparison</h3>
                <ChartContainer height={300}>
                    <BarChart data={epics.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="epicTitle" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                color: 'hsl(var(--card-foreground))',
                            }}
                        />
                        <Legend />
                        <Bar dataKey="totalCostUsd" name="Total Cost (USD)" fill="#3b82f6" />
                    </BarChart>
                </ChartContainer>
            </div>

            {/* Provider Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-lg p-6 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Provider Distribution</h3>
                    <ChartContainer height={250}>
                        <PieChart>
                            <Pie
                                data={providerBreakdown as any}
                                dataKey="cost"
                                nameKey="provider"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                            >
                                {providerBreakdown.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    color: 'hsl(var(--card-foreground))',
                                }}
                            />
                        </PieChart>
                    </ChartContainer>
                </div>

                {/* Top Expensive Epics */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Top 5 Expensive Epics</h3>
                    <div className="space-y-3">
                        {epics.slice(0, 5).map((epic, index) => (
                            <div
                                key={epic.epicId}
                                className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-xl hover:border-foreground/20 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                                        <span className="text-sm font-bold text-blue-500">#{index + 1}</span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-foreground">{epic.epicTitle}</div>
                                        <div className="text-xs text-muted-foreground">{epic.storyCount} stories</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-foreground">${epic.totalCostUsd}</div>
                                    <div className="text-xs text-muted-foreground">${epic.avgCostPerStory}/story</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

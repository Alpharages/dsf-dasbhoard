/**
 * Budget Section Container
 * Budget status, burn rate, and forecasting
 */

import { Gauge, TrendingDown, AlertTriangle, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { financialApi } from '../../../api/financialApi';
import { BudgetTrendChart } from '../BudgetTrendChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BudgetSectionContainerProps {
    projectId: string | null;
    period: 'week' | 'month' | 'quarter';
}

export function BudgetSectionContainer({ projectId, period }: BudgetSectionContainerProps) {
    const { data: budgetData, isLoading } = useQuery({
        queryKey: ['budget-trends', projectId, period],
        queryFn: async () => {
            if (!projectId) return null;
            return financialApi.getBudgetTrends({
                projectId,
                period,
            });
        },
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000,
    });

    if (!projectId) {
        return (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <Gauge className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">Select a project to view budget management</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="bg-card border border-border rounded-2xl p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-1/3"></div>
                    <div className="h-64 bg-muted rounded"></div>
                </div>
            </div>
        );
    }

    const utilizationPct = budgetData?.budget.utilizationPercentage || 0;
    const daysRemaining = budgetData?.trends.forecastDaysRemaining || 0;

    // Calculate burn rate data for chart using actual moving average
    const burnRateData = budgetData?.timeSeries.slice(-14).map((point, index, array) => {
        const dailyValue = parseFloat(point.dailyCost);

        // Calculate 7-day moving average (including current day)
        const window = array.slice(Math.max(0, index - 6), index + 1);
        const sevenDayAvg = window.reduce((sum, p) => sum + parseFloat(p.dailyCost), 0) / window.length;

        return {
            date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            daily: dailyValue,
            sevenDay: sevenDayAvg,
        };
    }) || [];

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
                            <Gauge className="w-5 h-5 text-amber-500" />
                        </div>
                        Budget Management
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">Budget utilization and burn rate analysis</p>
                </div>
            </div>

            {/* Budget Status Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-muted-foreground uppercase">Budget Utilization</span>
                        <div className={`px-2 py-1 rounded-lg text-xs font-bold ${utilizationPct > 80 ? 'bg-destructive/10 text-destructive' :
                            utilizationPct > 50 ? 'bg-amber-500/10 text-amber-500' :
                                'bg-emerald-500/10 text-emerald-500'
                            }`}>
                            {budgetData?.trends.status.toUpperCase()}
                        </div>
                    </div>
                    <div className="relative">
                        <svg className="w-full" viewBox="0 0 200 120">
                            <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(var(--muted))" strokeWidth="16" />
                            <circle
                                cx="100"
                                cy="100"
                                r="80"
                                fill="none"
                                stroke={utilizationPct > 80 ? 'hsl(var(--destructive))' : utilizationPct > 50 ? '#f59e0b' : '#10b981'}
                                strokeWidth="16"
                                strokeDasharray={`${(utilizationPct / 100) * 502.4} 502.4`}
                                transform="rotate(-90 100 100)"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '40%' }}>
                            <div className="text-4xl font-bold text-foreground">{utilizationPct}%</div>
                            <div className="text-xs text-muted-foreground mt-1">{daysRemaining} days remaining</div>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-muted-foreground uppercase">Burn Rate</span>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">${budgetData?.trends.burnRatePerDay || '0'}/day</div>
                    <div className="text-sm text-muted-foreground">Average daily spend</div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-muted-foreground uppercase">Exhaustion Date</span>
                    </div>
                    <div className="text-xl font-bold text-foreground mb-2">
                        {budgetData?.trends.forecastExhaustionDate ? new Date(budgetData.trends.forecastExhaustionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Projected budget depletion</div>
                </div>
            </div>

            {/* Reuse existing Budget Trend Chart */}
            <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Budget Trends</h3>
                <BudgetTrendChart projectId={projectId} />
            </div>

            {/* Burn Rate Chart with Moving Averages */}
            <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Burn Rate Analysis</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={burnRateData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
                        <Line type="monotone" dataKey="daily" name="Daily Burn Rate" stroke="#3b82f6" strokeWidth={1} dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="sevenDay" name="7-day Average" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Anomaly Alerts */}
            {budgetData && budgetData.anomalies.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <h3 className="text-lg font-semibold text-foreground">Spending Anomalies</h3>
                    </div>
                    <div className="space-y-3">
                        {budgetData.anomalies.map((anomaly, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl"
                            >
                                <div>
                                    <div className="text-sm font-semibold text-foreground">{new Date(anomaly.date).toLocaleDateString()}</div>
                                    <div className="text-xs text-muted-foreground mt-1">{anomaly.reason}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-amber-500">${anomaly.spike}</div>
                                    <div className="text-xs text-muted-foreground">above avg</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

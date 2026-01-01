import React from 'react';
import { useEscalationMetrics } from '../../hooks/useAdrQueue';
import { Loader2, TrendingUp, AlertTriangle, Clock, Users, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export const EscalationAnalyticsPage: React.FC = () => {
    const { data: metrics, isLoading, error } = useEscalationMetrics();

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-red-400">
                Failed to load metrics. Please try again.
            </div>
        );
    }

    if (!metrics) return null;

    const COLORS = ['#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

    return (
        <div className="space-y-8 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold text-white mb-2">Escalation Trends & Analytics</h1>
            <p className="text-slate-400 mb-8">Insights into AI architecture decision escalations and resolution patterns.</p>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertTriangle className="w-16 h-16 text-blue-500" />
                    </div>
                    <h3 className="text-slate-400 font-medium mb-1 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-blue-500" />
                        Total Escalations
                    </h3>
                    <div className="text-3xl font-bold text-white">{metrics.totalEscalations}</div>
                    <div className="text-xs text-blue-400 mt-2 bg-blue-500/10 inline-block px-2 py-0.5 rounded">All time</div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-16 h-16 text-purple-500" />
                    </div>
                    <h3 className="text-slate-400 font-medium mb-1 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                        Escalation Rate
                    </h3>
                    <div className="text-3xl font-bold text-white">{metrics.escalationRate}%</div>
                    <div className="text-xs text-purple-400 mt-2 bg-purple-500/10 inline-block px-2 py-0.5 rounded">Of all decisions</div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="w-16 h-16 text-emerald-500" />
                    </div>
                    <h3 className="text-slate-400 font-medium mb-1 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        Avg Resolution Time
                    </h3>
                    <div className="text-3xl font-bold text-white">{Math.round(metrics.avgResolutionTimeMinutes)}m</div>
                    <div className="text-xs text-emerald-400 mt-2 bg-emerald-500/10 inline-block px-2 py-0.5 rounded">Per escalation</div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-16 h-16 text-amber-500" />
                    </div>
                    <h3 className="text-slate-400 font-medium mb-1 flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-500" />
                        Delegation Rate
                    </h3>
                    <div className="text-3xl font-bold text-white">{metrics.delegationRate}%</div>
                    <div className="text-xs text-amber-400 mt-2 bg-amber-500/10 inline-block px-2 py-0.5 rounded">Of escalated items</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-slate-400" />
                        Primary Escalation Reasons
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={metrics.topReasons}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="reason"
                                >
                                    {metrics.topReasons.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-white mb-6">Top Reasons Breakdown</h3>
                    <div className="space-y-4">
                        {metrics.topReasons.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                                <span className="text-2xl font-bold text-slate-500 w-8 text-center">{index + 1}</span>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-200">{item.reason.replace(/_/g, ' ')}</h4>
                                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${(item.count / metrics.totalEscalations) * 100}%`,
                                                backgroundColor: COLORS[index % COLORS.length]
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-white">{item.count}</div>
                                    <div className="text-xs text-slate-500">count</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * ROI Section Container
 * ROI tracking, trend analysis, and forecasting
 */

import { useState } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { financialApi } from '../../../api/financialApi';
import { RoiGaugeWidget } from '../RoiGaugeWidget';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface RoiSectionContainerProps {
    projectId: string | null;
    startDate: string;
    endDate: string;
}

type Period = 'day' | 'week' | 'month';

export function RoiSectionContainer({ projectId }: RoiSectionContainerProps) {
    const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');

    const { data: historicalData, isLoading } = useQuery({
        queryKey: ['historical-roi', projectId],
        queryFn: async () => {
            if (!projectId) return null;
            return financialApi.getHistoricalRoi({
                projectId,
            });
        },
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000,
    });

    if (!projectId) {
        return (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center">
                <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Select a project to view ROI metrics</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-800 rounded w-1/3"></div>
                    <div className="h-64 bg-slate-800 rounded"></div>
                </div>
            </div>
        );
    }

    // Format historical data for charts
    const trendData = historicalData?.timeSeries.map(point => ({
        month: point.date.split('-').slice(1).join('/'), // MM/DD for label
        roi: point.roi,
        cost: parseFloat(point.cost),
        value: parseFloat(point.value)
    })) || [];

    // Calculate dynamic forecasts based on trend
    const calculateForecasts = () => {
        if (trendData.length < 2) return [
            { period: '30 days', roi: 0, confidence: 50 },
            { period: '60 days', roi: 0, confidence: 40 },
            { period: '90 days', roi: 0, confidence: 30 },
        ];

        const last = trendData[trendData.length - 1].roi;
        const prev = trendData[trendData.length - 2].roi;
        const trend = last - prev; // Daily/Weekly/Monthly trend depending on period

        return [
            { period: '30 days', roi: Math.round(last + trend), confidence: 85 },
            { period: '60 days', roi: Math.round(last + (trend * 2)), confidence: 70 },
            { period: '90 days', roi: Math.round(last + (trend * 3)), confidence: 55 },
        ];
    };

    const forecasts = calculateForecasts();

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600/10 border border-emerald-600/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        ROI Tracking
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Return on investment analysis and trends</p>
                </div>

                {/* Period Selector */}
                <div className="flex items-center gap-2">
                    {(['day', 'week', 'month'] as Period[]).map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${selectedPeriod === period
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                                }`}
                        >
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* ROI Gauge - Reuse existing component */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Current ROI</h3>
                <RoiGaugeWidget projectId={projectId} period={selectedPeriod} />
            </div>

            {/* ROI Trend Chart */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">ROI Trend Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
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
                        <Line type="monotone" dataKey="roi" name="ROI %" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Cost vs Value Comparison */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Cost vs Value Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
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
                        <Area type="monotone" dataKey="value" name="Value (USD)" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                        <Area type="monotone" dataKey="cost" name="Cost (USD)" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* ROI Forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {forecasts.map((forecast) => (
                    <div key={forecast.period} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-400 uppercase">{forecast.period} Forecast</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-2">{forecast.roi}%</div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-800 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${forecast.confidence}%` }}
                                />
                            </div>
                            <span className="text-xs text-slate-500">{forecast.confidence}% confidence</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

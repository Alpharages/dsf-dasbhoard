/**
 * Efficiency Section Container
 * AI model efficiency analysis and optimization recommendations
 */

import { Zap, Award, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { financialApi } from '../../../api/financialApi';
import { ModelEfficiencyTable } from '../ModelEfficiencyTable';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, BarChart, Bar, Legend } from 'recharts';

interface EfficiencySectionContainerProps {
    projectId: string | null;
    startDate: string;
    endDate: string;
}



export function EfficiencySectionContainer({ projectId, startDate, endDate }: EfficiencySectionContainerProps) {
    const { data: efficiencyData, isLoading } = useQuery({
        queryKey: ['model-efficiency', projectId, startDate, endDate],
        queryFn: async () => {
            if (!projectId) return null;
            return financialApi.getModelEfficiency({
                projectId,
                startDate,
                endDate,
            });
        },
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000,
    });

    if (!projectId) {
        return (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center">
                <Zap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Select a project to view model efficiency</p>
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

    const models = efficiencyData?.models || [];

    // Calculate efficiency score: weighted formula (cost 40%, success 40%, speed 20%)
    const modelsWithScore = models.map(model => ({
        ...model,
        efficiencyScore: (
            (100 - parseFloat(model.costPerExecution)) * 0.4 +
            model.successRate * 0.4 +
            (100 - model.avgExecutionTimeSec) * 0.2
        ).toFixed(1),
    })).sort((a, b) => parseFloat(b.efficiencyScore) - parseFloat(a.efficiencyScore));

    // Prepare scatter plot data (cost vs speed)
    const scatterData = models.map(model => ({
        name: model.modelName,
        cost: parseFloat(model.costPerExecution),
        time: model.avgExecutionTimeSec,
        executions: model.executionCount,
    }));

    // Prepare success rate comparison data
    const successRateData = models.map(model => ({
        model: model.modelName,
        success: model.successRate,
        selfHealing: model.selfHealingRate,
    }));

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600/10 border border-purple-600/20 rounded-xl flex items-center justify-center">
                            <Zap className="w-5 h-5 text-purple-500" />
                        </div>
                        Model Efficiency Analysis
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">AI model performance and cost optimization</p>
                </div>
            </div>

            {/* Efficiency Leaderboard */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-semibold text-white">Efficiency Leaderboard</h3>
                </div>
                <div className="space-y-3">
                    {modelsWithScore.slice(0, 5).map((model, index) => (
                        <div
                            key={model.modelName}
                            className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${index === 0 ? 'bg-amber-500/10 border border-amber-500/20' :
                                    index === 1 ? 'bg-slate-400/10 border border-slate-400/20' :
                                        index === 2 ? 'bg-orange-600/10 border border-orange-600/20' :
                                            'bg-slate-800'
                                    }`}>
                                    <span className={`text-lg font-bold ${index === 0 ? 'text-amber-500' :
                                        index === 1 ? 'text-slate-400' :
                                            index === 2 ? 'text-orange-600' :
                                                'text-slate-500'
                                        }`}>
                                        #{index + 1}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-white">{model.modelName}</div>
                                    <div className="text-xs text-slate-500">{model.provider}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-xs text-slate-500">Success Rate</div>
                                    <div className="text-sm font-semibold text-emerald-400">{model.successRate}%</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-500">Cost/Exec</div>
                                    <div className="text-sm font-semibold text-blue-400">${model.costPerExecution}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-500">Efficiency Score</div>
                                    <div className="text-lg font-bold text-white">{model.efficiencyScore}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Success Rate Comparison */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Success Rate Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={successRateData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="model" stroke="#94a3b8" fontSize={12} />
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
                        <Bar dataKey="success" name="Success Rate %" fill="#10b981" />
                        <Bar dataKey="selfHealing" name="Self-Healing %" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Cost-Speed Scatter Plot */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Cost-Speed Analysis</h3>
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
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500 rounded"></div>
                        <span>Fast & Cheap (Optimal)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500/20 border border-red-500 rounded"></div>
                        <span>Slow & Expensive (Review)</span>
                    </div>
                </div>
            </div>

            {/* Optimization Recommendation */}
            {efficiencyData?.recommendation && (
                <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-600/20 rounded-2xl p-6">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-600/20 border border-blue-600/30 rounded-xl flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Optimization Recommendation</h3>
                            <p className="text-slate-300 text-sm mb-3">{efficiencyData.recommendation.reason}</p>
                            <div className="flex items-center gap-4">
                                <div className="px-3 py-1.5 bg-blue-600/20 border border-blue-600/30 rounded-lg">
                                    <span className="text-xs font-semibold text-blue-400 uppercase">Most Efficient</span>
                                    <span className="text-sm text-white font-bold ml-2">{efficiencyData.recommendation.mostEfficient}</span>
                                </div>
                                <div className="px-3 py-1.5 bg-emerald-600/20 border border-emerald-600/30 rounded-lg">
                                    <span className="text-xs font-semibold text-emerald-400 uppercase">Potential Savings</span>
                                    <span className="text-sm text-white font-bold ml-2">${efficiencyData.recommendation.potentialSavings}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reuse existing Model Efficiency Table */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Detailed Model Metrics</h3>
                <ModelEfficiencyTable projectId={projectId} />
            </div>
        </div>
    );
}

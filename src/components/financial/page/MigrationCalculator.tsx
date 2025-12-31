/**
 * Migration Calculator
 * Calculate savings from switching AI models
 */

import { useState } from 'react';
import { ArrowRight, TrendingDown } from 'lucide-react';

interface MigrationCalculatorProps {
    models: Array<{
        modelName: string;
        costPerExecution: string;
        successRate: number;
        executionCount: number;
    }>;
}

export function MigrationCalculator({ models = [] }: MigrationCalculatorProps) {
    const [fromModel, setFromModel] = useState(models[0]?.modelName || '');
    const [toModel, setToModel] = useState(models[1]?.modelName || '');

    const calculateSavings = () => {
        const from = models.find(m => m.modelName === fromModel);
        const to = models.find(m => m.modelName === toModel);

        if (!from || !to) return null;

        const avgExecutions = (from.executionCount + to.executionCount) / 2;
        const costDiff = parseFloat(from.costPerExecution) - parseFloat(to.costPerExecution);
        const savingsPerExecution = costDiff;
        const monthlySavings = savingsPerExecution * avgExecutions;
        const annualSavings = monthlySavings * 12;
        const percentReduction = (costDiff / parseFloat(from.costPerExecution)) * 100;
        const successRateDelta = to.successRate - from.successRate;

        return {
            savingsPerExecution,
            monthlySavings,
            annualSavings,
            percentReduction,
            successRateDelta,
            riskLevel: Math.abs(successRateDelta) > 10 ? 'high' : Math.abs(successRateDelta) > 5 ? 'medium' : 'low',
        };
    };

    const savings = calculateSavings();

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Current Model</label>
                    <select
                        value={fromModel}
                        onChange={(e) => setFromModel(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-sm"
                    >
                        {models.map(model => (
                            <option key={model.modelName} value={model.modelName}>{model.modelName}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-end justify-center">
                    <ArrowRight className="w-6 h-6 text-slate-500 mb-2" />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Target Model</label>
                    <select
                        value={toModel}
                        onChange={(e) => setToModel(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-sm"
                    >
                        {models.map(model => (
                            <option key={model.modelName} value={model.modelName}>{model.modelName}</option>
                        ))}
                    </select>
                </div>
            </div>

            {savings && (
                <div className="bg-gradient-to-br from-emerald-600/10 to-blue-600/10 border border-emerald-600/20 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingDown className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-lg font-semibold text-white">Potential Savings</h3>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-slate-950/50 rounded-xl p-4">
                            <div className="text-xs text-slate-500 mb-1">Per Execution</div>
                            <div className="text-2xl font-bold text-emerald-400">
                                ${Math.abs(savings.savingsPerExecution).toFixed(4)}
                            </div>
                        </div>
                        <div className="bg-slate-950/50 rounded-xl p-4">
                            <div className="text-xs text-slate-500 mb-1">Monthly</div>
                            <div className="text-2xl font-bold text-emerald-400">
                                ${Math.abs(savings.monthlySavings).toFixed(2)}
                            </div>
                        </div>
                        <div className="bg-slate-950/50 rounded-xl p-4">
                            <div className="text-xs text-slate-500 mb-1">Annual</div>
                            <div className="text-2xl font-bold text-emerald-400">
                                ${Math.abs(savings.annualSavings).toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-slate-300">
                                Cost Reduction: <span className="font-bold text-emerald-400">{Math.abs(savings.percentReduction).toFixed(1)}%</span>
                            </div>
                            <div className="text-sm text-slate-300 mt-1">
                                Success Rate Change: <span className={`font-bold ${savings.successRateDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {savings.successRateDelta > 0 ? '+' : ''}{savings.successRateDelta.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${savings.riskLevel === 'low' ? 'bg-emerald-500/20 text-emerald-400' :
                                savings.riskLevel === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-red-500/20 text-red-400'
                            }`}>
                            {savings.riskLevel} risk
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

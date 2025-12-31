/**
 * Budget Scenarios Calculator
 * What-if calculator for burn rate changes
 */

import { Calculator, TrendingDown, TrendingUp } from 'lucide-react';

interface BudgetScenariosCalculatorProps {
    currentBurnRate: number;
    currentExhaustionDate: Date;
    budget: number;
}

export function BudgetScenariosCalculator({ currentBurnRate, currentExhaustionDate, budget }: BudgetScenariosCalculatorProps) {


    const calculateNewExhaustion = (changePercent: number) => {
        const newBurnRate = currentBurnRate * (1 + changePercent / 100);
        const daysRemaining = budget / newBurnRate;
        const newDate = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000);
        const daysDiff = Math.floor((newDate.getTime() - currentExhaustionDate.getTime()) / (24 * 60 * 60 * 1000));
        return { newDate, daysDiff, newBurnRate };
    };

    const scenarios = [
        { label: 'Optimistic (-20%)', change: -20, icon: TrendingDown, color: 'emerald' },
        { label: 'Realistic (-10%)', change: -10, icon: TrendingDown, color: 'green' },
        { label: 'Pessimistic (+15%)', change: 15, icon: TrendingUp, color: 'amber' },
        { label: 'Worst Case (+30%)', change: 30, icon: TrendingUp, color: 'red' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-white">Budget Scenarios</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenarios.map((scenario) => {
                    const result = calculateNewExhaustion(scenario.change);
                    const Icon = scenario.icon;

                    return (
                        <div
                            key={scenario.label}
                            className={`bg-slate-950 border border-${scenario.color}-500/20 rounded-xl p-4 hover:border-${scenario.color}-500/40 transition-all`}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <Icon className={`w-4 h-4 text-${scenario.color}-500`} />
                                <span className="text-sm font-semibold text-white">{scenario.label}</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">New Burn Rate</span>
                                    <span className={`text-sm font-bold text-${scenario.color}-400`}>
                                        ${result.newBurnRate.toFixed(2)}/day
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Exhaustion Date</span>
                                    <span className="text-sm font-semibold text-white">
                                        {result.newDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Days Impact</span>
                                    <span className={`text-sm font-bold ${result.daysDiff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {result.daysDiff > 0 ? '+' : ''}{result.daysDiff} days
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-4">
                <p className="text-sm text-blue-300">
                    💡 <strong>Tip:</strong> Reducing burn rate by 20% could extend your budget by {calculateNewExhaustion(-20).daysDiff} days.
                </p>
            </div>
        </div>
    );
}

import React from 'react';
import type { Ticket } from '../../api/decisionApi';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface Props {
    ticket: Ticket;
}

export const BudgetUtilizationWidget: React.FC<Props> = ({ ticket }) => {
    const budget = ticket.costStats?.projectBudget || 0;
    const currentSpend = ticket.costStats?.projectSpend || 0;
    const ticketCost = ticket.costStats?.totalCost || 0;

    const currentUtilization = budget > 0 ? (currentSpend / budget) * 100 : 0;
    const projectedSpend = currentSpend + ticketCost;
    const projectedUtilization = budget > 0 ? (projectedSpend / budget) * 100 : 0;

    const isOverBudget = projectedUtilization > 100;
    const isCritical = projectedUtilization > 90;

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-purple-600" />
                Budget Impact - {ticket.project.name}
            </h3>

            {/* Current State */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Current Utilization</span>
                    <span className="font-semibold">{currentUtilization.toFixed(1)}%</span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${Math.min(currentUtilization, 100)}%` }}
                    />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    ${currentSpend.toFixed(2)} / ${budget.toFixed(2)}
                </div>
            </div>

            {/* Projected State (if approved) */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">If Approved</span>
                    <span className={`font-semibold ${isCritical ? 'text-red-600' : 'text-green-600'}`}>
                        {projectedUtilization.toFixed(1)}%
                    </span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all ${isOverBudget ? 'bg-red-600' : isCritical ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                        style={{ width: `${Math.min(projectedUtilization, 100)}%` }}
                    />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    ${projectedSpend.toFixed(2)} / ${budget.toFixed(2)}
                </div>
            </div>

            {/* Impact Summary */}
            <div className={`p-3 rounded ${isCritical ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                <div className="flex items-start gap-2">
                    {isCritical && <AlertCircle size={16} className="text-red-600 mt-0.5" />}
                    <div className="text-sm">
                        <div className="font-semibold mb-1">
                            Utilization will go from {currentUtilization.toFixed(1)}% to {projectedUtilization.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">
                            Cost increase: +${ticketCost.toFixed(2)}
                        </div>
                        {isOverBudget && (
                            <div className="text-xs text-red-600 font-semibold mt-1">
                                ⚠️ This will exceed the project budget by ${(projectedSpend - budget).toFixed(2)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

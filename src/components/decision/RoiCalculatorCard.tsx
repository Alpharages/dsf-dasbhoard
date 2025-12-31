import React from 'react';
import type { Ticket } from '../../api/decisionApi';
import { TrendingUp, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface Props {
    ticket: Ticket;
}

export const RoiCalculatorCard: React.FC<Props> = ({ ticket }) => {
    const cost = ticket.costStats?.totalCost || 0;
    const budget = ticket.costStats?.projectBudget || 0;

    // Calculate estimated value (Story Points * $500 multiplier as default)
    // In production, this should come from project configuration
    const storyPoints = 5; // Placeholder - should come from ticket metadata
    const valueMultiplier = 500; // Default: $500 per story point
    const estimatedValue = storyPoints * valueMultiplier;

    const chartData = [
        { name: 'Cost', value: cost, fill: '#dc2626' },
        { name: 'Budget', value: budget, fill: '#e5e7eb' },
        { name: 'Value', value: estimatedValue, fill: '#16a34a' },
    ];

    const roi = cost > 0 ? ((estimatedValue - cost) / cost) * 100 : 0;

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" />
                ROI Analysis
            </h3>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Estimated Cost</div>
                    <div className="text-xl font-bold text-red-600">${cost.toFixed(2)}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Estimated Value</div>
                    <div className="text-xl font-bold text-green-600">${estimatedValue.toFixed(2)}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">ROI</div>
                    <div className={`text-xl font-bold ${roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {roi > 0 ? '+' : ''}{roi.toFixed(0)}%
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="value" name="Amount ($)">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Value Note */}
            <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                <Target size={12} />
                <span>Estimated at {storyPoints} story points × ${valueMultiplier} value multiplier</span>
            </div>
        </div>
    );
};

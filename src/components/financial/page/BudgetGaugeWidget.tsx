/**
 * Budget Gauge Widget
 * Large circular gauge showing budget utilization percentage
 */

import { Gauge } from 'lucide-react';

interface BudgetGaugeWidgetProps {
    utilizationPct: number;
    daysRemaining: number;
}

export function BudgetGaugeWidget({ utilizationPct, daysRemaining }: BudgetGaugeWidgetProps) {
    const getColor = () => {
        if (utilizationPct > 80) return { stroke: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-500' };
        if (utilizationPct > 50) return { stroke: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-500' };
        return { stroke: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-500' };
    };

    const color = getColor();
    const circumference = 2 * Math.PI * 80; // radius = 80
    const strokeDasharray = `${(utilizationPct / 100) * circumference} ${circumference}`;

    return (
        <div className="relative">
            <svg className="w-full" viewBox="0 0 200 120">
                {/* Background circle */}
                <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="16"
                />
                {/* Progress circle */}
                <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={color.stroke}
                    strokeWidth="16"
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                    className="transition-all duration-500"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '40%' }}>
                <div className={`flex items-center gap-2 mb-2 `}>
                    <Gauge className={`w-6 h-6 ${color.text}`} />
                </div>
                <div className="text-4xl font-bold text-white">{utilizationPct}%</div>
                <div className="text-sm text-slate-400 mt-1">{daysRemaining} days remaining</div>
            </div>
        </div>
    );
}

import React from 'react';
import { Gauge } from 'lucide-react';

interface UtilizationGaugeProps {
    utilization: number;
    activeTickets: number;
    maxTickets: number;
    title?: string;
}

export const UtilizationGauge: React.FC<UtilizationGaugeProps> = ({
    utilization,
    activeTickets,
    maxTickets,
    title = "Current Utilization"
}) => {
    const getColor = (percent: number) => {
        if (percent <= 60) return '#10b981'; // Green
        if (percent <= 80) return '#eab308'; // Yellow
        return '#ef4444'; // Red
    };

    const getTextColor = (percent: number) => {
        if (percent <= 60) return 'text-emerald-500';
        if (percent <= 80) return 'text-yellow-500';
        return 'text-rose-500';
    };

    // SVG parameters
    const r = 80;
    const circumference = 2 * Math.PI * r;
    const fillPercentage = Math.min(utilization, 100);
    const strokeDasharray = `${(fillPercentage / 100) * circumference} ${circumference}`;

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-blue-400" />
                    {title}
                </h3>
                <div className="text-xs font-bold text-slate-500 bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-700/50">
                    LIVE
                </div>
            </div>

            <div className="relative w-48 h-48 mb-6">
                <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
                    {/* Track */}
                    <circle
                        cx="100"
                        cy="100"
                        r={r}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="16"
                    />
                    {/* Progress */}
                    <circle
                        cx="100"
                        cy="100"
                        r={r}
                        fill="none"
                        stroke={getColor(utilization)}
                        strokeWidth="16"
                        strokeDasharray={strokeDasharray}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-black tracking-tight ${getTextColor(utilization)}`}>
                        {utilization.toFixed(0)}%
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-1">
                        Capacity
                    </span>
                </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 pt-6 border-t border-slate-800/50">
                <div className="text-center">
                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">Active</p>
                    <p className="text-xl font-bold text-white">{activeTickets}</p>
                </div>
                <div className="text-center border-l border-slate-800/50">
                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">Limit</p>
                    <p className="text-xl font-bold text-slate-300">{maxTickets}</p>
                </div>
            </div>

            {utilization > 80 && (
                <div className="mt-6 w-full py-2 px-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Burnout Risk Detected</span>
                </div>
            )}
        </div>
    );
};

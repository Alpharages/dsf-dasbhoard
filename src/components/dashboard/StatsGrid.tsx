import {
    BarChart3,
    Users,
    Clock,
    AlertTriangle
} from 'lucide-react';
import type { DashboardSummary } from '../../types';

interface StatsGridProps {
    summary?: DashboardSummary;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ summary }) => {
    const stats = [
        {
            label: 'Total Projects',
            value: summary?.total_projects || 0,
            icon: BarChart3,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
        },
        {
            label: 'Active Projects',
            value: summary?.active_projects || 0,
            icon: Users,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
        },
        {
            label: 'Team Utilization',
            value: `${summary?.utilization_percent || 0}%`,
            icon: Clock,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
        },
        {
            label: 'Blocked Tickets',
            value: summary?.blocked_tickets || 0,
            icon: AlertTriangle,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat) => (
                <div key={stat.label} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                    <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.bg} rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500`}></div>
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">{stat.label}</p>
                            <h4 className="text-3xl font-black text-slate-100 font-mono tracking-tighter">{stat.value}</h4>
                        </div>
                        <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl shadow-lg ring-1 ring-white/5`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

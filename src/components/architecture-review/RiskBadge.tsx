import React from 'react';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

import type { RiskFactors } from '../../types/architectureReview';

interface RiskBadgeProps {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    riskFactors?: RiskFactors;
    className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, riskFactors, className = '' }) => {
    const config = {
        HIGH: {
            color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
            icon: ShieldAlert,
            label: 'High Risk'
        },
        MEDIUM: {
            color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            icon: Shield,
            label: 'Medium Risk'
        },
        LOW: {
            color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            icon: ShieldCheck,
            label: 'Low Risk'
        }
    };

    const { color, icon: Icon, label } = config[level];

    const getTooltip = () => {
        if (!riskFactors) return undefined;
        const parts = [];
        if (riskFactors.scope) parts.push(`Scope: ${riskFactors.scope}`);
        if (riskFactors.reversibility) parts.push(`Reversibility: ${riskFactors.reversibility}`);
        if (riskFactors.domain_complexity) parts.push(`Complexity: ${riskFactors.domain_complexity}`);
        return parts.join(' • ');
    };

    return (
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${color} ${className} cursor-help`}
                >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                </span>
            </TooltipTrigger>
            {getTooltip() && (
                <TooltipContent>
                    <p>{getTooltip()}</p>
                </TooltipContent>
            )}
        </Tooltip>
    );
};

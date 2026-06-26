import React from 'react';
import { AlertTriangle, HelpCircle, ShieldAlert, Zap, AlertOctagon, HelpCircle as QuestionIcon, FileWarning } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

// Utility for class merging
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type EscalationReasonCode =
    | 'LOW_CONFIDENCE'
    | 'MISSING_CONTEXT'
    | 'CONFLICTING_REQUIREMENTS'
    | 'NO_BEST_PRACTICE'
    | 'SECURITY_CONCERN'
    | 'PERFORMANCE_TRADEOFF'
    | 'MULTIPLE_VALID_APPROACHES'
    | 'UNKNOWN';

interface EscalationBadgeProps {
    reasonCode: string;
    className?: string;
}

const REASON_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType; description: string }> = {
    LOW_CONFIDENCE: {
        label: 'Low Confidence',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
        icon: HelpCircle,
        description: 'AI logic yielded a confidence score below the required threshold.'
    },
    MISSING_CONTEXT: {
        label: 'Missing Context',
        color: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700',
        icon: QuestionIcon,
        description: 'Insufficient project information to make a deterministic decision.'
    },
    CONFLICTING_REQUIREMENTS: {
        label: 'Conflicting Reqs',
        color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
        icon: AlertTriangle,
        description: 'Detected requirements that contradict each other.'
    },
    NO_BEST_PRACTICE: {
        label: 'No Standard',
        color: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700',
        icon: AlertOctagon,
        description: 'No clear industry best practice found for this scenario.'
    },
    SECURITY_CONCERN: {
        label: 'Security Risk',
        color: 'bg-rose-100 text-rose-900 border-rose-400 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-700',
        icon: ShieldAlert,
        description: 'Potential security implications flagged for review.'
    },
    PERFORMANCE_TRADEOFF: {
        label: 'Perf Tradeoff',
        color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
        icon: Zap,
        description: 'Significant performance trade-offs detected.'
    },
    MULTIPLE_VALID_APPROACHES: {
        label: 'Multiple Options',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-700',
        icon: FileWarning,
        description: 'Several equally valid approaches identified.'
    },
    UNKNOWN: {
        label: 'Unknown',
        color: 'bg-muted text-muted-foreground border-border',
        icon: HelpCircle,
        description: 'Reason for escalation is not specified.'
    }
};

export const EscalationBadge: React.FC<EscalationBadgeProps> = ({ reasonCode, className }) => {
    const config = REASON_CONFIG[reasonCode] || REASON_CONFIG['UNKNOWN'];
    const Icon = config.icon;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-help transition-colors",
                        config.color,
                        className
                    )}>
                        <Icon className="w-3.5 h-3.5" />
                        {config.label}
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-xs text-xs">{config.description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

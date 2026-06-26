import React from 'react';
import { Brain, FileText, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

interface CapabilityEmptyStateProps {
    type: 'no-data' | 'no-capabilities' | 'no-limitations' | 'filter-empty';
    onAction?: () => void;
    actionLabel?: string;
}

export const CapabilityEmptyState: React.FC<CapabilityEmptyStateProps> = ({
    type,
    onAction,
    actionLabel
}) => {
    const states = {
        'no-data': {
            icon: Brain,
            iconBg: 'from-blue-500/20 to-indigo-500/20',
            iconColor: 'text-blue-400',
            title: 'No AI Performance Data Yet',
            description: 'Start processing tasks to see AI capability metrics and performance trends.',
            action: onAction,
            actionLabel: actionLabel || 'Go to Tasks'
        },
        'no-capabilities': {
            icon: Sparkles,
            iconBg: 'from-violet-500/20 to-purple-500/20',
            iconColor: 'text-violet-400',
            title: 'Capabilities Not Configured',
            description: 'Set up task type tracking to monitor AI performance across different categories.',
            action: onAction,
            actionLabel: actionLabel || 'Configure Capabilities'
        },
        'no-limitations': {
            icon: FileText,
            iconBg: 'from-emerald-500/20 to-teal-500/20',
            iconColor: 'text-emerald-400',
            title: 'No Limitations Documented',
            description: 'Document known AI limitations to help your team understand boundaries and workarounds.',
            action: onAction,
            actionLabel: actionLabel || 'Add First Limitation'
        },
        'filter-empty': {
            icon: AlertCircle,
            iconBg: 'from-amber-500/20 to-orange-500/20',
            iconColor: 'text-amber-400',
            title: 'No Results Match Your Filters',
            description: 'Try adjusting your filter criteria to see more results.',
            action: onAction,
            actionLabel: actionLabel || 'Clear Filters'
        }
    };

    const state = states[type];
    const Icon = state.icon;

    return (
        <div className="card-theme rounded-lg p-12 text-center">
            <div className="max-w-md mx-auto">
                {/* Animated Icon Container */}
                <div className="relative inline-block mb-6">
                    <div className={`
                        w-20 h-20 rounded-lg bg-gradient-to-br ${state.iconBg}
                        flex items-center justify-center relative overflow-hidden
                    `}>
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Icon */}
                        <Icon className={`w-10 h-10 ${state.iconColor} relative z-10`} />
                        
                        {/* Animated rings */}
                        <div className="absolute inset-0 rounded-lg border border-white/10 animate-ping opacity-20" style={{ animationDuration: '3s' }} />
                    </div>
                    
                    {/* Decorative dots */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)]" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)]" />
                </div>

                {/* Text Content */}
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                    {state.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] mb-6 leading-relaxed">
                    {state.description}
                </p>

                {/* Action Button */}
                {state.action && (
                    <button
                        onClick={state.action}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
                            bg-gradient-to-r from-blue-500 to-blue-600 text-white
                            hover:from-blue-600 hover:to-blue-700
                            transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30
                            active:scale-[0.98] group"
                    >
                        {state.actionLabel}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default CapabilityEmptyState;

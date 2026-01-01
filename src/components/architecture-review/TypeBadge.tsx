interface TypeBadgeProps {
    type: 'ALLOWED_TECH' | 'FORBIDDEN_TECH' | 'PATTERN' | 'STANDARD';
}

const typeConfig = {
    ALLOWED_TECH: {
        icon: '✅',
        label: 'Allowed Tech',
        className: 'bg-green-500/10 text-green-400 border-green-500/20'
    },
    FORBIDDEN_TECH: {
        icon: '❌',
        label: 'Forbidden Tech',
        className: 'bg-red-500/10 text-red-400 border-red-500/20'
    },
    PATTERN: {
        icon: '📐',
        label: 'Pattern',
        className: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    },
    STANDARD: {
        icon: '📋',
        label: 'Standard',
        className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    }
};

export function TypeBadge({ type }: TypeBadgeProps) {
    const config = typeConfig[type];

    return (
        <div className={`flex items-center gap-1 px-2 py-1 border rounded-lg text-xs font-bold ${config.className}`}>
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </div>
    );
}

interface ScopeBadgeProps {
    scope: 'GLOBAL' | 'PROJECT';
}

export function ScopeBadge({ scope }: ScopeBadgeProps) {
    if (scope === 'GLOBAL') {
        return (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold">
                <span>🌍</span>
                <span>Global</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-xs font-bold">
            <span>📁</span>
            <span>Project</span>
        </div>
    );
}

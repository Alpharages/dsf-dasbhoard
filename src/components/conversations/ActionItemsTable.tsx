import type { ActionItem } from '../../types/conversation';

interface ActionItemsTableProps {
    actionItems: ActionItem[];
}

export const ActionItemsTable: React.FC<ActionItemsTableProps> = ({ actionItems }) => {
    const priorityColors: Record<string, string> = {
        high: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        low: 'text-muted-foreground bg-muted/10 border-[var(--border-hover)]/20'
    };

    // Sort by priority
    const sortedItems = [...actionItems].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return (
        <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground mb-4">
                Action Items ({actionItems.length})
            </h3>

            <div className="space-y-2">
                {sortedItems.map((item) => (
                    <div
                        key={item.id}
                        className="bg-background/50 border border-border rounded-xl p-4 transition-all"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex-1">
                                <p className="text-foreground font-medium mb-2">{item.task}</p>
                                <div className="flex items-center gap-4 text-xs">
                                    <span className="text-muted-foreground">
                                        Owner: <span className="text-foreground font-medium">{item.owner}</span>
                                    </span>
                                    <span className="text-muted-foreground">
                                        Due: <span className="text-foreground font-medium">{new Date(item.due_date).toLocaleDateString()}</span>
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${priorityColors[item.priority]}`}>
                                        {item.priority}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

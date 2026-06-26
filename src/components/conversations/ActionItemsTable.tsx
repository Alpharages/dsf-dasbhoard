import { useState } from 'react';
import { Check } from 'lucide-react';
import type { ActionItem } from '../../types/conversation';

interface ActionItemsTableProps {
    actionItems: ActionItem[];
    onSelectionChange: (selectedIds: string[]) => void;
}

export const ActionItemsTable: React.FC<ActionItemsTableProps> = ({
    actionItems,
    onSelectionChange
}) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const handleToggle = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
        onSelectionChange(Array.from(newSelected));
    };

    const handleToggleAll = () => {
        if (selectedIds.size === actionItems.length) {
            setSelectedIds(new Set());
            onSelectionChange([]);
        } else {
            const allIds = new Set(actionItems.map((item) => item.id));
            setSelectedIds(allIds);
            onSelectionChange(Array.from(allIds));
        }
    };

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
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">
                    Action Items ({selectedIds.size} selected)
                </h3>
                <button
                    onClick={handleToggleAll}
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                >
                    {selectedIds.size === actionItems.length ? 'Deselect All' : 'Select All'}
                </button>
            </div>

            <div className="space-y-2">
                {sortedItems.map((item) => (
                    <div
                        key={item.id}
                        className={`bg-background/50 border rounded-xl p-4 transition-all ${selectedIds.has(item.id)
                                ? 'border-blue-500 bg-blue-500/5'
                                : 'border-border hover:border-border'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <button
                                onClick={() => handleToggle(item.id)}
                                className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedIds.has(item.id)
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'border-[var(--border-hover)] hover:border-blue-500'
                                    }`}
                            >
                                {selectedIds.has(item.id) && <Check className="w-3 h-3 text-white" />}
                            </button>

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

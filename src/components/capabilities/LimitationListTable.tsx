import React, { useState } from 'react';
import { Filter, Edit2, Eye, Layers } from 'lucide-react';
import type { Limitation, TaskType } from '../../types/capabilities';
import { TASK_TYPE_LABELS } from '../../types/capabilities';
import { CapabilityEmptyState } from './CapabilityEmptyState';

interface LimitationListTableProps {
    limitations: Limitation[];
    onEdit: (limitation: Limitation) => void;
    canEdit: boolean; // TL/ADMIN only
}

export const LimitationListTable: React.FC<LimitationListTableProps> = ({
    limitations,
    onEdit,
    canEdit
}) => {
    const [filterTaskType, setFilterTaskType] = useState<TaskType | 'ALL'>('ALL');
    const [showDisabledOnly, setShowDisabledOnly] = useState(false);

    const filteredLimitations = limitations.filter(lim => {
        if (filterTaskType !== 'ALL' && lim.taskType !== filterTaskType) return false;
        if (showDisabledOnly && !lim.isDisabled) return false;
        return true;
    });

    const taskTypes: TaskType[] = ['CODE_GENERATION', 'TEST_GENERATION', 'REFACTORING', 'DOCUMENTATION', 'ARCHITECTURE_REVIEW', 'BUG_FIX'];

    const getFailureRateColor = (rate: number) => {
        if (rate >= 50) return 'text-rose-400';
        if (rate >= 30) return 'text-amber-400';
        return 'text-emerald-400';
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="card-theme rounded-xl p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                    <Filter className="w-5 h-5" />
                    <span className="text-sm font-medium">Filters</span>
                </div>

                <select
                    value={filterTaskType}
                    onChange={(e) => setFilterTaskType(e.target.value as TaskType | 'ALL')}
                    className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                >
                    <option value="ALL">All Task Types</option>
                    {taskTypes.map(type => (
                        <option key={type} value={type}>{TASK_TYPE_LABELS[type]}</option>
                    ))}
                </select>

                <label className="flex items-center gap-2.5 text-sm text-[var(--color-text-secondary)] cursor-pointer hover:text-[var(--color-text-primary)] transition-colors">
                    <input
                        type="checkbox"
                        checked={showDisabledOnly}
                        onChange={(e) => setShowDisabledOnly(e.target.checked)}
                        className="w-4 h-4 rounded bg-[var(--color-bg-secondary)] border-[var(--color-border)] text-blue-500 focus:ring-blue-500/50"
                    />
                    Show disabled only
                </label>

                <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
                    <Layers className="w-4 h-4" />
                    <span>{filteredLimitations.length} of {limitations.length}</span>
                </div>
            </div>

            {/* Table */}
            {filteredLimitations.length === 0 ? (
                <CapabilityEmptyState 
                    type="filter-empty"
                    onAction={() => {
                        setFilterTaskType('ALL');
                        setShowDisabledOnly(false);
                    }}
                    actionLabel="Clear Filters"
                />
            ) : (
                <div className="card-theme rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                                    <th className="px-5 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                                        Task Type
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                                        Failure Rate
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                                        Known Issues
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                                        Workaround
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-5 py-4 text-right text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {filteredLimitations.map((lim) => (
                                    <tr
                                        key={lim.taskType}
                                        className="bg-[var(--color-surface)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                                    >
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                {TASK_TYPE_LABELS[lim.taskType]}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`
                                                    w-2 h-2 rounded-full
                                                    ${lim.failureRate >= 50 ? 'bg-rose-400' : lim.failureRate >= 30 ? 'bg-amber-400' : 'bg-emerald-400'}
                                                `} />
                                                <span className={`font-bold ${getFailureRateColor(lim.failureRate)}`}>
                                                    {lim.failureRate.toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 max-w-xs">
                                            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
                                                {lim.knownIssues || '-'}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 max-w-xs">
                                            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
                                                {lim.workaround || '-'}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4">
                                            {lim.isDisabled ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                                    Disabled
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                    Enabled
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={() => onEdit(lim)}
                                                className={`
                                                    inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                                    ${canEdit
                                                        ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/10'
                                                        : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] cursor-not-allowed border border-[var(--color-border)]'
                                                    }
                                                `}
                                                disabled={!canEdit}
                                            >
                                                {canEdit ? <Edit2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                {canEdit ? 'Edit' : 'View'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

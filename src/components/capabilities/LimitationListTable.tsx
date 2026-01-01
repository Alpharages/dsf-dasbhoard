import React, { useState } from 'react';
import { Filter, AlertTriangle, Edit2, Eye } from 'lucide-react';
import type { Limitation, TaskType } from '../../types/capabilities';
import { TASK_TYPE_LABELS } from '../../types/capabilities';

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

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <Filter className="w-5 h-5 text-slate-400" />

                <select
                    value={filterTaskType}
                    onChange={(e) => setFilterTaskType(e.target.value as TaskType | 'ALL')}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="ALL">All Task Types</option>
                    {taskTypes.map(type => (
                        <option key={type} value={type}>{TASK_TYPE_LABELS[type]}</option>
                    ))}
                </select>

                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showDisabledOnly}
                        onChange={(e) => setShowDisabledOnly(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500"
                    />
                    Show disabled only
                </label>

                <div className="ml-auto text-sm text-slate-400">
                    {filteredLimitations.length} of {limitations.length} limitations
                </div>
            </div>

            {/* Table */}
            {filteredLimitations.length === 0 ? (
                <div className="bg-slate-800/30 rounded-xl p-12 text-center border border-slate-700/50">
                    <AlertTriangle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">No limitations match your filters</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-800/50 border-b border-slate-700">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                    Task Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                    Failure Rate
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                    Known Issues
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                    Workaround
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredLimitations.map((lim) => (
                                <tr
                                    key={lim.taskType}
                                    className="bg-slate-800/20 hover:bg-slate-800/40 transition-colors"
                                >
                                    <td className="px-4 py-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                            {TASK_TYPE_LABELS[lim.taskType]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`font-semibold ${lim.failureRate >= 50 ? 'text-red-400' :
                                                lim.failureRate >= 30 ? 'text-yellow-400' :
                                                    'text-green-400'
                                            }`}>
                                            {lim.failureRate.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 max-w-xs">
                                        <p className="text-sm text-slate-300 truncate">
                                            {lim.knownIssues || '-'}
                                        </p>
                                    </td>
                                    <td className="px-4 py-4 max-w-xs">
                                        <p className="text-sm text-slate-300 truncate">
                                            {lim.workaround || '-'}
                                        </p>
                                    </td>
                                    <td className="px-4 py-4">
                                        {lim.isDisabled ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-300 border border-red-500/20">
                                                🚫 Disabled
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-300 border border-green-500/20">
                                                ✅ Enabled
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button
                                            onClick={() => onEdit(lim)}
                                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${canEdit
                                                    ? 'bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/20'
                                                    : 'bg-slate-700/30 text-slate-400 cursor-not-allowed'
                                                }`}
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
            )}
        </div>
    );
};

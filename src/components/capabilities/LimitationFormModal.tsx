import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import type { Limitation, TaskType, LimitationFormData } from '../../types/capabilities';
import { TASK_TYPE_LABELS } from '../../types/capabilities';

interface LimitationFormModalProps {
    limitation?: Limitation; // If provided, edit mode
    onSave: (data: LimitationFormData) => void;
    onClose: () => void;
    isLoading?: boolean;
}

export const LimitationFormModal: React.FC<LimitationFormModalProps> = ({
    limitation,
    onSave,
    onClose,
    isLoading = false
}) => {
    const isEditMode = !!limitation;
    const [formData, setFormData] = useState<LimitationFormData>({
        taskType: limitation?.taskType || 'CODE_GENERATION',
        knownIssues: limitation?.knownIssues || '',
        workaround: limitation?.workaround || '',
        isDisabled: limitation?.isDisabled || false,
    });
    const [showPreview, setShowPreview] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const taskTypes: TaskType[] = ['CODE_GENERATION', 'TEST_GENERATION', 'REFACTORING', 'DOCUMENTATION', 'ARCHITECTURE_REVIEW', 'BUG_FIX'];

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.knownIssues || formData.knownIssues.trim().length < 10) {
            newErrors.knownIssues = 'Description must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-slate-700 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-white">
                        {isEditMode ? 'Edit Limitation' : 'Add New Limitation'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        disabled={isLoading}
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Task Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Task Type <span className="text-red-400">*</span>
                        </label>
                        <select
                            value={formData.taskType}
                            onChange={(e) => setFormData({ ...formData, taskType: e.target.value as TaskType })}
                            disabled={isEditMode} // Can't change task type in edit mode
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {taskTypes.map(type => (
                                <option key={type} value={type}>{TASK_TYPE_LABELS[type]}</option>
                            ))}
                        </select>
                    </div>

                    {/* Known Issues */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-300">
                                Known Issues <span className="text-red-400">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPreview(!showPreview)}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                                {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                {showPreview ? 'Edit' : 'Preview'}
                            </button>
                        </div>

                        {showPreview ? (
                            <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 min-h-[120px] prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown>{formData.knownIssues || '*No content*'}</ReactMarkdown>
                            </div>
                        ) : (
                            <textarea
                                value={formData.knownIssues}
                                onChange={(e) => setFormData({ ...formData, knownIssues: e.target.value })}
                                placeholder="Describe the limitation (Markdown supported)..."
                                rows={5}
                                className={`w-full bg-slate-700/50 border ${errors.knownIssues ? 'border-red-500' : 'border-slate-600'} rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                        )}
                        {errors.knownIssues && (
                            <p className="mt-1 text-sm text-red-400">{errors.knownIssues}</p>
                        )}
                    </div>

                    {/* Workaround */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Workaround (Optional)
                        </label>
                        <textarea
                            value={formData.workaround}
                            onChange={(e) => setFormData({ ...formData, workaround: e.target.value })}
                            placeholder="Describe the manual workaround steps..."
                            rows={4}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Disable AI Toggle */}
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isDisabled}
                                        onChange={(e) => setFormData({ ...formData, isDisabled: e.target.checked })}
                                        className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-red-500 focus:ring-red-500"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-white">Disable AI for this task type</span>
                                        <p className="text-xs text-slate-400 mt-1">
                                            AI will skip tasks of this type. Use this for known severe limitations.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700 bg-slate-800/50">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-6 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Saving...' : isEditMode ? 'Update Limitation' : 'Add Limitation'}
                    </button>
                </div>
            </div>
        </div>
    );
};

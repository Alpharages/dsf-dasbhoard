import React, { useState } from 'react';
import { decisionApi } from '../../api/decisionApi';
import type { Ticket } from '../../api/decisionApi';
import { Check, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
    ticket: Ticket;
    onClose: () => void;
    onDecisionMade: () => void;
}

export const DecisionActionDialog: React.FC<Props> = ({ ticket, onClose, onDecisionMade }) => {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (decision: 'APPROVE' | 'REJECT' | 'OVERRIDE') => {
        if (!reason.trim() && decision !== 'APPROVE') {
            toast.error('Please provide a reason for this decision');
            return;
        }

        setIsSubmitting(true);
        try {
            if (decision === 'OVERRIDE') {
                // Use separate override endpoint
                await decisionApi.submitOverride(ticket.id, reason);
            } else {
                await decisionApi.submitDecision(ticket.id, { decision, reason });
            }
            toast.success(`Ticket ${decision}ed successfully`);
            onDecisionMade();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to submit decision');
        } finally {
            setIsSubmitting(false);
        }
    };

    const budget = ticket.costStats?.projectBudget || 0;
    const spend = ticket.costStats?.projectSpend || 0;
    const blockCost = ticket.costStats?.totalCost || 0;
    const newSpend = spend + blockCost;
    const utilization = budget > 0 ? (spend / budget) * 100 : 0;
    const newUtilization = budget > 0 ? (newSpend / budget) * 100 : 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                <h2 className="text-2xl font-bold mb-4">Decision Required</h2>

                {/* Ticket Info */}
                <div className="bg-gray-50 p-4 rounded mb-4">
                    <div className="font-semibold">{ticket.title}</div>
                    <div className="text-sm text-gray-600">Task ID: {ticket.clickup_task_id}</div>
                    <div className="text-sm text-gray-600">Project: {ticket.project.name}</div>
                </div>

                {/* Budget Impact */}
                <div className="mb-4">
                    <h3 className="font-semibold mb-2">Budget Impact</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-gray-600">Current Utilization</div>
                            <div className="text-2xl font-bold">{utilization.toFixed(1)}%</div>
                            <div className="text-xs text-gray-500">${spend.toFixed(2)} / ${budget.toFixed(2)}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">If Approved</div>
                            <div className={`text-2xl font-bold ${newUtilization > 90 ? 'text-red-600' : 'text-green-600'}`}>
                                {newUtilization.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">${newSpend.toFixed(2)} / ${budget.toFixed(2)}</div>
                        </div>
                    </div>
                    <div className="mt-2 text-sm font-medium text-red-600">
                        Cost of this ticket: ${blockCost.toFixed(2)}
                    </div>
                </div>

                {/* Reason Input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                        Reason / Comment <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full border rounded p-2 h-24"
                        placeholder="Explain your decision..."
                        disabled={isSubmitting}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded hover:bg-gray-50"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => handleSubmit('REJECT')}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                        disabled={isSubmitting}
                    >
                        <X size={16} /> Reject
                    </button>
                    <button
                        onClick={() => handleSubmit('APPROVE')}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                        disabled={isSubmitting}
                    >
                        <Check size={16} /> Approve
                    </button>
                    <button
                        onClick={() => handleSubmit('OVERRIDE')}
                        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 flex items-center gap-2"
                        disabled={isSubmitting}
                        title="Manager Only - Force approve over budget"
                    >
                        <AlertTriangle size={16} /> Override
                    </button>
                </div>
            </div>
        </div>
    );
};

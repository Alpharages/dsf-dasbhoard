/**
 * Approval Decision Panel
 * PM can Approve, Reject, Rework, or Escalate an execution
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import type { ApprovalDecision } from '../../types/approval';
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  ArrowUpRight,
  MessageSquare,
  Loader2,
} from 'lucide-react';

interface ApprovalDecisionPanelProps {
  onSubmit: (decision: ApprovalDecision, reasoning: string) => void;
  isSubmitting: boolean;
}

const decisionOptions: {
  value: ApprovalDecision;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: {
    active: string;
    iconBg: string;
    button: string;
  };
  requiresReason: boolean;
}[] = [
  {
    value: 'APPROVE',
    label: 'Approve & Push',
    description: 'Code will be committed and pushed to GitHub',
    icon: <CheckCircle className="w-6 h-6" />,
    color: {
      active: 'bg-emerald-500/10 border-emerald-500 text-emerald-500',
      iconBg: 'bg-emerald-500 text-white',
      button: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20',
    },
    requiresReason: false,
  },
  {
    value: 'REWORK',
    label: 'Request Rework',
    description: 'Send back to AI with feedback for re-generation',
    icon: <RotateCcw className="w-6 h-6" />,
    color: {
      active: 'bg-amber-500/10 border-amber-500 text-amber-500',
      iconBg: 'bg-amber-500 text-white',
      button: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20',
    },
    requiresReason: true,
  },
  {
    value: 'REJECT',
    label: 'Reject',
    description: 'Mark execution as failed — no code will be pushed',
    icon: <XCircle className="w-6 h-6" />,
    color: {
      active: 'bg-rose-500/10 border-rose-500 text-rose-500',
      iconBg: 'bg-rose-500 text-white',
      button: 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20',
    },
    requiresReason: true,
  },
  {
    value: 'ESCALATE',
    label: 'Escalate',
    description: 'Send to a senior reviewer for further evaluation',
    icon: <ArrowUpRight className="w-6 h-6" />,
    color: {
      active: 'bg-indigo-500/10 border-indigo-500 text-indigo-500',
      iconBg: 'bg-indigo-500 text-white',
      button: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20',
    },
    requiresReason: true,
  },
];

export const ApprovalDecisionPanel: React.FC<ApprovalDecisionPanelProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const [selectedDecision, setSelectedDecision] =
    useState<ApprovalDecision>('APPROVE');
  const [reasoning, setReasoning] = useState('');

  const activeOption = decisionOptions.find(
    (o) => o.value === selectedDecision,
  )!;
  const needsReason = activeOption.requiresReason;
  const canSubmit = !needsReason || reasoning.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;
    onSubmit(selectedDecision, reasoning);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Decision Options */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {decisionOptions.map((option) => {
          const isActive = selectedDecision === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedDecision(option.value)}
              className={`flex flex-col items-center gap-3 p-5 rounded-lg border-2 transition-all duration-200 ${
                isActive
                  ? option.color.active
                  : 'bg-card border-border text-muted-foreground hover:border-muted-foreground/50'
              }`}
            >
              <div
                className={`p-3 rounded-xl transition-colors ${
                  isActive ? option.color.iconBg : 'bg-muted'
                }`}
              >
                {option.icon}
              </div>
              <div className="text-center">
                <span className="font-bold text-sm block">{option.label}</span>
                <span className="text-[10px] text-muted-foreground leading-tight block mt-1">
                  {option.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Reasoning / Feedback */}
      <div
        className={`space-y-3 transition-all duration-300 ${
          needsReason
            ? 'opacity-100 max-h-[400px]'
            : 'opacity-60 max-h-[400px]'
        }`}
      >
        <label
          htmlFor="reasoning"
          className="text-sm font-bold text-muted-foreground flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          {needsReason ? 'Feedback (Required)' : 'Notes (Optional)'}
        </label>
        <textarea
          id="reasoning"
          className="w-full min-h-[120px] bg-background border border-border rounded-xl p-4 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"
          placeholder={
            selectedDecision === 'APPROVE'
              ? 'Add any notes for the audit trail (optional)...'
              : selectedDecision === 'REWORK'
                ? 'Describe what the AI should fix or improve...'
                : selectedDecision === 'REJECT'
                  ? 'Explain why this execution is being rejected...'
                  : 'Provide context for the escalation...'
          }
          value={reasoning}
          onChange={(e) => setReasoning(e.target.value)}
          required={needsReason}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className={`h-14 px-10 rounded-lg font-extrabold text-lg shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-foreground ${activeOption.color.button}`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            `Submit ${activeOption.label}`
          )}
        </Button>
      </div>
    </form>
  );
};

import React, { useState } from 'react';
import type { QaReviewDecision } from '../../types/qa-review';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CheckCircle, AlertTriangle, RotateCcw, MessageSquare } from 'lucide-react';

interface QaDecisionFormProps {
  onSubmit: (decision: QaReviewDecision) => void;
  isSubmitting?: boolean;
}

export const QaDecisionForm: React.FC<QaDecisionFormProps> = ({ onSubmit, isSubmitting }) => {
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | 'REWORK'>('APPROVED');
  const [severity, setSeverity] = useState<'MAJOR' | 'MINOR' | 'CRITICAL' | 'BLOCKER'>('MAJOR');
  const [guidance, setGuidance] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (decision === 'APPROVED') {
      onSubmit({ decision: 'APPROVED', notes });
    } else {
      onSubmit({
        decision: 'REJECTED',
        severity,
        remediation_guidance: guidance,
        notes
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setDecision('APPROVED')}
          className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
            decision === 'APPROVED' 
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
          }`}
        >
          <div className={`p-3 rounded-xl ${decision === 'APPROVED' ? 'bg-emerald-500 text-white' : 'bg-slate-800'}`}>
            <CheckCircle className="w-6 h-6" />
          </div>
          <span className="font-bold">Approve Production</span>
        </button>

        <button
          type="button"
          onClick={() => setDecision('REJECTED')}
          className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
            decision === 'REJECTED' 
              ? 'bg-rose-500/10 border-rose-500 text-rose-500' 
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
          }`}
        >
          <div className={`p-3 rounded-xl ${decision === 'REJECTED' ? 'bg-rose-500 text-white' : 'bg-slate-800'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <span className="font-bold">Reject & Escalate</span>
        </button>

        <button
          type="button"
          onClick={() => setDecision('REWORK')}
          className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
            decision === 'REWORK' 
              ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
          }`}
        >
          <div className={`p-3 rounded-xl ${decision === 'REWORK' ? 'bg-amber-500 text-white' : 'bg-slate-800'}`}>
            <RotateCcw className="w-6 h-6" />
          </div>
          <span className="font-bold">Request Rework</span>
        </button>
      </div>

      <div className="space-y-6">
        {decision !== 'APPROVED' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <Label htmlFor="severity" className="text-sm font-bold text-slate-400">Escalation Severity</Label>
              <Select value={severity} onValueChange={(v: any) => setSeverity(v)}>
                <SelectTrigger id="severity" className="bg-slate-900 border-slate-800 rounded-xl h-12 text-slate-100">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <SelectItem value="BLOCKER">Blocker - Production Stop</SelectItem>
                  <SelectItem value="CRITICAL">Critical - Immediate Fix Required</SelectItem>
                  <SelectItem value="MAJOR">Major - Needs Fixing before Release</SelectItem>
                  <SelectItem value="MINOR">Minor - Improvements Recommended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guidance" className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Remediation Guidance
              </Label>
              <textarea
                id="guidance"
                className="w-full min-h-[120px] bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                placeholder="Provide specific feedback or steps for remediation (Markdown supported)..."
                value={guidance}
                onChange={(e) => setGuidance(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-bold text-slate-400">Internal Audit Notes</Label>
          <textarea
            id="notes"
            className="w-full min-h-[80px] bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            placeholder="Add internal notes for the review audit trail..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className={`h-14 px-10 rounded-2xl font-extrabold text-lg shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${
            decision === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' :
            decision === 'REJECTED' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20' :
            'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20'
          }`}
        >
          {isSubmitting ? 'Submitting...' : `Submit ${decision.charAt(0) + decision.slice(1).toLowerCase()}`}
        </Button>
      </div>
    </form>
  );
};

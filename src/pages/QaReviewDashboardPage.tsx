import React, { useState } from 'react';
import { useQaReview } from '../hooks/useQaReview';
import { QaReviewQueueTable } from '../components/qa-review/QaReviewQueueTable';
import { RequirementContext } from '../components/qa-review/RequirementContext';
import { CodeDiffViewer } from '../components/qa-review/CodeDiffViewer';
import { QaDecisionForm } from '../components/qa-review/QaDecisionForm';
import type { QaReviewSample, QaReviewDecision } from '../types/qa-review';
import { 
  ShieldCheck, 
  BarChart3, 
  AlertCircle, 
  Clock, 
  ChevronRight,
  ArrowLeft,
  Search,
  Filter as FilterIcon
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

export const LeadQaReviewDashboardPage: React.FC = () => {
  const { useQueue, useSampleDetail, useWorkloadSummary, useSubmitDecision } = useQaReview();
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: queue = [], isLoading: isQueueLoading } = useQueue();
  const { data: summary } = useWorkloadSummary();
  const { data: selectedSample } = useSampleDetail(selectedSampleId);
  const submitDecision = useSubmitDecision();

  const handleReview = (sample: QaReviewSample) => {
    setSelectedSampleId(sample.id);
  };

  const handleBack = () => {
    setSelectedSampleId(null);
  };

  const handleSubmit = async (decision: QaReviewDecision) => {
    if (!selectedSampleId) return;
    await submitDecision.mutateAsync({ id: selectedSampleId, decision });
    setSelectedSampleId(null);
  };

  const filteredQueue = queue.filter(item => 
    item.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ticket_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.project_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedSampleId && selectedSample) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
        <div className="flex items-center justify-between border-b border-slate-800/50 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="p-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{selectedSample.project_name}</span>
                <ChevronRight className="w-4 h-4 text-slate-700" />
                <span className="text-sm font-bold text-blue-500">{selectedSample.ticket_id}</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{selectedSample.ticket_title}</h1>
            </div>
          </div>
          <div className="flex gap-3">
             <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
               <span className="text-xs font-bold text-slate-500 uppercase">AI Quality</span>
               <span className={`text-xl font-mono font-black ${
                 (selectedSample.ai_quality_score || 0) >= 85 ? 'text-emerald-500' : 'text-amber-500'
               }`}>
                 {selectedSample.ai_quality_score}%
               </span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <RequirementContext 
              title="Ticket Requirements" 
              description={selectedSample.ticket_description || 'No requirements provided.'} 
            />
            
            <Card className="bg-slate-900/50 border-slate-800 rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-800/50 py-4 px-6">
                <CardTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Automated QA Validation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Linting Status</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${selectedSample.qa_summary?.linting_passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {selectedSample.qa_summary?.linting_passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Unit Tests</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${selectedSample.qa_summary?.tests_passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {selectedSample.qa_summary?.tests_passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Test Coverage</span>
                  <span className="text-sm font-mono text-slate-200 font-bold">{selectedSample.qa_summary?.test_coverage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Security Score</span>
                  <span className="text-sm font-mono text-slate-200 font-bold">{selectedSample.qa_summary?.security_score}/100</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-8 space-y-8">
            <CodeDiffViewer diffs={selectedSample.diffs} />
            
            <div className="pt-8 border-t border-slate-800/50">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
                QA Review Decision
              </h3>
              <QaDecisionForm onSubmit={handleSubmit} isSubmitting={submitDecision.isPending} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-blue-500" />
            Lead QA Review
          </h1>
          <p className="text-slate-500 font-medium">
            Verify AI-generated implementations and approve production deployments.
          </p>
        </div>

        <div className="flex items-center gap-4">
           {summary && (
             <>
               <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
                 <div className="p-1.5 bg-blue-500/10 rounded-lg">
                   <Clock className="w-3.5 h-3.5 text-blue-400" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-slate-500 uppercase">Avg Review</span>
                   <span className="text-sm font-bold text-slate-200">{summary.summary.avg_review_time_minutes}m</span>
                 </div>
               </div>
               <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
                 <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                   < ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-slate-500 uppercase">SLA Success</span>
                   <span className="text-sm font-bold text-slate-200">{summary.summary.sla_compliance_percent}%</span>
                 </div>
               </div>
             </>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900/40 border-slate-800 rounded-2xl">
          <CardContent className="p-6">
             <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Search className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Queue Depth</span>
             </div>
             <div className="text-3xl font-black text-white mb-1">{summary?.queue_health?.current_depth || 0}</div>
             <p className="text-xs text-slate-500">Reviews awaiting verification</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800 rounded-2xl">
          <CardContent className="p-6">
             <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-amber-500/10 rounded-xl">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wait Time</span>
             </div>
             <div className="text-3xl font-black text-white mb-1">{summary?.queue_health?.oldest_pending_hours || 0}h</div>
             <p className="text-xs text-slate-500">Oldest pending sample</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800 rounded-2xl">
          <CardContent className="p-6">
             <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Throughput</span>
             </div>
             <div className="text-3xl font-black text-white mb-1">{summary?.summary?.total_reviews_completed || 0}</div>
             <p className="text-xs text-slate-500">Completed this period</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800 rounded-2xl">
          <CardContent className="p-6">
             <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-rose-500/10 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">At Risk</span>
             </div>
             <div className="text-3xl font-black text-white mb-1 font-mono text-rose-500">{summary?.queue_health?.at_risk_count || 0}</div>
             <p className="text-xs text-slate-500 font-bold">Approaching SLA breach</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <h2 className="text-2xl font-extrabold text-white">Review Queue</h2>
           
           <div className="flex items-center gap-4">
              <div className="relative group w-full md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search tickets or projects..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-400 hover:text-white transition-all">
                <FilterIcon className="w-4 h-4" />
                Filter
              </button>
           </div>
        </div>

        <QaReviewQueueTable 
          data={filteredQueue} 
          onReview={handleReview} 
          isLoading={isQueueLoading} 
        />
      </div>
    </div>
  );
};
